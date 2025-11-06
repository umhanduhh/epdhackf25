"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAndAwardBadges } from "@/lib/badge-checker"

export async function updateJourneyProgress(formData: FormData) {
  const journeyId = formData.get("journeyId") as string
  const currentValue = Number.parseFloat(formData.get("currentValue") as string)
  const message = formData.get("message") as string
  const goalValue = Number.parseFloat(formData.get("goalValue") as string)

  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  // Update journey progress
  const progress = goalValue > 0 ? (currentValue / goalValue) * 100 : 0
  const completed = progress >= 100

  const { data: previousJourney } = await supabase.from("journeys").select("completed_at").eq("id", journeyId).single()

  const wasNotCompleted = !previousJourney?.completed_at
  const isNowCompleted = completed

  const { error: journeyError } = await supabase
    .from("journeys")
    .update({
      current_value: currentValue,
      progress,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", journeyId)
    .eq("user_id", user.id)

  if (journeyError) {
    console.error("[v0] Error updating journey:", journeyError)
    return { error: "Failed to update journey" }
  }

  // Create a post if message is provided
  if (message && message.trim()) {
    const { data: journey } = await supabase.from("journeys").select("visibility").eq("id", journeyId).single()

    await supabase.from("posts").insert({
      user_id: user.id,
      journey_id: journeyId,
      body: message,
      visibility: journey?.visibility || "PRIVATE",
      tags: [],
    })
  }

  if (wasNotCompleted && isNowCompleted) {
    await checkAndAwardBadges(user.id)
  }

  revalidatePath("/my-journeys")
  revalidatePath("/feed")
  return { success: true }
}
