import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Users, Target, Lightbulb, Heart, ArrowRight, Linkedin, Twitter } from "lucide-react"

/**
 * SEO: About page metadata
 * - Unique title and description
 * - Keywords relevant to company information
 */
export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about HireAI's mission to transform hiring with AI. Meet our team and discover how we're building the future of recruitment technology.",
  openGraph: {
    title: "About HireAI - Our Mission & Team",
    description:
      "Learn about HireAI's mission to transform hiring with AI. Meet our team and discover how we're building the future of recruitment.",
    url: "https://hireai.app/about",
  },
}

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "People First",
      description: "We believe hiring should be human-centered. AI should augment, not replace, human decision-making.",
    },
    {
      icon: Target,
      title: "Precision Matters",
      description: "We're obsessed with accuracy. Our AI is continuously trained to provide the most relevant matches.",
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovation",
      description: "We're always pushing boundaries to build better tools for candidates and recruiters alike.",
    },
    {
      icon: Heart,
      title: "Inclusive by Design",
      description: "We build products that help reduce bias and promote diversity in hiring decisions.",
    },
  ]

  const team = [
    {
      name: "Alexandra Chen",
      role: "CEO & Co-founder",
      bio: "Former VP of Engineering at LinkedIn. 15+ years in HR tech.",
      image: "/professional-ceo-portrait.png",
    },
    {
      name: "Marcus Williams",
      role: "CTO & Co-founder",
      bio: "Ex-Google ML Engineer. PhD in Natural Language Processing.",
      image: "/professional-cto-portrait.png",
    },
    {
      name: "Sarah Johnson",
      role: "VP of Product",
      bio: "Former Product Lead at Indeed. Passionate about UX.",
      image: "/professional-woman-vp.png",
    },
    {
      name: "David Park",
      role: "VP of Engineering",
      bio: "Ex-Meta Staff Engineer. Building scalable systems since 2010.",
      image: "/professional-engineer.png",
    },
  ]

  const milestones = [
    { year: "2021", event: "HireAI founded in San Francisco" },
    { year: "2022", event: "Launched AI resume analysis feature" },
    { year: "2023", event: "Reached 50,000 candidates matched" },
    { year: "2024", event: "Series B funding, expanded to 5,000+ companies" },
  ]

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs for SEO and navigation */}
        <Breadcrumbs items={[{ label: "About" }]} />

        {/* Hero Section */}
        <section className="py-12 sm:py-16" aria-labelledby="about-heading">
          <div className="mx-auto max-w-3xl text-center">
            {/* SEO: Single h1 per page */}
            <h1 id="about-heading" className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">
              Building the future of hiring
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              We started HireAI with a simple belief: finding the right job or the right candidate shouldn&apos;t be
              left to chance. Our AI-powered platform makes meaningful connections between talent and opportunity.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="mission-heading">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="mission-heading" className="text-3xl font-bold tracking-tight">
                Our Mission
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                To democratize access to great opportunities by using AI to match talent with roles where they can
                thrive. We believe everyone deserves a fair chance to showcase their potential.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Traditional hiring is broken. Resumes get lost in applicant tracking systems. Great candidates get
                overlooked because of keyword mismatches. Recruiters spend hours manually screening applications.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                HireAI changes this by understanding the full context of a candidate&apos;s experience and a job&apos;s
                requirements, making intelligent matches that benefit both sides.
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
              <Image
                src="/modern-office-collaboration.png"
                alt="HireAI team collaborating in modern office"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="values-heading">
          <h2 id="values-heading" className="text-3xl font-bold tracking-tight text-center">
            Our Values
          </h2>
          <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
            These principles guide everything we do at HireAI.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article key={value.title} className="text-center ">
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-4">
                  <value.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="text-3xl font-bold tracking-tight text-center">
            Our Journey
          </h2>
          <div className="mt-12 mx-auto max-w-2xl">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {milestone.year.slice(-2)}
                    </div>
                    {index < milestones.length - 1 && <div className="h-full w-px bg-border mt-2" />}
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold">{milestone.year}</p>
                    <p className="text-muted-foreground">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="team-heading">
          <h2 id="team-heading" className="text-3xl font-bold tracking-tight text-center">
            Meet our leadership
          </h2>
          <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
            Experienced leaders from top tech companies, united by a passion for transforming hiring.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <article key={member.name} className="text-center group">
                <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={`${member.name}, ${member.role}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                <div className="mt-3 flex justify-center gap-3">
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`${member.name} on Twitter`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="about-cta-heading">
          <div className="rounded-2xl bg-card border border-border p-8 sm:p-12 text-center">
            <h2 id="about-cta-heading" className="text-2xl font-bold sm:text-3xl">
              Join us in transforming hiring
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Whether you&apos;re looking for your next opportunity or building your dream team, HireAI is here to help.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
