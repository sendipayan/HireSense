import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { stats, testimonials } from "@/lib/mock-data"
import {
  Sparkles,
  FileSearch,
  Target,
  Zap,
  Users,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Play,
} from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FloatingParticles } from "@/components/ui/floating-particles"
import { SpotlightCard } from "@/components/ui/spotlight"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { GradientBorder } from "@/components/ui/gradient-border"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { GlowEffect } from "@/components/ui/glow-effect"
import ScrollVelocity from "@/components/scrollVelocity"

/**
 * SEO: Landing page metadata
 * - Unique title and description for the homepage
 * - Open Graph tags for social sharing
 */
export const metadata: Metadata = {
  title: "HireSense - AI-Powered Hiring & Resume Intelligence Platform",
  description:
    "Transform your hiring process with AI. HireSense matches top talent with perfect opportunities using advanced resume intelligence, smart job matching, and AI-powered feedback.",
  openGraph: {
    title: "HireSense - AI-Powered Hiring & Resume Intelligence Platform",
    description:
      "Transform your hiring process with AI. Match top talent with perfect opportunities using advanced resume intelligence.",
    url: "https://hiresense.app",
  },
}

export default function HomePage() {
  const features = [
    {
      title: "AI Resume Analysis",
      description:
        "Get instant, actionable feedback on your resume. Our AI analyzes formatting, content, and keywords to help you stand out.",
      icon: FileSearch,
    },
    {
      title: "Smart Job Matching",
      description:
        "Our AI matches candidates with jobs based on skills, experience, and culture fit—not just keywords.",
      icon: Target,
    },
    {
      title: "Lightning Fast",
      description: "Reduce time-to-hire by 60%. Our AI processes thousands of applications in seconds.",
      icon: Zap,
    },
    {
      title: "Team Collaboration",
      description:
        "Built-in tools for recruiters to collaborate, share feedback, and make better hiring decisions together.",
      icon: Users,
    },
    {
      title: "Analytics Dashboard",
      description: "Track your hiring metrics, candidate pipeline, and recruitment ROI with real-time analytics.",
      icon: BarChart3,
    },
    {
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption. Your data is safe with us.",
      icon: Shield,
    },
  ]

  const companyLogos = ["Netflix", "Stripe", "Airbnb", "Spotify", "Slack"]

  return (
    <main>
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        {/* Floating particles background */}
        <FloatingParticles quantity={40} className="opacity-40" />

        {/* Gradient orbs for visual depth */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-20 -left-40 h-[300px] w-[300px] rounded-full bg-teal-500/20 blur-3xl animate-pulse-glow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-40 -right-40 h-[300px] w-[300px] rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              {/* Badge with blur fade animation */}
              <BlurFade delay={100}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm">
                  <GlowEffect intensity="low">
                    <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  </GlowEffect>
                  <span className="text-emerald-300 font-medium">AI-Powered Hiring Platform</span>
                </div>
              </BlurFade>

              {/* Animated heading */}
              <BlurFade delay={200}>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Hire smarter with{" "}
                  <span className="inline-flex animate-gradient bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent">
                    AI-powered
                  </span>{" "}
                  intelligence
                </h1>
              </BlurFade>

              <BlurFade delay={300}>
                <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed text-pretty">
                  Transform your hiring process. Our AI matches exceptional talent with perfect opportunities, provides
                  instant resume feedback, and cuts time-to-hire by 60%.
                </p>
              </BlurFade>

              <BlurFade delay={400}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <MagneticButton>
                    <ShimmerButton className="h-14 px-10 text-base" variant="primary">
                      <Link href="/login" className="flex items-center font-semibold">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                      </Link>
                    </ShimmerButton>
                  </MagneticButton>
                  {/*<MagneticButton>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="h-14 px-8 text-base font-semibold bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all"
                    >
                      <Link href="/about" className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Watch Demo
                      </Link>
                    </Button>
                  </MagneticButton>*/}
                </div>
              </BlurFade>

              {/* Social proof mini-stats */}
              <BlurFade delay={500}>
                <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <strong className="text-foreground">10,000+</strong> companies trust us
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">4.9/5 rating</span>
                  </div>
                </div>
              </BlurFade>
            </div>

            <BlurFade delay={300}>
              <div className="relative">
                {/* Glow effect behind the image */}
                <div
                  className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30 rounded-2xl blur-2xl opacity-60"
                  aria-hidden="true"
                />

                {/* Main hero image container */}
                <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-2 shadow-2xl">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
                    <Image
                      src="/hero-dashboard-preview.jpg"
                      alt="HireAI dashboard showing AI-powered candidate matching and resume analysis features"
                      width={800}
                      height={600}
                      className="w-full h-auto"
                      priority
                    />

                    {/* Floating UI elements overlay */}
                    <div className="absolute top-4 left-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-white">AI Matching Active</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 rounded-lg bg-emerald-500/90 backdrop-blur-md px-4 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <span className="text-sm font-semibold text-white">98% Match Found</span>
                      </div>
                    </div>

                    <div className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 shadow-lg">
                      <div className="text-xs text-white/80">Processing</div>
                      <div className="text-lg font-bold text-white">2,847</div>
                      <div className="text-xs text-emerald-400">resumes/sec</div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div
                  className="absolute -bottom-6 -left-6 h-20 w-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-80 blur-sm"
                  aria-hidden="true"
                />
                <div
                  className="absolute -top-4 -right-4 h-16 w-16 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-400 opacity-60 blur-sm"
                  aria-hidden="true"
                />
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      <section
        className="border-y border-border bg-card/50 backdrop-blur-sm py-12"
        aria-labelledby="trusted-by-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlurFade delay={500}>
            <p
              id="trusted-by-heading"
              className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8"
            >
              Trusted by leading companies
            </p>
          </BlurFade>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <ScrollVelocity texts={companyLogos} velocity={30} className="custom-scroll-text" />
            {/* {companyLogos.map((company, index) => (
              <BlurFade key={company} delay={600 + index * 100}>
                <span className="text-xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors duration-300">
                  {company}
                </span>
              </BlurFade>
            ))}*/}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 relative" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <BlurFade key={stat.label} delay={200 + index * 100}>
                <div className="text-center group">
                  <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                    <AnimatedCounter value={stat.value} duration={2000 + index * 200} />
                  </p>
                  <p className="mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-card/30 relative overflow-hidden" aria-labelledby="features-heading">
        <FloatingParticles quantity={20} className="opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlurFade delay={100}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="features-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to{" "}
                <span className="inline-flex animate-gradient bg-gradient-to-r from-chart-1 via-chart-2 to-chart-1 bg-[length:200%_auto] bg-clip-text text-transparent">
                  hire better
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful AI tools for candidates and recruiters. Streamline your entire hiring workflow.
              </p>
            </div>
          </BlurFade>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <BlurFade key={feature.title} delay={200 + index * 100}>
                <SpotlightCard className="h-full" spotlightColor="rgba(16, 185, 129, 0.2)">
                  <div className="p-6 lg:p-8">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24" aria-labelledby="solutions-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="solutions-heading" className="sr-only">
            Solutions for Candidates and Recruiters
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* For Candidates */}
            <BlurFade delay={100}>
              <GradientBorder animated>
                <article className="p-8 lg:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-chart-1/10 px-3 py-1 text-sm font-medium text-chart-1">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    For Candidates
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">Land your dream job faster</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Get personalized AI feedback on your resume, discover jobs that match your skills, and track your
                    applications all in one place.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "AI-powered resume feedback",
                      "Smart job recommendations",
                      "Application tracking",
                      "Interview prep tips",
                    ].map((item, i) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="mt-8">
                    <ShimmerButton>
                      <Link href="/candidate/dashboard" className="flex items-center">
                        Start Job Search
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </ShimmerButton>
                  </MagneticButton>
                </article>
              </GradientBorder>
            </BlurFade>

            {/* For Recruiters */}
            <BlurFade delay={200}>
              <GradientBorder animated>
                <article className="p-8 lg:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-chart-2/10 px-3 py-1 text-sm font-medium text-chart-2">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    For Recruiters
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">Hire top talent efficiently</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    AI-powered candidate matching, automated screening, and collaborative hiring tools to find the best
                    candidates in record time.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "AI candidate matching",
                      "Automated screening",
                      "Team collaboration",
                      "Analytics & reporting",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="mt-8">
                    <ShimmerButton>
                      <Link href="/recruiter/dashboard" className="flex items-center">
                        Start Hiring
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </ShimmerButton>
                  </MagneticButton>
                </article>
              </GradientBorder>
            </BlurFade>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-card/30 relative overflow-hidden" aria-labelledby="how-it-works-heading">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlurFade delay={100}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                How HireAI works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get started in minutes with our simple 3-step process.
              </p>
            </div>
          </BlurFade>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Upload your resume",
                description: "Upload your resume and let our AI analyze your skills, experience, and potential.",
                icon: FileSearch,
              },
              {
                step: "02",
                title: "Get AI feedback",
                description: "Receive instant, actionable feedback to optimize your resume for your target roles.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Match with jobs",
                description: "Our AI matches you with opportunities that align with your skills and career goals.",
                icon: Target,
              },
            ].map((item, index) => (
              <BlurFade key={item.step} delay={200 + index * 150}>
                <article className="relative group">
                  <div className="inline-flex animate-gradient mb-4 text-6xl bg-gradient-to-r from-chart-1 via-chart-2 to-chart-1 bg-[length:200%_auto] bg-clip-text text-transparent">
                    {item.step}
                  </div>
                  <GlowEffect intensity="low">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <item.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                  </GlowEffect>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlurFade delay={100}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="testimonials-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by hiring teams everywhere
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">See what our customers have to say about HireAI.</p>
            </div>
          </BlurFade>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <BlurFade key={index} delay={200 + index * 100}>
                <SpotlightCard className="h-full">
                  <blockquote className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 text-chart-4 fill-current"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-lg leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                    <footer className="mt-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-primary-foreground font-semibold">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                </SpotlightCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 relative overflow-hidden" aria-labelledby="cta-heading">
        {/* Gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-chart-1/10 blur-3xl animate-pulse-glow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-chart-2/10 blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlurFade delay={100}>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur-sm px-4 py-1.5 border border-border/50">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">Start in under 2 minutes</span>
              </div>
              <h2 id="cta-heading" className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to transform your hiring?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of companies using HireAI to find and hire top talent faster.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <MagneticButton>
                  <ShimmerButton className="h-14 px-10 text-lg">
                    <Link href="/login" className="flex items-center">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Link>
                  </ShimmerButton>
                </MagneticButton>
                <MagneticButton>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-10 text-lg bg-transparent backdrop-blur-sm border-border/50 hover:bg-card/50"
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </MagneticButton>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free plan available.</p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  )
}
