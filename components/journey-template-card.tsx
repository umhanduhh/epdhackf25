"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Star } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { JourneyTemplate } from "@/lib/types/database"

interface JourneyTemplateCardProps {
  template: JourneyTemplate
}

const categoryColors: Record<string, string> = {
  FINANCIAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PROFESSIONAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  WELLNESS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  SOCIAL: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  PERSONAL_GROWTH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  COMMUNITY_IMPACT: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
}

export function JourneyTemplateCard({ template }: JourneyTemplateCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartJourney = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Create journey
      const { data: journey, error: journeyError } = await supabase
        .from("journeys")
        .insert({
          user_id: user.id,
          template_id: template.id,
          visibility: "PUBLIC",
          progress: 0,
        })
        .select()
        .single()

      if (journeyError) throw journeyError

      // Create milestones
      const milestones = template.default_milestones.map((title, index) => ({
        journey_id: journey.id,
        title,
        sequence: index,
        status: index === 0 ? "IN_PROGRESS" : "LOCKED",
      }))

      const { error: milestonesError } = await supabase.from("milestones").insert(milestones)

      if (milestonesError) throw milestonesError

      router.push("/my-journeys")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error starting journey:", err)
      alert("Failed to start journey")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex flex-col rounded-2xl">
      <CardHeader>
        <div className="mb-2 flex items-start justify-between">
          <Badge className={categoryColors[template.category]}>{template.category.replace("_", " ")}</Badge>
          {template.is_featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        </div>
        <CardTitle className="text-xl">{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <p className="text-sm font-medium">Milestones:</p>
          <ul className="space-y-1">
            {template.default_milestones.slice(0, 3).map((milestone, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{milestone}</span>
              </li>
            ))}
            {template.default_milestones.length > 3 && (
              <li className="text-sm text-muted-foreground">+{template.default_milestones.length - 3} more</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartJourney} disabled={loading} className="w-full">
          {loading ? "Starting..." : "Start Journey"}
        </Button>
      </CardFooter>
    </Card>
  )
}
