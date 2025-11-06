"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Ban, Shield } from "lucide-react"
import { sendConnectionRequest, removeConnection, blockUser, unblockUser } from "@/app/profile/[handle]/actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfileActionsProps {
  userId: string
  isConnected: boolean
  isBlocked: boolean
  userHandle: string
}

export function ProfileActions({ userId, isConnected, isBlocked, userHandle }: ProfileActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)

  async function handleConnect() {
    setLoading(true)
    const result = await sendConnectionRequest(userId)
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDisconnect() {
    setLoading(true)
    await removeConnection(userId)
    router.refresh()
    setLoading(false)
  }

  async function handleBlock() {
    setLoading(true)
    await blockUser(userId)
    setShowBlockDialog(false)
    router.refresh()
    setLoading(false)
  }

  async function handleUnblock() {
    setLoading(true)
    await unblockUser(userId)
    router.refresh()
    setLoading(false)
  }

  if (isBlocked) {
    return (
      <Button onClick={handleUnblock} disabled={loading} variant="outline" size="sm">
        <Shield className="mr-2 h-4 w-4" />
        Unblock
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      {isConnected ? (
        <Button onClick={handleDisconnect} disabled={loading} variant="outline" size="sm">
          <UserMinus className="mr-2 h-4 w-4" />
          Remove Connection
        </Button>
      ) : (
        <Button onClick={handleConnect} disabled={loading} size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      )}

      <Button onClick={() => setShowBlockDialog(true)} disabled={loading} variant="destructive" size="sm">
        <Ban className="mr-2 h-4 w-4" />
        Block
      </Button>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block @{userHandle}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer be able to see your posts or comments. You won't see their content either. You
              can unblock them later from their profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock}>Block User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
