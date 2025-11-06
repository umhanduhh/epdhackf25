import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Settings, MapPin, Smile } from "lucide-react"
import Image from "next/image"

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/auth")

  const { data: user } = await supabase.from("users").select("*").eq("id", authUser.id).maybeSingle()

  if (!user || !user.handle) redirect("/profile/setup")

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", authUser.id)
    .order("earned_at", { ascending: false })

  const { data: verifications } = await supabase
    .from("verifications")
    .select("*, platform:platforms(*)")
    .eq("user_id", authUser.id)
    .eq("status", "approved")

  const { data: journeys } = await supabase
    .from("journeys")
    .select("*, template:journey_templates(*)")
    .eq("user_id", authUser.id)
    .order("started_at", { ascending: false })

  const { data: connections } = await supabase
    .from("connections")
    .select(`
      id,
      friend_id,
      friend:users!connections_friend_id_fkey(id, handle, name, avatar_url)
    `)
    .eq("user_id", authUser.id)
    .eq("status", "accepted")
    .limit(8)

  const activeJourneys = journeys?.filter((j) => !j.completed_at).length || 0
  const completedJourneys = journeys?.filter((j) => j.completed_at).length || 0

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      {/* MySpace-style Header */}
      <div className="bg-gradient-to-r from-[#c89a6b] to-[#8b5b3e] px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">My Profile</h1>
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform active:scale-95"
            >
              <Settings className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* MySpace-style Profile Card */}
        <div className="mb-6 rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-6 shadow-2xl">
          <div className="mb-6 flex items-start gap-4">
            <Avatar className="h-24 w-24 border-4 border-[#8b5b3e] shadow-xl">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#c89a6b] to-[#8b5b3e] text-3xl text-white">
                {user?.name?.[0] || authUser.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="mb-1 text-2xl font-bold text-[#5a3c2e]">{user?.name || "Anonymous"}</h2>
              <p className="mb-2 text-sm text-[#8b5b3e]">@{user?.handle || "user"}</p>
              {user?.location && (
                <div className="flex items-center gap-1 text-sm text-[#8b5b3e]">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
            </div>
          </div>

          {/* Mood */}
          {user?.mood && (
            <div className="mb-4 rounded-2xl bg-white/60 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Smile className="h-4 w-4 text-[#8b5b3e]" />
                <span className="font-semibold text-[#5a3c2e]">Mood:</span>
                <span className="text-[#8b5b3e]">{user.mood}</span>
              </div>
            </div>
          )}

          {/* About Me */}
          {user?.bio && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-bold text-[#5a3c2e]">About Me</h3>
              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-sm text-[#5a3c2e]">{user.bio}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/60 p-3 text-center">
              <div className="mb-1 text-2xl">🎯</div>
              <p className="text-xl font-bold text-[#5a3c2e]">{activeJourneys}</p>
              <p className="text-xs text-[#8b5b3e]">Active</p>
            </div>
            <div className="rounded-2xl bg-white/60 p-3 text-center">
              <div className="mb-1 text-2xl">✅</div>
              <p className="text-xl font-bold text-[#5a3c2e]">{completedJourneys}</p>
              <p className="text-xs text-[#8b5b3e]">Complete</p>
            </div>
            <div className="rounded-2xl bg-white/60 p-3 text-center">
              <div className="mb-1 text-2xl">🏆</div>
              <p className="text-xl font-bold text-[#5a3c2e]">{userBadges?.length || 0}</p>
              <p className="text-xs text-[#8b5b3e]">Badges</p>
            </div>
          </div>

          {journeys && journeys.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#5a3c2e]">My Journeys</h3>
                <Link href="/my-journeys" className="text-sm font-medium text-[#8b5b3e] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {journeys.slice(0, 3).map((journey) => {
                  const goalValue = journey.goal_value || 0
                  const currentValue = journey.current_value || 0
                  const progress = goalValue > 0 ? (currentValue / goalValue) * 100 : 0
                  const isCompleted = !!journey.completed_at

                  return (
                    <Link
                      key={journey.id}
                      href={`/journeys/${journey.id}`}
                      className="block rounded-2xl bg-white/60 p-3 transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {journey.template?.title === "Save Money" && "💰"}
                          {journey.template?.title === "Boost My Rating" && "⭐"}
                          {journey.template?.title === "Build My Network" && "🤝"}
                          {isCompleted && "🏆"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#5a3c2e]">{journey.template?.title}</p>
                            {journey.visibility === "PRIVATE" && <span className="text-xs">🔒</span>}
                          </div>
                          {!isCompleted && (
                            <p className="text-xs text-[#8b5b3e]">
                              {currentValue} / {goalValue} {journey.goal_unit}
                            </p>
                          )}
                          {isCompleted && <p className="text-xs text-[#8b5b3e]">Completed!</p>}
                        </div>
                        {!isCompleted && (
                          <span className="text-sm font-bold text-[#5a3c2e]">{Math.round(progress)}%</span>
                        )}
                      </div>
                      {!isCompleted && (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#c89a6b] to-[#8b5b3e] transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Verified Platforms */}
          {verifications && verifications.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-bold text-[#5a3c2e]">Verified Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {verifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="rounded-xl bg-white/60 px-3 py-1.5 text-sm font-medium text-[#5a3c2e]"
                  >
                    ✓ {verification.platform.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {connections && connections.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#5a3c2e]">Top Friends ({connections.length})</h3>
                <Link href="/friends" className="text-sm font-medium text-[#8b5b3e] hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {connections.slice(0, 8).map((connection) => (
                  <Link
                    key={connection.id}
                    href={`/profile/${connection.friend.handle}`}
                    className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-2 transition-transform hover:scale-105"
                  >
                    <Avatar className="h-12 w-12 border-2 border-[#8b5b3e]">
                      <AvatarImage src={connection.friend.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#c89a6b] to-[#8b5b3e] text-sm text-white">
                        {connection.friend.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-1 text-center text-xs font-medium text-[#5a3c2e]">
                      {connection.friend.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Badges Section */}
          {userBadges && userBadges.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#5a3c2e]">My Badges</h3>
                <Link href="/badges" className="text-sm font-medium text-[#8b5b3e] hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {userBadges.slice(0, 4).map((userBadge) => (
                  <div key={userBadge.id} className="flex flex-col items-center rounded-2xl bg-white/60 p-3">
                    <div className="mb-1 text-2xl">🏆</div>
                    <p className="text-center text-xs font-bold text-[#5a3c2e]">{userBadge.badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {(!userBadges || userBadges.length === 0) &&
          (!verifications || verifications.length === 0) &&
          activeJourneys === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-12 text-center shadow-2xl">
              <Image
                src="/mascot.png"
                alt="Start your journey"
                width={150}
                height={150}
                className="mb-4 drop-shadow-lg"
              />
              <h3 className="mb-2 text-xl font-bold text-[#5a3c2e]">Start Your Journey</h3>
              <p className="mb-6 text-sm text-[#8b5b3e]">Begin tracking your progress and earning badges!</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/journeys"
                  className="rounded-2xl bg-[#c89a6b] px-8 py-3 font-bold text-white shadow-lg transition-transform active:scale-95"
                >
                  Browse Journeys
                </Link>
                <Link
                  href="/verify"
                  className="rounded-2xl bg-[#8b5b3e] px-8 py-3 font-bold text-white shadow-lg transition-transform active:scale-95"
                >
                  Verify Platform
                </Link>
              </div>
            </div>
          )}
      </main>

      <BottomNav />
    </div>
  )
}
