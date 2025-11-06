import { Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserBadge } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

interface BadgeDisplayProps {
  userBadges: (UserBadge & { badge: { name: string; description: string; icon_url?: string } })[]
}

export function BadgeDisplay({ userBadges }: BadgeDisplayProps) {
  if (userBadges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card p-8 text-center">
        <Award className="mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No badges earned yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete journeys and engage with the community to earn badges
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {userBadges.map((userBadge) => (
        <Card key={userBadge.id} className="rounded-2xl">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-1 font-semibold">{userBadge.badge.name}</h3>
            <p className="mb-2 text-xs text-muted-foreground">{userBadge.badge.description}</p>
            <Badge variant="secondary" className="text-xs">
              {userBadge.source}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Earned {formatDistanceToNow(new Date(userBadge.earned_at), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
