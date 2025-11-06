import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { startJourney } from "./actions"

export default async function StartJourneyPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  const { data: template } = await supabase.from("journey_templates").select("*").eq("id", params.id).single()

  if (!template) redirect("/journeys")

  const templateIcons: Record<string, string> = {
    "Save Money": "💰",
    "Boost My Rating": "⭐",
    "Build My Network": "🤝",
  }

  const goalUnits: Record<string, string> = {
    "Save Money": "dollars",
    "Boost My Rating": "stars",
    "Build My Network": "connections",
  }

  const placeholders: Record<string, string> = {
    "Save Money": "5000",
    "Boost My Rating": "4.8",
    "Build My Network": "10",
  }

  const labels: Record<string, string> = {
    "Save Money": "How much do you want to save?",
    "Boost My Rating": "What rating are you aiming for?",
    "Build My Network": "How many connections do you want?",
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="sticky top-0 z-40 bg-secondary/20 px-4 py-6 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <Image src="/mascot.png" alt="Journey Raccoon" width={60} height={60} className="rounded-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-dark">Set Your Goal</h1>
              <p className="text-sm text-dark/70">Let's make it happen! 🎯</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-3xl bg-light p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-5xl">
              {templateIcons[template.title] || "🎯"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark">{template.title}</h2>
              <p className="text-dark/70">{template.description}</p>
            </div>
          </div>

          <form action={startJourney} className="space-y-6">
            <input type="hidden" name="templateId" value={template.id} />
            <input type="hidden" name="goalUnit" value={goalUnits[template.title]} />

            <div className="space-y-2">
              <Label htmlFor="goalValue" className="text-lg font-semibold text-dark">
                {labels[template.title]}
              </Label>
              <div className="relative">
                {template.title === "Save Money" && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark/70">$</span>
                )}
                <Input
                  id="goalValue"
                  name="goalValue"
                  type="number"
                  step={template.title === "Boost My Rating" ? "0.1" : "1"}
                  min={template.title === "Boost My Rating" ? "0" : "1"}
                  max={template.title === "Boost My Rating" ? "5" : undefined}
                  placeholder={placeholders[template.title]}
                  required
                  className={`h-16 rounded-2xl border-2 border-accent/20 bg-white text-xl font-semibold text-dark placeholder:text-dark/30 focus:border-accent ${
                    template.title === "Save Money" ? "pl-10" : ""
                  }`}
                />
              </div>
              <p className="text-sm text-dark/60">
                {template.title === "Save Money" && "Enter the amount you want to save"}
                {template.title === "Boost My Rating" && "Enter your target rating (0-5 stars)"}
                {template.title === "Build My Network" && "Enter how many people you want to connect with"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-2xl border-2 border-accent/20 bg-white py-6 text-lg font-semibold text-dark hover:bg-accent/5"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-2xl bg-accent py-6 text-lg font-semibold text-white hover:bg-accent/90"
              >
                Start Journey 🚀
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Image src="/mascot.png" alt="Journey Raccoon" width={100} height={100} className="mx-auto opacity-50" />
        </div>
      </main>
    </div>
  )
}
