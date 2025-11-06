"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Journey, VisibilityType } from "@/lib/types/database"
import { BottomNav } from "@/components/bottom-nav" // Added import for BottomNav

export default function CreatePostPage() {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [visibility, setVisibility] = useState<VisibilityType>("PUBLIC")
  const [journeyId, setJourneyId] = useState<string>("none")
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJourneys = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("journeys")
          .select("*, template:journey_templates(title)")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })

        setJourneys(data || [])
      }
    }

    fetchJourneys()
  }, [])

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        body,
        visibility,
        journey_id: journeyId === "none" ? null : journeyId,
        tags,
      })

      if (error) throw error

      router.push("/feed")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error creating post:", err)
      alert("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      <div className="sticky top-0 z-40 bg-[#A8CDD8] px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Create Post</h1>
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform active:scale-95"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-800">
                What's on your mind?
              </Label>
              <Textarea
                id="body"
                placeholder="Share your progress, ask a question, or celebrate a win..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={6}
                className="resize-none rounded-2xl border-2 border-gray-200 focus:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journey" className="text-gray-800">
                Link to Journey (optional)
              </Label>
              <Select value={journeyId} onValueChange={setJourneyId}>
                <SelectTrigger id="journey" className="rounded-2xl border-2 border-gray-200">
                  <SelectValue placeholder="Select a journey" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {journeys.map((journey) => (
                    <SelectItem key={journey.id} value={journey.id}>
                      {journey.title_override || journey.template?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-gray-800">
                Visibility
              </Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as VisibilityType)}>
                <SelectTrigger id="visibility" className="rounded-2xl border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">🌍 Public</SelectItem>
                  <SelectItem value="FOLLOWERS">👥 Followers Only</SelectItem>
                  <SelectItem value="PRIVATE">🔒 Private (Journey Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-800">
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="rounded-2xl border-2 border-gray-200"
                />
                <Button type="button" onClick={handleAddTag} className="rounded-2xl bg-teal-500 hover:bg-teal-600">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className="gap-1 rounded-xl bg-purple-100 text-purple-700">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-purple-500 py-6 text-lg font-bold shadow-lg hover:bg-purple-600"
              >
                {loading ? "Posting..." : "✨ Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-2xl border-2 px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
