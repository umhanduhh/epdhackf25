"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Flag, Lightbulb, Sparkles, Eye, Send } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { createComment } from "@/app/feed/actions"
import type { Post, ReactionType, Comment } from "@/lib/types/database"

interface PostCardProps {
  post: Post & {
    user: { id: string; name: string; handle: string; avatar_url?: string }
    journey?: { id: string; title_override?: string; template?: { title: string } }
    reactions: Array<{ type: ReactionType; user_id: string }>
    _count: { comments: number; reactions: number }
  }
  currentUserId: string
}

const reactionIcons = {
  HELPFUL: Heart,
  INSPIRING: Sparkles,
  INSIGHTFUL: Lightbulb,
  CHEERS: Eye,
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [reactions, setReactions] = useState(post.reactions)
  const [commentCount, setCommentCount] = useState(post._count.comments)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentBody, setCommentBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments()
    }
  }, [showComments])

  async function fetchComments() {
    setIsLoadingComments(true)
    const supabase = getSupabaseBrowserClient()

    const { data: blocks } = await supabase.from("blocks").select("blocked_user_id").eq("user_id", currentUserId)
    const blockedUserIds = blocks?.map((b) => b.blocked_user_id) || []

    let commentsQuery = supabase
      .from("comments")
      .select("*, user:users(id, name, handle, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })

    if (blockedUserIds.length > 0) {
      commentsQuery = commentsQuery.not("user_id", "in", `(${blockedUserIds.join(",")})`)
    }

    const { data } = await commentsQuery

    if (data) {
      setComments(data)
    }
    setIsLoadingComments(false)
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentBody.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await createComment(post.id, commentBody)

    if (result.success) {
      setCommentBody("")
      setCommentCount(commentCount + 1)
      await fetchComments()
    }
    setIsSubmitting(false)
  }

  const handleReaction = async (type: ReactionType) => {
    const supabase = getSupabaseBrowserClient()
    const existingReaction = reactions.find((r) => r.user_id === currentUserId && r.type === type)

    if (existingReaction) {
      await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", currentUserId).eq("type", type)

      setReactions(reactions.filter((r) => !(r.user_id === currentUserId && r.type === type)))
    } else {
      await supabase.from("reactions").insert({ post_id: post.id, user_id: currentUserId, type })

      setReactions([...reactions, { type, user_id: currentUserId }])
    }
  }

  const userReactions = reactions.filter((r) => r.user_id === currentUserId).map((r) => r.type)

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Avatar>
          <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${post.user.handle}`} className="font-semibold hover:underline">
              {post.user.name}
            </Link>
            <span className="text-sm text-muted-foreground">@{post.user.handle}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
          {post.journey && (
            <Badge variant="secondary" className="text-xs">
              {post.journey.title_override || post.journey.template?.title}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-pretty">{post.body}</p>
        {post.media_url && (
          <img src={post.media_url || "/placeholder.svg"} alt="Post media" className="w-full rounded-xl object-cover" />
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex w-full items-center gap-2">
          {(Object.keys(reactionIcons) as ReactionType[]).map((type) => {
            const Icon = reactionIcons[type]
            const isActive = userReactions.includes(type)
            const count = reactions.filter((r) => r.type === type).length

            return (
              <Button
                key={type}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleReaction(type)}
                className="gap-1"
              >
                <Icon className="h-4 w-4" />
                {count > 0 && <span className="text-xs">{count}</span>}
              </Button>
            )
          })}
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="ml-auto gap-1">
            <MessageCircle className="h-4 w-4" />
            {commentCount > 0 && <span className="text-xs">{commentCount}</span>}
          </Button>
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-3 border-t pt-3">
            {isLoadingComments ? (
              <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{comment.user?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-xl bg-muted p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.user?.handle}`}
                          className="text-sm font-semibold hover:underline"
                        >
                          {comment.user?.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
            )}

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[60px] resize-none"
                disabled={isSubmitting}
              />
              <Button type="submit" size="icon" disabled={isSubmitting || !commentBody.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
