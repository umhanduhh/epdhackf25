"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadBadgeVerification(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const badgeId = formData.get("badgeId") as string
  const file = formData.get("screenshot") as File

  if (!file || !badgeId) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    // Get badge details
    const { data: badge } = await supabase.from("badges").select("*").eq("id", badgeId).single()

    if (!badge) {
      return { success: false, error: "Badge not found" }
    }

    // Upload screenshot to Vercel Blob
    const blob = await put(`verification-${user.id}-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    const platformName = badge.code
      .replace("_verified", "")
      .replace(/_/g, ".")
      .replace(/\b\w/g, (l) => l.toUpperCase())

    // Find or create platform
    let { data: platform } = await supabase
      .from("platforms")
      .select("*")
      .ilike("name", platformName.replace(/\./g, " "))
      .single()

    if (!platform) {
      const { data: newPlatform } = await supabase
        .from("platforms")
        .insert({
          name: platformName.replace(/\./g, " "),
          slug: badge.code.replace("_verified", ""),
        })
        .select()
        .single()
      platform = newPlatform
    }

    if (!platform) {
      return { success: false, error: "Could not create platform" }
    }

    // Create verification record with auto-approval
    const { error: verificationError } = await supabase.from("verifications").insert({
      user_id: user.id,
      platform_id: platform.id,
      image_url: blob.url,
      status: "approved", // Auto-approve since user uploaded screenshot
      reviewed_at: new Date().toISOString(),
    })

    if (verificationError) {
      return { success: false, error: verificationError.message }
    }

    const { error: badgeError } = await supabase.from("user_badges").insert({
      user_id: user.id,
      badge_id: badge.id,
      source: "PLATFORM",
      meta_json: { verification_image: blob.url },
    })

    if (badgeError && !badgeError.message.includes("duplicate")) {
      console.error("[v0] Error awarding badge:", badgeError)
    }

    revalidatePath("/badges")
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("[v0] Badge verification error:", error)
    return { success: false, error: "Failed to upload verification" }
  }
}
