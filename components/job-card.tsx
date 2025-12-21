import Link from "next/link"
import { MapPin, Clock, DollarSign, Building2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  posted: string
  tags: string[]
  matchScore?: number
}

/**
 * Job listing card component
 * - Semantic <article> element for job listings
 * - Internal link to job details (match results)
 * - Accessible button and badge components
 */
export function JobCard({ id, title, company, location, salary, type, posted, tags, matchScore }: JobCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                <Link href={`/match-results?job=${id}`} className="hover:underline">
                  {title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" aria-hidden="true" />
              {salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {posted}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{type}</Badge>
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {matchScore !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{matchScore}%</p>
              <p className="text-xs text-muted-foreground">Match</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Save ${title} job`}
            className="text-muted-foreground hover:text-primary"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
