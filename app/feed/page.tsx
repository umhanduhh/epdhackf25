// app/feed/page.tsx
export const revalidate = 0;           // or: export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function FeedPage() {
  const supabase = await getSupabaseServerClient();

  // ✅ Use getSession() so SSR can read/refresh auth cookies
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  if (sessionErr || !session) {
    redirect("/auth");
  }

  const userId = session.user.id;

  // Get blocked user ids
  const { data: blocks, error: blocksErr } = await supabase
    .from("blocks")
    .select("blocked_user_id")
    .eq("user_id", userId);

  if (blocksErr) {
    // If this errors, you can choose to continue without the filter
    // or redirect to an error page. We'll continue.
    // console.error(blocksErr);
  }

  const blockedUserIds = (blocks ?? []).map((b) => b.blocked_user_id).filter(Boolean);

  // Build posts query
  let postsQuery = supabase
    .from("posts")
    .select(
      `
        *,
        user:users!posts_user_id_fkey(id, name, handle, avatar_url),
        journey:journeys(
          id,
          title_override,
          template:journey_templates(title, category)
        ),
        reactions(type, user_id),
        comments(count)
      `
    )
    .eq("visibility", "PUBLIC")
    .order("created_at", { ascending: false })
    .limit(20);

  if (blockedUserIds.length > 0) {
    // Supabase/PostgREST expects a CSV inside parentheses for NOT IN
    postsQuery = postsQuery.not("user_id", "in", `(${blockedUserIds.join(",")})`);
    // Alternatively (clearer but positive filter): fetch then filter client-side.
  }

  const { data: posts, error: postsErr } = await postsQuery;

  const postsWithCounts =
    (posts ?? []).map((post: any) => ({
      ...post,
      _count: {
        comments: post.comments?.length || 0,
        reactions: post.reactions?.length || 0,
      },
    })) ?? [];

  return (
    <div className="min-h-screen bg-[#B8DDD8] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary/30 px-4 py-4 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Feed</h1>
          <Link
            href="/create"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform active:scale-95"
          >
            <span className="text-2xl">✨</span>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Alert className="mb-4 border-2 border-[#8b5b3e] bg-[#f3d9b8]">
          <Info className="h-4 w-4 text-[#8b5b3e]" />
          <AlertDescription className="text-sm text-[#5a3c2e]">
            Your posts, comments, and profile are visible to the community. You can manage your connections and block
            users from their profiles.
          </AlertDescription>
        </Alert>

        {postsErr ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-lg">
            <p className="text-sm text-red-600">Failed to load posts.</p>
          </div>
        ) : postsWithCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card p-12 text-center shadow-lg">
            <Image src="/mascot.png" alt="No posts yet" width={150} height={150} className="mb-4 drop-shadow-lg" />
            <p className="mb-2 text-xl font-bold text-foreground">No posts yet</p>
            <p className="mb-6 text-sm text-muted-foreground">Be the first to share your journey!</p>
            <Link
              href="/create"
              className="rounded-2xl bg-secondary px-8 py-3 font-bold text-secondary-foreground shadow-lg transition-transform active:scale-95"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {postsWithCounts.map((post: any) => (
              <PostCard key={post.id} post={post} currentUserId={userId} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
