export type VerificationStatus = "pending" | "approved" | "rejected"
export type JourneyCategory =
  | "FINANCIAL"
  | "SOCIAL"
  | "WELLNESS"
  | "PROFESSIONAL"
  | "PERSONAL_GROWTH"
  | "COMMUNITY_IMPACT"
export type VisibilityType = "PUBLIC" | "FOLLOWERS" | "PRIVATE"
export type MilestoneStatus = "LOCKED" | "IN_PROGRESS" | "DONE"
export type ReactionType = "HELPFUL" | "INSPIRING" | "INSIGHTFUL" | "CHEERS"
export type BadgeSource = "PLATFORM" | "JOURNEY" | "COMMUNITY"
export type ReportStatus = "OPEN" | "CLOSED"
export type ConnectionStatus = "pending" | "accepted" | "rejected"

export interface User {
  id: string
  handle: string
  name: string
  avatar_url?: string
  bio?: string
  location?: string
  created_at: string
}

export interface Connection {
  id: string
  user_id: string
  friend_id: string
  status: ConnectionStatus
  created_at: string
  accepted_at?: string
  friend?: User
  user?: User
}

export interface Block {
  id: string
  user_id: string
  blocked_user_id: string
  created_at: string
  blocked_user?: User
}

export interface Platform {
  id: string
  name: string
  slug: string
  icon_url?: string
  created_at: string
}

export interface Verification {
  id: string
  user_id: string
  platform_id: string
  image_url: string
  status: VerificationStatus
  notes?: string
  created_at: string
  reviewed_at?: string
  platform?: Platform
}

export interface JourneyTemplate {
  id: string
  category: JourneyCategory
  title: string
  description: string
  default_milestones: string[]
  is_featured: boolean
  created_at: string
}

export interface Journey {
  id: string
  user_id: string
  template_id: string
  title_override?: string
  visibility: VisibilityType
  progress: number
  goal_value?: number
  goal_unit?: string
  current_value?: number
  started_at: string
  completed_at?: string
  template?: JourneyTemplate
  user?: User
}

export interface Milestone {
  id: string
  journey_id: string
  title: string
  status: MilestoneStatus
  sequence: number
  completed_at?: string
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  journey_id?: string
  visibility: VisibilityType
  body: string
  media_url?: string
  tags: string[]
  created_at: string
  user?: User
  journey?: Journey
  comments?: Comment[]
  reactions?: Reaction[]
  _count?: {
    comments: number
    reactions: number
  }
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
  user?: User
}

export interface Reaction {
  id: string
  post_id: string
  user_id: string
  type: ReactionType
  created_at: string
  user?: User
}

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon_url?: string
  source: BadgeSource // Added source field to Badge interface
  criteria_json: Record<string, any>
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  source: BadgeSource
  meta_json: Record<string, any>
  badge?: Badge
}

export interface Report {
  id: string
  post_id: string
  reporter_id: string
  reason: string
  status: ReportStatus
  created_at: string
}
