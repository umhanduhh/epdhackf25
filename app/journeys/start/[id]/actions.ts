"use server"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAndAwardBadges } from "@/lib/badge-checker"

export async function startJourney(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const templateId = formData.get("templateId") as string
  const goalValue = Number.parseFloat(formData.get("goalValue") as string)
  const goalUnit = formData.get("goalUnit") as string
  const visibility = (formData.get("visibility") as string) || "PUBLIC"

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: template } = await supabase.from("journey_templates").select("*").eq("id", templateId).single()

  // Create the journey
  const { data: journey, error } = await supabase
    .from("journeys")
    .insert({
      user_id: user.id,
      template_id: templateId,
      goal_value: goalValue,
      goal_unit: goalUnit,
      current_value: 0,
      progress: 0,
      visibility: visibility,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating journey:", error)
    return
  }

  if (visibility === "PUBLIC" && journey && template) {
    await supabase.from("posts").insert({
      user_id: user.id,
      body: `Just started a new journey: ${template.title}! My goal is ${goalValue} ${goalUnit}. Wish me luck!`,
      journey_id: journey.id,
      visibility: "PUBLIC",
    })
  }

  await checkAndAwardBadges(user.id)

  redirect("/my-journeys")
}
