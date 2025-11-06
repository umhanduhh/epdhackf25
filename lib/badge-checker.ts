import { getSupabaseServerClient } from "./supabase/server"

export async function checkAndAwardBadges(userId: string) {
  const supabase = await getSupabaseServerClient()

  // Get all badges
  const { data: badges } = await supabase.from("badges").select("*")
  if (!badges) return

  // Get user's existing badges
  const { data: userBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId)

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

  // Check each badge criteria
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue

    const criteria = badge.criteria_json
    let shouldAward = false
    const source: "PLATFORM" | "JOURNEY" | "COMMUNITY" = badge.source || "COMMUNITY"

    switch (criteria.type) {
      case "post_count": {
        const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId)
        shouldAward = (count || 0) >= criteria.threshold
        break
      }

      case "journey_count": {
        const { count } = await supabase
          .from("journeys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
        shouldAward = (count || 0) >= criteria.threshold
        break
      }

      case "completed_journey_count": {
        const { count } = await supabase
          .from("journeys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("completed_at", "is", null)
        shouldAward = (count || 0) >= criteria.threshold
        break
      }

      case "verification_count": {
        const { count } = await supabase
          .from("verifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "approved")
        shouldAward = (count || 0) >= criteria.threshold
        break
      }

      case "comment_count": {
        const { count } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
        shouldAward = (count || 0) >= criteria.threshold
        break
      }

      case "reaction_received_count": {
        const { data: userPosts } = await supabase.from("posts").select("id").eq("user_id", userId)

        if (userPosts && userPosts.length > 0) {
          const { count } = await supabase
            .from("reactions")
            .select("*", { count: "exact", head: true })
            .in(
              "post_id",
              userPosts.map((p) => p.id),
            )
          shouldAward = (count || 0) >= criteria.threshold
        }
        break
      }
    }

    if (shouldAward) {
      await supabase.from("user_badges").insert({
        user_id: userId,
        badge_id: badge.id,
        source,
        meta_json: {},
      })
    }
  }
}
