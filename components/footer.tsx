import Link from "next/link"
import { Sparkles, Linkedin, Twitter, Github } from "lucide-react"
import icon from "@/public/icon.png"
import Image from "next/image"

/**
 * Footer component with semantic HTML and internal links for SEO
 * - Uses <footer> element for proper document structure
 * - Internal linking helps search engines discover all pages
 * - ARIA labels for social media links
 */
export function Footer() {
  const footerLinks = {
    product: [
      { name: "For Candidates", href: "/candidate/dashboard" },
      { name: "For Recruiters", href: "/recruiter/dashboard" },
      { name: "Resume Upload", href: "/candidate/resume-upload" },
      { name: "Post a Job", href: "/recruiter/post-job" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/about" },
      { name: "Blog", href: "/about" },
    ],
    resources: [
      { name: "AI Feedback", href: "/ai-feedback" },
      { name: "Match Results", href: "/match-results" },
      { name: "Help Center", href: "/contact" },
      { name: "API Docs", href: "/about" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/about" },
      { name: "Terms of Service", href: "/about" },
      { name: "Cookie Policy", href: "/about" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "GitHub", href: "#", icon: Github },
  ]

  return (
    <footer className="border-t border-border bg-card" role="contentinfo" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold" aria-label="HireAI Home">
              <div className="flex h-7 w-7 items-center justify-center ">
                <Image src={icon} alt="HireAI Logo" width={24} height={24} className=""/>
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>HireSense</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              AI-powered hiring platform that connects exceptional talent with great opportunities.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-3" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-3" role="list">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HireAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
