"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { BadgeModal } from "./badge-modal"
import type { Badge, UserBadge } from "@/lib/types/database"

interface BadgeWithRelation extends UserBadge {
  badge: Badge
}

interface BadgesListProps {
  userBadges: BadgeWithRelation[]
  availableBadges: Badge[]
}

export function BadgesList({ userBadges, availableBadges }: BadgesListProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isEarned, setIsEarned] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBadgeClick = (badge: Badge, earned: boolean) => {
    setSelectedBadge(badge)
    setIsEarned(earned)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-5 shadow-lg">
          <h2 className="mb-4 text-lg font-bold text-[#5a3c2e]">Your Badges ({userBadges?.length || 0})</h2>
          {userBadges && userBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {userBadges.map((userBadge) => (
                <button
                  key={userBadge.id}
                  onClick={() => handleBadgeClick(userBadge.badge, true)}
                  className="flex flex-col items-center rounded-2xl border-2 border-[#8b5b3e] bg-gradient-to-br from-yellow-50 to-orange-50 p-4 transition-transform hover:scale-105"
                >
                  <div className="mb-2 text-4xl">🏆</div>
                  <p className="mb-1 text-center text-sm font-bold text-[#5a3c2e]">{userBadge.badge.name}</p>
                  <p className="text-xs text-[#5a3c2e]/70">
                    {formatDistanceToNow(new Date(userBadge.earned_at), { addSuffix: true })}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-3 text-5xl">🏆</span>
              <p className="text-sm text-[#5a3c2e]/70">
                No badges earned yet. Start a journey to earn your first badge!
              </p>
            </div>
          )}
        </div>

        {availableBadges.length > 0 && (
          <div className="rounded-3xl border-4 border-[#8b5b3e] bg-[#f3d9b8] p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-[#5a3c2e]">Available to Earn</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge, false)}
                  className="flex flex-col items-center rounded-2xl border-2 border-[#8b5b3e] bg-gray-100 p-4 opacity-60 transition-all hover:scale-105 hover:opacity-80"
                >
                  <div className="mb-2 text-4xl grayscale">🏆</div>
                  <p className="mb-1 text-center text-sm font-bold text-[#5a3c2e]">{badge.name}</p>
                  <p className="text-xs text-[#5a3c2e]/70">{badge.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BadgeModal
        badge={selectedBadge}
        isEarned={isEarned}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
