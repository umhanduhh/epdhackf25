import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { BadgesList } from "@/components/badges-list"
import { redirect } from "next/navigation"

export default async function BadgesPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch user's earned badge IDs
  const { data: userBadgeRecords } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at, id")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("name")

  // Create a map of earned badges with their details
  const earnedBadgeIds = new Set(userBadgeRecords?.map((ub) => ub.badge_id) || [])

  // Combine user badge records with badge details
  const userBadges =
    userBadgeRecords
      ?.map((ub) => {
        const badge = allBadges?.find((b) => b.id === ub.badge_id)
        return {
          id: ub.id,
          badge_id: ub.badge_id,
          earned_at: ub.earned_at,
          badge: badge!,
        }
      })
      .filter((ub) => ub.badge) || []

  // Filter out badges the user already has
  const availableBadges = allBadges?.filter((badge) => !earnedBadgeIds.has(badge.id)) || []

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      <div className="sticky top-0 z-40 bg-[#c89a6b] px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-[#5a3c2e]">Badges</h1>
          <p className="text-sm text-[#5a3c2e]/80">Earn badges by completing goals</p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <BadgesList userBadges={userBadges} availableBadges={availableBadges} />
      </main>

      <BottomNav />
    </div>
  )
}
