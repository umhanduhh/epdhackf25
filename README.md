# GigJourneys - Social Goal Tracking for 1099 Professionals

A Next.js 15 social network for gig workers to track personal journeys, share progress, and earn badges.

## Features

- **Magic Link Authentication** - Passwordless login via Supabase Auth
- **Onboarding Flow** - Platform selection, verification, and first journey setup
- **Journey System** - 21 curated journey templates across 6 categories:
  - Financial (Save for taxes, hit earnings goals, track mileage)
  - Professional (Certifications, attendance, feedback)
  - Wellness (Sleep, exercise, meal prep, mental health)
  - Social (Make friends, mentor others, community engagement)
  - Personal Growth (Morning routines)
  - Community Impact (Feature ideas)
- **Social Feed** - Public posts with reactions (Helpful, Inspiring, Insightful, Cheers)
- **Platform Verification** - Upload screenshots to verify gig platform accounts
- **Badge System** - Earn badges for platform verification, journey completion, and engagement
- **Profile Pages** - View stats, badges, verified platforms, and journey progress

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Storage)
- Vercel Blob (for image uploads)

## Supported Platforms

- Clipboard
- Nursa
- IntelyCare
- Care.com
- Swing Education
- DoorDash
- Uber

## Setup

1. **Run the seed data script** in your Supabase SQL Editor:
   \`\`\`sql
   -- Run scripts/05-update-seed-data.sql
   \`\`\`

2. **Environment Variables** (already configured):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `BLOB_READ_WRITE_TOKEN`

3. **Deploy to Vercel**:
   - Click "Publish" in v0
   - Name: gigjourneys
   - Configure Supabase redirect URLs in Supabase dashboard

## Database Schema

- **users** - User profiles with handle, name, bio, avatar
- **platforms** - Gig platforms (Clipboard, Nursa, etc.)
- **verifications** - Platform verification requests with screenshots
- **journey_templates** - 21 curated journey templates
- **journeys** - User-started journeys with progress tracking
- **milestones** - Journey milestones (LOCKED, IN_PROGRESS, DONE)
- **posts** - Social feed posts with visibility settings
- **comments** - Post comments
- **reactions** - 4 reaction types per post
- **badges** - Achievement badges
- **user_badges** - Earned badges per user
- **reports** - Content moderation

## Key Pages

- `/` - Landing page
- `/signup` - Create account with magic link
- `/login` - Sign in with magic link
- `/onboarding` - 3-step onboarding (platforms, verification, first journey)
- `/feed` - Public social feed
- `/create` - Create new post
- `/journeys` - Browse journey templates by category
- `/my-journeys` - View active and completed journeys
- `/verify` - Upload platform verification screenshots
- `/badges` - View earned and available badges
- `/profile` - User profile with stats and badges
- `/settings` - Account settings

## Design

- Pastel gradient backgrounds (blue-50 → purple-50 → pink-50)
- Rounded cards (rounded-2xl)
- Soft shadows
- Clean, supportive UI for busy professionals
- Mobile-first responsive design

## Next Steps

1. Run the seed data script (05-update-seed-data.sql)
2. Deploy to Vercel as "gigjourneys"
3. Configure Supabase redirect URLs
4. Test the onboarding flow
5. Start inviting users!
