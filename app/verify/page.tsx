"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle2, Clock, XCircle } from "lucide-react"
import { put } from "@vercel/blob"
import type { Platform, Verification } from "@/lib/types/database"

export default function VerifyPage() {
  const router = useRouter()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [verifications, setVerifications] = useState<(Verification & { platform: Platform })[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch platforms
        const { data: platformsData } = await supabase.from("platforms").select("*").order("name")
        setPlatforms(platformsData || [])

        // Fetch user's verifications
        const { data: verificationsData } = await supabase
          .from("verifications")
          .select("*, platform:platforms(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        setVerifications(verificationsData || [])
      }
    }

    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedPlatform) return

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Upload image to Vercel Blob
      const blob = await put(`verifications/${user.id}/${Date.now()}-${file.name}`, file, {
        access: "public",
      })

      // Create verification record
      const { error } = await supabase.from("verifications").insert({
        user_id: user.id,
        platform_id: selectedPlatform,
        image_url: blob.url,
        notes,
        status: "pending",
      })

      if (error) throw error

      // Reset form
      setSelectedPlatform("")
      setNotes("")
      setFile(null)
      setPreview(null)

      // Refresh verifications
      const { data: verificationsData } = await supabase
        .from("verifications")
        .select("*, platform:platforms(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setVerifications(verificationsData || [])

      alert("Verification submitted! We'll review it soon.")
    } catch (err: any) {
      console.error("[v0] Error submitting verification:", err)
      alert("Failed to submit verification")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Platform Verification</h1>
          <p className="text-muted-foreground">Verify your platform accounts to earn badges and build credibility</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submit Verification Form */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Submit Verification</CardTitle>
              <CardDescription>Upload a screenshot showing your platform profile or dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform} required>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Screenshot</Label>
                  <div className="flex flex-col gap-4">
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {preview && (
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading || !file || !selectedPlatform} className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Verification"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Your Verifications</CardTitle>
              <CardDescription>Track the status of your submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {verifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No verifications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.map((verification) => (
                    <div key={verification.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <img
                        src={verification.image_url || "/placeholder.svg"}
                        alt={verification.platform.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{verification.platform.name}</p>
                          {getStatusIcon(verification.status)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{verification.status}</p>
                        {verification.notes && <p className="text-xs text-muted-foreground">{verification.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
