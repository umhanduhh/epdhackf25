"use server"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function addJourneyUpdate(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const journeyId = formData.get("journeyId") as string
  const progress = Number.parseFloat(formData.get("progress") as string)
  const message = formData.get("message") as string
  const visibility = formData.get("visibility") as string

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // Get the journey to check ownership and get details
  const { data: journey } = await supabase
    .from("journeys")
    .select("*, template:journey_templates(*)")
    .eq("id", journeyId)
    .single()

  if (!journey || journey.user_id !== user.id) return

  // Update journey progress
  const goalValue = journey.goal_value || 0
  const progressPercent = goalValue > 0 ? (progress / goalValue) * 100 : 0
  const isCompleted = progress >= goalValue

  await supabase
    .from("journeys")
    .update({
      current_value: progress,
      progress: progressPercent,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", journeyId)

  // Create a post if there's a message or if the journey is public
  if (message || visibility === "PUBLIC") {
    const postBody =
      message ||
      `Made progress on my ${journey.template?.title} journey! ${progress} / ${goalValue} ${journey.goal_unit}`

    await supabase.from("posts").insert({
      user_id: user.id,
      body: postBody,
      journey_id: journeyId,
      visibility: visibility,
    })
  }

  redirect(`/journeys/${journeyId}`)
}
