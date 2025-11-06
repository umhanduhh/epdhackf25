"use client"

import type React from "react"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { startJourney } from "./start/[id]/actions"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

import useSWR from "swr"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const supabase = getSupabaseBrowserClient()

async function fetchTemplates() {
  const { data } = await supabase.from("journey_templates").select("*").order("created_at", { ascending: true })
  return data || []
}

export default function JourneysPage() {
  const router = useRouter()
  const { data: templates } = useSWR("journey_templates", fetchTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

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

  const handleJourneyClick = (template: any) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
    setIsPublic(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await startJourney(formData)
    setIsModalOpen(false)
    router.push("/my-journeys")
  }

  return (
    <div className="min-h-screen bg-primary pb-24">
      <div className="sticky top-0 z-40 bg-secondary/20 px-4 py-6 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <Image src="/mascot.png" alt="Journey Raccoon" width={60} height={60} className="rounded-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-dark">Start a Journey</h1>
              <p className="text-sm text-dark/70">Pick a goal and let's go! 🚀</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-4">
          {templates?.map((template) => (
            <button
              key={template.id}
              onClick={() => handleJourneyClick(template)}
              className="block w-full rounded-3xl bg-light p-6 shadow-lg transition-transform active:scale-95 hover:shadow-xl text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-4xl">
                  {templateIcons[template.title] || "🎯"}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-dark">{template.title}</h3>
                  <p className="text-sm text-dark/70">{template.description}</p>
                </div>
                <div className="text-2xl text-accent">→</div>
              </div>
            </button>
          ))}
        </div>

        {(!templates || templates.length === 0) && (
          <div className="rounded-3xl bg-light p-8 text-center shadow-lg">
            <Image src="/mascot.png" alt="Journey Raccoon" width={120} height={120} className="mx-auto mb-4" />
            <p className="text-dark/70">No journeys available yet. Check back soon!</p>
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-4 border-accent rounded-3xl max-w-md bg-gradient-to-br from-map-paper via-light to-map-paper shadow-2xl">
          <div className="absolute -top-12 -right-8 pointer-events-none">
            <Image src="/mascot.png" alt="Journey Raccoon" width={100} height={100} className="drop-shadow-lg" />
          </div>

          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/20 text-4xl border-2 border-accent/30">
                    {templateIcons[selectedTemplate.title] || "🎯"}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-dark">{selectedTemplate.title}</DialogTitle>
                    <DialogDescription className="text-dark/70">{selectedTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="rounded-2xl border-2 border-accent/20 bg-white/50 p-6 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input type="hidden" name="templateId" value={selectedTemplate.id} />
                  <input type="hidden" name="goalUnit" value={goalUnits[selectedTemplate.title]} />
                  <input type="hidden" name="visibility" value={isPublic ? "PUBLIC" : "PRIVATE"} />

                  <div className="space-y-2">
                    <Label htmlFor="goalValue" className="text-lg font-semibold text-dark">
                      {labels[selectedTemplate.title]}
                    </Label>
                    <div className="relative">
                      {selectedTemplate.title === "Save Money" && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark/70">$</span>
                      )}
                      <Input
                        id="goalValue"
                        name="goalValue"
                        type="number"
                        step={selectedTemplate.title === "Boost My Rating" ? "0.1" : "1"}
                        min={selectedTemplate.title === "Boost My Rating" ? "0" : "1"}
                        placeholder={placeholders[selectedTemplate.title]}
                        required
                        className={`h-16 rounded-2xl border-2 border-accent/30 bg-white text-xl font-semibold text-dark placeholder:text-dark/30 focus:border-accent shadow-sm ${
                          selectedTemplate.title === "Save Money" ? "pl-10" : ""
                        }`}
                      />
                    </div>
                    <p className="text-sm text-dark/60">
                      {selectedTemplate.title === "Save Money" && "Enter the amount you want to save"}
                      {selectedTemplate.title === "Boost My Rating" && "Enter your target rating"}
                      {selectedTemplate.title === "Build My Network" &&
                        "Enter how many people you want to connect with"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-2xl border-2 border-accent/30 bg-white p-4">
                      <div className="flex-1">
                        <Label htmlFor="visibility" className="text-base font-semibold text-dark cursor-pointer">
                          {isPublic ? "🌍 Public Journey" : "🔒 Private Journey"}
                        </Label>
                        <p className="text-sm text-dark/60">
                          {isPublic ? "Others can see your progress on the feed" : "Only you can see this journey"}
                        </p>
                      </div>
                      <Switch
                        id="visibility"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        className="data-[state=checked]:bg-accent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-2xl border-2 border-accent/30 bg-white py-6 text-lg font-semibold text-dark hover:bg-accent/10 shadow-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-2xl bg-accent py-6 text-lg font-semibold text-white hover:bg-accent/90 shadow-md"
                    >
                      Start Journey 🚀
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
