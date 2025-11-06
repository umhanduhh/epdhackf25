"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    bio: "",
    location: "",
    mood: "",
    lookingFor: "",
  })

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseBrowserClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/auth"
        return
      }

      setUserId(session.user.id)

      const { data: existingProfile } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle()

      if (existingProfile && existingProfile.handle) {
        window.location.href = "/feed"
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Session expired. Please sign in again.")
        window.location.href = "/auth"
        return
      }

      // Check if handle is taken
      const { data: existingHandle } = await supabase
        .from("users")
        .select("handle")
        .eq("handle", formData.handle)
        .maybeSingle()

      if (existingHandle) {
        alert("Username is already taken")
        setLoading(false)
        return
      }

      // Update or insert user profile
      const { error } = await supabase.from("users").upsert({
        id: userId,
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio,
        location: formData.location,
        mood: formData.mood,
      })

      if (error) throw error

      // Award early adopter badge
      const { data: badge } = await supabase.from("badges").select("id").eq("code", "EARLY_ADOPTER").maybeSingle()

      if (badge) {
        await supabase.from("user_badges").insert({
          user_id: userId,
          badge_id: badge.id,
          source: "COMMUNITY",
        })
      }

      window.location.href = "/feed"
    } catch (err: any) {
      alert(err.message || "Failed to create profile")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#b8ddd8] p-4">
      <div className="mx-auto max-w-2xl py-8">
        <Card className="border-[#8b5b3e]/20 bg-[#f3d9b8] shadow-xl">
          <CardHeader className="text-center">
            <Image
              src="/mascot.png"
              alt="Setup Profile"
              width={100}
              height={100}
              className="mx-auto mb-4 drop-shadow-lg"
            />
            <CardTitle className="text-2xl font-bold text-[#5a3c2e]">Create Your Profile</CardTitle>
            <CardDescription className="text-[#8b5b3e]">Tell us about yourself (MySpace style!)</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#5a3c2e]">
                  Display Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                  className="border-[#8b5b3e]/30 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle" className="text-[#5a3c2e]">
                  Username *
                </Label>
                <Input
                  id="handle"
                  value={formData.handle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  placeholder="janedoe"
                  required
                  className="border-[#8b5b3e]/30 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-[#5a3c2e]">
                  About Me
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="border-[#8b5b3e]/30 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#5a3c2e]">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="border-[#8b5b3e]/30 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood" className="text-[#5a3c2e]">
                  Current Mood
                </Label>
                <Input
                  id="mood"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  placeholder="Motivated and ready to hustle!"
                  className="border-[#8b5b3e]/30 bg-white"
                />
              </div>

              <Button type="submit" className="w-full bg-[#8b5b3e] text-white hover:bg-[#5a3c2e]" disabled={loading}>
                {loading ? "Creating profile..." : "Create Profile"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
