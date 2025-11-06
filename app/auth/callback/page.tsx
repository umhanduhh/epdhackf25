"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail } from "lucide-react"
import Image from "next/image"

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // If a session already exists, go straight to /feed
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace("/feed")
        return
      }

      // Only show error messages if not logged in
      const params = new URLSearchParams(window.location.search)
      const err = params.get("error")
      if (err === "no_code") setError("Invalid authentication link. Please try again.")
      if (err === "auth_failed") setError("Authentication failed. Please try again.")
      if (err === "no_user") setError("Could not authenticate user. Please try again.")
    })()
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const redirectUrl = `${window.location.origin}/auth/callback` // same-origin

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl, shouldCreateUser: true },
      })
      if (error) throw error

      setSuccess(true)
      setEmail("")
    } catch (err: any) {
      setError(err.message || "Failed to send magic link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#b8ddd8] p-4">
      <Card className="w-full max-w-md border-[#8b5b3e]/20 bg-[#f3d9b8] shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <Image src="/mascot.png" alt="GigJourneys Mascot" width={120} height={120} className="mx-auto drop-shadow-lg" />
          <CardTitle className="text-3xl font-bold text-[#5a3c2e]">Welcome to GigJourneys</CardTitle>
          <CardDescription className="text-[#8b5b3e]">Enter your email to login or create an account</CardDescription>
        </CardHeader>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-[#7cc7bb] bg-[#7cc7bb]/20">
                <Mail className="h-4 w-4 text-[#5a3c2e]" />
                <AlertDescription className="text-[#5a3c2e]">
                  Check your email! We sent you a magic link to sign in.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#5a3c2e]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border-[#8b5b3e]/30 bg-white"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-[#8b5b3e] text-white hover:bg-[#5a3c2e]" disabled={loading}>
              {loading ? "Sending magic link..." : "Send magic link"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
