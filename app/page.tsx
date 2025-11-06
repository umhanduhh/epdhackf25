import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Users, Award, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mb-8 flex justify-center">
            <Image src="/mascot.png" alt="GigJourneys Mascot" width={200} height={200} className="drop-shadow-2xl" />
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Track Your Journey as a <span className="text-primary">1099 Professional</span>
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            Connect with fellow gig workers, set goals, celebrate milestones, and grow together. Your journey matters.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 bg-[#8b5b3e] text-white hover:bg-[#5a3c2e]">
              <Link href="/auth">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#8b5b3e] text-[#8b5b3e] hover:bg-[#8b5b3e]/10 bg-transparent"
            >
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 px-4 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Everything you need to thrive</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Set Goals</h3>
              <p className="text-sm text-muted-foreground">
                Choose from curated journey templates or create your own path
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground">Monitor milestones and celebrate every win along the way</p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Connect</h3>
              <p className="text-sm text-muted-foreground">Share updates and support others in the community</p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Earn Badges</h3>
              <p className="text-sm text-muted-foreground">
                Get recognized for your achievements and platform expertise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/50 px-4 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Ready to start your journey?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of 1099 professionals tracking their progress and supporting each other.
          </p>
          <Button asChild size="lg" className="bg-[#8b5b3e] text-white hover:bg-[#5a3c2e]">
            <Link href="/auth">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
