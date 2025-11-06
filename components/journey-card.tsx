"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Lock } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Journey, Milestone } from "@/lib/types/database"

interface JourneyCardProps {
  journey: Journey & {
    template: { title: string; category: string }
    milestones: Milestone[]
  }
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const router = useRouter()
  const [milestones, setMilestones] = useState(journey.milestones)
  const [loading, setLoading] = useState(false)

  const completedCount = milestones.filter((m) => m.status === "DONE").length
  const progress = Math.round((completedCount / milestones.length) * 100)

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (milestone.status === "LOCKED") return

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const newStatus = milestone.status === "DONE" ? "IN_PROGRESS" : "DONE"

      const { error } = await supabase
        .from("milestones")
        .update({
          status: newStatus,
          completed_at: newStatus === "DONE" ? new Date().toISOString() : null,
        })
        .eq("id", milestone.id)

      if (error) throw error

      // Update local state
      const updatedMilestones = milestones.map((m) =>
        m.id === milestone.id
          ? { ...m, status: newStatus, completed_at: newStatus === "DONE" ? new Date().toISOString() : null }
          : m,
      )
      setMilestones(updatedMilestones)

      // Unlock next milestone if this one is completed
      if (newStatus === "DONE") {
        const nextMilestone = updatedMilestones.find(
          (m) => m.sequence === milestone.sequence + 1 && m.status === "LOCKED",
        )
        if (nextMilestone) {
          await supabase.from("milestones").update({ status: "IN_PROGRESS" }).eq("id", nextMilestone.id)

          setMilestones(updatedMilestones.map((m) => (m.id === nextMilestone.id ? { ...m, status: "IN_PROGRESS" } : m)))
        }
      }

      // Update journey progress
      const newCompletedCount = updatedMilestones.filter((m) => m.status === "DONE").length
      const newProgress = Math.round((newCompletedCount / updatedMilestones.length) * 100)

      await supabase
        .from("journeys")
        .update({
          progress: newProgress,
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
        })
        .eq("id", journey.id)

      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error updating milestone:", err)
      alert("Failed to update milestone")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex flex-col rounded-2xl">
      <CardHeader>
        <Badge className="mb-2 w-fit">{journey.template.category.replace("_", " ")}</Badge>
        <CardTitle className="text-xl">{journey.title_override || journey.template.title}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {milestones
            .sort((a, b) => a.sequence - b.sequence)
            .map((milestone) => {
              const Icon = milestone.status === "DONE" ? CheckCircle2 : milestone.status === "LOCKED" ? Lock : Circle

              return (
                <li key={milestone.id}>
                  <button
                    onClick={() => handleToggleMilestone(milestone)}
                    disabled={loading || milestone.status === "LOCKED"}
                    className="flex w-full items-start gap-2 text-left text-sm transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${milestone.status === "DONE" ? "text-primary" : ""}`} />
                    <span className={milestone.status === "DONE" ? "line-through" : ""}>{milestone.title}</span>
                  </button>
                </li>
              )
            })}
        </ul>
      </CardContent>
      {journey.completed_at && (
        <CardFooter>
          <Badge variant="secondary" className="w-full justify-center">
            Completed
          </Badge>
        </CardFooter>
      )}
    </Card>
  )
}
