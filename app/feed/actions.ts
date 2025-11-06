"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkAndAwardBadges } from "@/lib/badge-checker"

export async function createComment(postId: string, body: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  if (!body.trim()) {
    return { success: false, error: "Comment cannot be empty" }
  }

  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        body: body.trim(),
      })
      .select()
      .single()

    if (error) throw error

    await checkAndAwardBadges(user.id)

    revalidatePath("/feed")
    return { success: true, comment }
  } catch (error: any) {
    console.error("[v0] Error creating comment:", error)
    return { success: false, error: error.message }
  }
}
