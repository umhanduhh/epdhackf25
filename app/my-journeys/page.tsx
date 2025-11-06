"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Compass, Sparkles, Trophy, TrendingUp } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { updateJourneyProgress } from "./actions"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Journey {
  id: string
  goal_value: number
  goal_unit: string
  current_value: number
  visibility: string
  completed_at: string | null
  template?: {
    title: string
  }
}

export default function MyJourneysPage() {
  const router = useRouter()
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function loadJourneys() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      const { data } = await supabase
        .from("journeys")
        .select(`
          *,
          template:journey_templates(*)
        `)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })

      setJourneys(data || [])
      setLoading(false)
    }

    loadJourneys()
  }, [router, supabase])

  const activeJourneys = journeys.filter((j) => !j.completed_at)
  const completedJourneys = journeys.filter((j) => j.completed_at)

  const handleUpdateClick = (journey: Journey, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedJourney(journey)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateJourneyProgress(formData)

    if (result.success) {
      setIsModalOpen(false)
      setSelectedJourney(null)
      // Reload journeys
      const { data } = await supabase
        .from("journeys")
        .select(`
          *,
          template:journey_templates(*)
        `)
        .order("started_at", { ascending: false })
      setJourneys(data || [])
    }

    setIsSubmitting(false)
  }

  const getInputLabel = (title: string) => {
    if (title === "Save Money") return "Current Savings ($)"
    if (title === "Boost My Rating") return "Current Rating"
    if (title === "Build My Network") return "Current Connections"
    return "Current Progress"
  }

  const getInputPlaceholder = (title: string) => {
    if (title === "Save Money") return "e.g., 1500"
    if (title === "Boost My Rating") return "e.g., 4.8"
    if (title === "Build My Network") return "e.g., 25"
    return "Enter value"
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#B8DDD8]">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#A8CDD8] to-[#B8DDD8] px-4 pb-8 pt-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">My Journeys</h1>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {journeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white/90 p-12 text-center shadow-lg">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
              <Compass className="h-10 w-10 text-purple-500" />
            </div>
            <p className="mb-2 text-xl font-bold text-gray-800">No journeys yet!</p>
            <p className="mb-6 text-sm text-gray-600">Start your first adventure to track your progress</p>
            <Button
              asChild
              className="rounded-2xl bg-purple-500 px-8 py-6 text-lg font-bold text-white shadow-lg hover:bg-purple-600"
            >
              <Link href="/journeys">Browse Journeys</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeJourneys.length > 0 && (
              <div className="rounded-3xl bg-white/90 p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                      <Compass className="h-5 w-5 text-teal-600" />
                    </div>
                    <span className="text-lg font-bold text-gray-800">Active Journeys ({activeJourneys.length})</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeJourneys.map((journey) => {
                    const goalValue = journey.goal_value || 0
                    const currentValue = journey.current_value || 0
                    const progress = goalValue > 0 ? (currentValue / goalValue) * 100 : 0

                    return (
                      <div
                        key={journey.id}
                        className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-md"
                      >
                        <Link href={`/journeys/${journey.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                              {journey.template?.title === "Save Money" && "💰"}
                              {journey.template?.title === "Boost My Rating" && "⭐"}
                              {journey.template?.title === "Build My Network" && "🤝"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">{journey.template?.title}</h3>
                                {journey.visibility === "PRIVATE" && <span className="text-xs">🔒</span>}
                              </div>
                              <p className="text-sm text-gray-600">
                                {currentValue} / {goalValue} {journey.goal_unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-700">{Math.round(progress)}%</span>
                              <Sparkles className="h-5 w-5 text-yellow-500" />
                            </div>
                          </div>
                          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/50">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </Link>
                        <Button
                          onClick={(e) => handleUpdateClick(journey, e)}
                          className="mt-3 w-full rounded-xl bg-[#8b5b3e] font-bold text-white hover:bg-[#6d4730]"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Update Progress
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {completedJourneys.length > 0 && (
              <div className="rounded-3xl bg-white/90 p-4 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">Completed</span>
                </div>
                <div className="space-y-3">
                  {completedJourneys.map((journey) => (
                    <div
                      key={journey.id}
                      className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 p-4 shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                          🏆
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{journey.template?.title}</h3>
                          <p className="text-sm text-gray-600">Completed!</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-4 border-[#8b5b3e] bg-gradient-to-br from-[#f9e2a3] to-[#f3d9b8] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#5a3c2e]">Update Your Progress</DialogTitle>
          </DialogHeader>

          {selectedJourney && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="journeyId" value={selectedJourney.id} />
              <input type="hidden" name="goalValue" value={selectedJourney.goal_value} />

              <div className="rounded-2xl border-3 border-[#8b5b3e] bg-white/80 p-4">
                <Label htmlFor="currentValue" className="text-sm font-bold text-[#5a3c2e]">
                  {getInputLabel(selectedJourney.template?.title || "")}
                </Label>
                <Input
                  id="currentValue"
                  name="currentValue"
                  type="number"
                  step="0.01"
                  defaultValue={selectedJourney.current_value}
                  placeholder={getInputPlaceholder(selectedJourney.template?.title || "")}
                  required
                  className="mt-2 border-2 border-[#8b5b3e] text-lg"
                />
              </div>

              <div className="rounded-2xl border-3 border-[#8b5b3e] bg-white/80 p-4">
                <Label htmlFor="message" className="text-sm font-bold text-[#5a3c2e]">
                  Share an update (optional)
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell your community about your progress..."
                  className="mt-2 min-h-[100px] border-2 border-[#8b5b3e]"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#8b5b3e] py-6 text-lg font-bold text-white hover:bg-[#6d4730]"
              >
                {isSubmitting ? "Updating..." : "Update Progress"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
