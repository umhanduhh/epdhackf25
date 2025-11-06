"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendConnectionRequest(friendId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if already connected or pending
  const { data: existing } = await supabase
    .from("connections")
    .select("*")
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Connection already exists" }
  }

  const { error } = await supabase.from("connections").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "accepted", // Auto-accept for simplicity
  })

  if (error) {
    console.error("[v0] Connection request error:", error)
    return { success: false, error: error.message }
  }

  // Create reciprocal connection
  await supabase.from("connections").insert({
    user_id: friendId,
    friend_id: user.id,
    status: "accepted",
  })

  revalidatePath(`/profile/${friendId}`)
  return { success: true }
}

export async function removeConnection(friendId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Remove both directions
  await supabase
    .from("connections")
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

  revalidatePath(`/profile/${friendId}`)
  return { success: true }
}

export async function blockUser(blockedUserId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Remove any existing connections
  await supabase
    .from("connections")
    .delete()
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${blockedUserId}),and(user_id.eq.${blockedUserId},friend_id.eq.${user.id})`,
    )

  // Add block
  const { error } = await supabase.from("blocks").insert({
    user_id: user.id,
    blocked_user_id: blockedUserId,
  })

  if (error) {
    console.error("[v0] Block user error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/profile/${blockedUserId}`)
  return { success: true }
}

export async function unblockUser(blockedUserId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("blocks").delete().eq("user_id", user.id).eq("blocked_user_id", blockedUserId)

  if (error) {
    console.error("[v0] Unblock user error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/profile/${blockedUserId}`)
  return { success: true }
}
