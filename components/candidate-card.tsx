import Link from "next/link"
import { MapPin, Briefcase, GraduationCap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CandidateCardProps {
  id: string
  name: string
  title: string
  location: string
  experience: string
  education: string
  skills: string[]
  matchScore: number
  avatar?: string
}

/**
 * Candidate card for recruiter dashboard
 * - Semantic markup with article element
 * - Avatar with fallback for accessibility
 * - Match score prominently displayed
 */
export function CandidateCard({
  id,
  name,
  title,
  location,
  experience,
  education,
  skills,
  matchScore,
  avatar,
}: CandidateCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <article className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={`${name}'s profile picture`} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                <Link href={`/recruiter/match-results?candidate=${id}`} className="hover:underline">
                  {name}
                </Link>
              </h3>
              <p className="text-muted-foreground">{title}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-warning fill-warning" aria-hidden="true" />
                <span className="text-xl font-bold text-primary">{matchScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Match Score</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              {experience}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {education}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && <Badge variant="outline">+{skills.length - 4} more</Badge>}
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" asChild>
              <Link href={`/recruiter/match-results?candidate=${id}`}>View Profile</Link>
            </Button>
            <Button size="sm" variant="outline">
              Message
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
