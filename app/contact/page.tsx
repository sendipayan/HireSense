import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FormField } from "@/components/form-field"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Mail, Phone, Clock, MessageSquare, Building2, Headphones } from "lucide-react"

/**
 * SEO: Contact page metadata
 * - Unique title and description for contact/support page
 */
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the HireAI team. We're here to help with questions about our AI hiring platform, enterprise solutions, or technical support.",
  openGraph: {
    title: "Contact HireAI - Get in Touch",
    description:
      "Get in touch with the HireAI team. We're here to help with questions about our AI hiring platform and enterprise solutions.",
    url: "https://hireai.app/contact",
  },
}

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "We'll respond within 24 hours",
      contact: "hello@hireai.app",
      href: "mailto:hello@hireai.app",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri from 9am to 6pm PST",
      contact: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello at our HQ",
      contact: "123 AI Street, San Francisco, CA 94105",
      href: "https://maps.google.com",
    },
  ]

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "General Inquiry",
      description: "Questions about HireAI and our platform",
    },
    {
      icon: Building2,
      title: "Enterprise Sales",
      description: "Custom solutions for large organizations",
    },
    {
      icon: Headphones,
      title: "Technical Support",
      description: "Help with your account or technical issues",
    },
  ]

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs for SEO and navigation */}
        <Breadcrumbs items={[{ label: "Contact" }]} />

        {/* Hero Section */}
        <section className="py-12 sm:py-16" aria-labelledby="contact-heading">
          <div className="mx-auto max-w-3xl text-center">
            {/* SEO: Single h1 per page */}
            <h1 id="contact-heading" className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">
              Get in touch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              Have questions about HireAI? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as
              soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-8" aria-labelledby="contact-methods-heading">
          <h2 id="contact-methods-heading" className="sr-only">
            Contact Methods
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="group rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <method.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{method.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
                <p className="mt-2 text-sm font-medium">{method.contact}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-12 sm:py-16 border-t border-border" aria-labelledby="contact-form-heading">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <h2 id="contact-form-heading" className="text-2xl font-bold">
                Send us a message
              </h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              <form className="mt-8 space-y-6" action="#" method="POST">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="First Name" name="firstName" placeholder="John" required />
                  <FormField label="Last Name" name="lastName" placeholder="Doe" required />
                </div>

                <FormField label="Email" name="email" type="email" placeholder="john@example.com" required />

                <FormField label="Company" name="company" placeholder="Acme Inc." />

                {/* Topic Selection */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select name="topic">
                    <SelectTrigger id="topic" aria-label="Select topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="sales">Enterprise Sales</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="press">Press & Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  label="Message"
                  name="message"
                  as="textarea"
                  placeholder="Tell us how we can help..."
                  required
                  rows={5}
                />

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Send Message
                </Button>

                <p className="text-sm text-muted-foreground">
                  By submitting this form, you agree to our{" "}
                  <Link href="/about" className="underline hover:text-foreground">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Support Options */}
            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold">How can we help?</h2>
              <p className="mt-2 text-muted-foreground">Choose the option that best describes your needs.</p>

              <div className="mt-8 space-y-4">
                {supportOptions.map((option) => (
                  <article
                    key={option.title}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                  >
                    <div className="shrink-0 rounded-lg bg-primary/10 p-3 h-fit">
                      <option.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Office Hours */}
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Office Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span>10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold">Looking for quick answers?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check out our FAQ section for answers to common questions about HireAI.
                </p>
                <Button variant="outline" asChild className="mt-4 bg-transparent">
                  <Link href="/about">View FAQs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
