"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadBadgeVerification } from "@/app/badges/actions"
import type { Badge } from "@/lib/types/database"
import Image from "next/image"

interface BadgeModalProps {
  badge: Badge | null
  isEarned: boolean
  isOpen: boolean
  onClose: () => void
}

export function BadgeModal({ badge, isEarned, isOpen, onClose }: BadgeModalProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  if (badge && isOpen) {
    console.log("[v0] Badge modal opened:", {
      name: badge.name,
      source: badge.source,
      isEarned,
      hasSource: "source" in badge,
    })
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData(e.currentTarget)
    const result = await uploadBadgeVerification(formData)

    setIsUploading(false)

    if (result.success) {
      onClose()
      router.refresh()
    } else {
      setUploadError(result.error || "Failed to upload verification")
    }
  }

  if (!badge) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-4 border-[#8b5b3e] bg-gradient-to-br from-[#f9e2a3] to-[#f3d9b8]">
        <div className="absolute right-4 top-4 h-16 w-16">
          <Image src="/mascot.png" alt="Mascot" width={64} height={64} className="object-contain" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#5a3c2e]">{badge.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[#5a3c2e]/80">{badge.description}</p>

          {isEarned ? (
            // Already earned - just show congratulations
            <div className="rounded-lg border-2 border-[#8b5b3e] bg-white/50 p-4">
              <p className="text-center text-lg font-bold text-[#5a3c2e]">🎉 Badge Earned!</p>
              <p className="mt-2 text-center text-sm text-[#5a3c2e]/70">
                You've successfully earned this badge. Keep up the great work!
              </p>
            </div>
          ) : badge.source === "PLATFORM" ? (
            // Unearned platform badge - show upload form
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="hidden" name="badgeId" value={badge.id} />

              <div className="space-y-2">
                <Label htmlFor="screenshot" className="text-[#5a3c2e]">
                  Upload Screenshot
                </Label>
                <p className="text-xs text-[#5a3c2e]/70">
                  Upload a screenshot of your profile from {badge.name.replace(" Verified", "")} to verify your account
                </p>
                <Input
                  id="screenshot"
                  name="screenshot"
                  type="file"
                  accept="image/*"
                  required
                  className="border-2 border-[#8b5b3e] bg-white"
                />
              </div>

              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

              <Button
                type="submit"
                disabled={isUploading}
                className="w-full border-2 border-[#8b5b3e] bg-[#8b5b3e] text-white hover:bg-[#5a3c2e]"
              >
                {isUploading ? "Uploading..." : "Submit Verification"}
              </Button>
            </form>
          ) : badge.source === "JOURNEY" ? (
            // Unearned journey badge - show how to earn
            <div className="rounded-lg border-2 border-[#8b5b3e] bg-white/50 p-4">
              <p className="text-sm text-[#5a3c2e]">
                <strong>How to earn:</strong> Start and complete journeys to earn this badge automatically. Visit the
                Journeys page to get started!
              </p>
            </div>
          ) : (
            // Unearned community badge - show how to earn
            <div className="rounded-lg border-2 border-[#8b5b3e] bg-white/50 p-4">
              <p className="text-sm text-[#5a3c2e]">
                <strong>How to earn:</strong> This badge is earned through community engagement and activity. Keep
                posting updates and connecting with others!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
