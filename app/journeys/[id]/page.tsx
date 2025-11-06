import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { addJourneyUpdate } from "./actions"

export default async function JourneyDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  const { data: journey } = await supabase
    .from("journeys")
    .select("*, template:journey_templates(*), user:users(*)")
    .eq("id", params.id)
    .single()

  if (!journey) redirect("/my-journeys")

  // Only allow the owner to view their journey
  if (journey.user_id !== user.id) redirect("/my-journeys")

  // Get journey updates (posts related to this journey)
  const { data: updates } = await supabase
    .from("posts")
    .select("*")
    .eq("journey_id", params.id)
    .order("created_at", { ascending: false })

  const goalValue = journey.goal_value || 0
  const currentValue = journey.current_value || 0
  const progress = goalValue > 0 ? (currentValue / goalValue) * 100 : 0
  const isCompleted = !!journey.completed_at

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      <div className="bg-gradient-to-r from-[#c89a6b] to-[#8b5b3e] px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">{journey.template?.title}</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Journey Progress Card */}
        <div className="mb-6 rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="text-5xl">
              {journey.template?.title === "Save Money" && "💰"}
              {journey.template?.title === "Boost My Rating" && "⭐"}
              {journey.template?.title === "Build My Network" && "🤝"}
              {isCompleted && "🏆"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#5a3c2e]">{journey.template?.title}</h2>
              <p className="text-sm text-[#8b5b3e]">{journey.visibility === "PRIVATE" ? "🔒 Private" : "🌍 Public"}</p>
            </div>
          </div>

          {!isCompleted && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#5a3c2e]">
                  {currentValue} / {goalValue} {journey.goal_unit}
                </p>
                <span className="text-xl font-bold text-[#5a3c2e]">{Math.round(progress)}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c89a6b] to-[#8b5b3e] transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </>
          )}

          {isCompleted && (
            <div className="rounded-2xl bg-white/60 p-4 text-center">
              <p className="text-xl font-bold text-[#5a3c2e]">Journey Completed!</p>
              <p className="text-sm text-[#8b5b3e]">Congratulations on reaching your goal!</p>
            </div>
          )}
        </div>

        {/* Add Update Form */}
        {!isCompleted && (
          <div className="mb-6 rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-[#5a3c2e]">Add Update</h3>
            <form action={addJourneyUpdate} className="space-y-4">
              <input type="hidden" name="journeyId" value={journey.id} />
              <input type="hidden" name="visibility" value={journey.visibility} />

              <div>
                <label htmlFor="progress" className="mb-2 block text-sm font-semibold text-[#5a3c2e]">
                  Update Progress
                </label>
                <input
                  type="number"
                  id="progress"
                  name="progress"
                  min={currentValue}
                  max={goalValue}
                  step="0.01"
                  defaultValue={currentValue}
                  required
                  className="w-full rounded-2xl border-4 border-[#8b5b3e] bg-white px-4 py-3 text-[#5a3c2e] placeholder-[#8b5b3e]/50 focus:outline-none focus:ring-2 focus:ring-[#c89a6b]"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-[#5a3c2e]">
                  Share Your Progress (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="What did you accomplish? How are you feeling?"
                  className="w-full rounded-2xl border-4 border-[#8b5b3e] bg-white px-4 py-3 text-[#5a3c2e] placeholder-[#8b5b3e]/50 focus:outline-none focus:ring-2 focus:ring-[#c89a6b]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-[#c89a6b] to-[#8b5b3e] px-6 py-3 font-bold text-white shadow-lg transition-transform active:scale-95"
              >
                Post Update
              </button>
            </form>
          </div>
        )}

        {/* Journey Updates */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#5a3c2e]">Updates</h3>
          {updates && updates.length > 0 ? (
            updates.map((update) => (
              <div key={update.id} className="rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-4 shadow-lg">
                <p className="mb-2 whitespace-pre-wrap text-[#5a3c2e]">{update.body}</p>
                <p className="text-xs text-[#8b5b3e]">
                  {new Date(update.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-8 text-center shadow-lg">
              <p className="text-[#8b5b3e]">No updates yet. Share your first progress update!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
