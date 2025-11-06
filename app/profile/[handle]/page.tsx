import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NavBar } from "@/components/nav-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, CheckCircle2, Award, Target } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ProfileActions } from "@/components/profile-actions"

export default async function PublicProfilePage({ params }: { params: { handle: string } }) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect("/auth")

  // Fetch user by handle
  const { data: user } = await supabase.from("users").select("*").eq("handle", params.handle).single()

  if (!user) notFound()

  // Check if viewing own profile
  const isOwnProfile = user.id === authUser.id

  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", authUser.id)
    .eq("friend_id", user.id)
    .eq("status", "accepted")
    .maybeSingle()

  const { data: block } = await supabase
    .from("blocks")
    .select("*")
    .eq("user_id", authUser.id)
    .eq("blocked_user_id", user.id)
    .maybeSingle()

  const isConnected = !!connection
  const isBlocked = !!block

  // Fetch user's badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(6)

  // Fetch verified platforms
  const { data: verifications } = await supabase
    .from("verifications")
    .select("*, platform:platforms(*)")
    .eq("user_id", user.id)
    .eq("status", "approved")

  // Fetch journey stats
  const { data: journeys } = await supabase
    .from("journeys")
    .select("*")
    .eq("user_id", user.id)
    .eq("visibility", "PUBLIC")

  const activeJourneys = journeys?.filter((j) => !j.completed_at).length || 0
  const completedJourneys = journeys?.filter((j) => j.completed_at).length || 0

  return (
    <div className="min-h-screen bg-muted/30">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="mb-1 text-2xl font-bold">{user.name}</h1>
                <p className="mb-2 text-muted-foreground">@{user.handle}</p>
                {user.bio && <p className="mb-3 text-sm">{user.bio}</p>}
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </div>
                </div>
                {!isOwnProfile && (
                  <div className="mt-4">
                    <ProfileActions
                      userId={user.id}
                      isConnected={isConnected}
                      isBlocked={isBlocked}
                      userHandle={user.handle}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeJourneys}</p>
                <p className="text-sm text-muted-foreground">Active Journeys</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedJourneys}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userBadges?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verified Platforms */}
        {verifications && verifications.length > 0 && (
          <Card className="mb-6 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Verified Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {verifications.map((verification) => (
                  <Badge key={verification.id} variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {verification.platform.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Badges */}
        {userBadges && userBadges.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userBadges.map((userBadge) => (
                  <div key={userBadge.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{userBadge.badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(userBadge.earned_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
