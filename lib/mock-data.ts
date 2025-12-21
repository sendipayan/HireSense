/**
 * Mock data for the application
 * In production, this would come from API endpoints
 */

export const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$150k - $200k",
    type: "Full-time",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Next.js"],
    description: "We're looking for a senior frontend engineer to lead our web development team...",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignStudio",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    posted: "1 week ago",
    tags: ["Figma", "UI/UX", "Design Systems"],
    description: "Join our design team to create beautiful, user-centered products...",
  },
  {
    id: "3",
    title: "Backend Developer",
    company: "DataFlow Systems",
    location: "New York, NY",
    salary: "$130k - $180k",
    type: "Full-time",
    posted: "3 days ago",
    tags: ["Python", "PostgreSQL", "AWS"],
    description: "Build scalable backend systems for our data analytics platform...",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudNative Co.",
    location: "Austin, TX",
    salary: "$140k - $190k",
    type: "Full-time",
    posted: "5 days ago",
    tags: ["Kubernetes", "Docker", "CI/CD"],
    description: "Help us build and maintain our cloud infrastructure...",
  },
  {
    id: "5",
    title: "Machine Learning Engineer",
    company: "AI Labs",
    location: "Boston, MA",
    salary: "$170k - $220k",
    type: "Full-time",
    posted: "1 day ago",
    tags: ["Python", "TensorFlow", "NLP"],
    description: "Develop cutting-edge ML models for natural language processing...",
  },
]

export const mockCandidates = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    experience: "8 years",
    education: "MS Computer Science",
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "GraphQL"],
    matchScore: 95,
    email: "sarah.chen@email.com",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    title: "Full Stack Developer",
    location: "Austin, TX",
    experience: "5 years",
    education: "BS Software Engineering",
    skills: ["Vue.js", "Python", "Django", "PostgreSQL", "Docker"],
    matchScore: 88,
    email: "m.rodriguez@email.com",
  },
  {
    id: "3",
    name: "Emily Watson",
    title: "Frontend Developer",
    location: "Remote",
    experience: "4 years",
    education: "BS Computer Science",
    skills: ["React", "JavaScript", "CSS", "Tailwind", "Next.js"],
    matchScore: 82,
    email: "emily.w@email.com",
  },
  {
    id: "4",
    name: "David Kim",
    title: "Backend Engineer",
    location: "Seattle, WA",
    experience: "6 years",
    education: "MS Computer Engineering",
    skills: ["Go", "Rust", "Kubernetes", "gRPC", "Redis"],
    matchScore: 79,
    email: "david.kim@email.com",
  },
  {
    id: "5",
    name: "Jessica Martinez",
    title: "DevOps Engineer",
    location: "Denver, CO",
    experience: "7 years",
    education: "BS Information Technology",
    skills: ["AWS", "Terraform", "Jenkins", "Python", "Linux"],
    matchScore: 85,
    email: "j.martinez@email.com",
  },
]

export const mockApplications = [
  {
    id: "1",
    jobTitle: "Senior Frontend Engineer",
    company: "TechCorp Inc.",
    status: "Under Review",
    appliedDate: "Dec 15, 2024",
    matchScore: 92,
  },
  {
    id: "2",
    jobTitle: "Lead Developer",
    company: "StartupXYZ",
    status: "Interview Scheduled",
    appliedDate: "Dec 10, 2024",
    matchScore: 88,
  },
  {
    id: "3",
    jobTitle: "Software Architect",
    company: "Enterprise Corp",
    status: "Application Sent",
    appliedDate: "Dec 18, 2024",
    matchScore: 85,
  },
]

export const mockFeedback = {
  overall: {
    score: 85,
    summary:
      "Your resume demonstrates strong technical skills and relevant experience. There are a few areas where improvements could help you stand out even more to potential employers.",
  },
  sections: [
    {
      title: "Professional Summary",
      score: 90,
      feedback:
        "Your summary effectively highlights your key strengths and experience level. Consider adding specific metrics or achievements to make it more impactful.",
      suggestions: [
        "Add quantifiable achievements (e.g., 'Led team of 5 engineers')",
        "Include specific technologies you specialize in",
        "Mention years of experience in the first line",
      ],
    },
    {
      title: "Work Experience",
      score: 85,
      feedback:
        "Good use of action verbs and relevant experience. Some bullet points could benefit from more specific outcomes and metrics.",
      suggestions: [
        "Quantify impact where possible (revenue, efficiency gains, etc.)",
        "Use the STAR method for describing achievements",
        "Ensure each role shows progression",
      ],
    },
    {
      title: "Skills Section",
      score: 80,
      feedback: "Your skills are well-organized but could be more strategically presented to align with target roles.",
      suggestions: [
        "Prioritize skills most relevant to your target roles",
        "Add proficiency levels for key technologies",
        "Include both technical and soft skills",
      ],
    },
    {
      title: "Education",
      score: 88,
      feedback: "Education section is clear and well-formatted. Consider adding relevant coursework or certifications.",
      suggestions: [
        "Add relevant certifications if any",
        "Include notable projects or thesis work",
        "Mention honors or GPA if notable",
      ],
    },
  ],
  keywords: {
    found: ["React", "TypeScript", "Node.js", "AWS", "CI/CD", "Agile"],
    missing: ["Docker", "Kubernetes", "GraphQL", "Testing"],
    recommendation:
      "Consider adding experience with containerization and testing frameworks to strengthen your profile.",
  },
}

export const mockMatchResults = {
  candidate: mockCandidates[0],
  job: mockJobs[0],
  overallScore: 92,
  breakdown: [
    { category: "Technical Skills", score: 95, weight: 40 },
    { category: "Experience Level", score: 90, weight: 25 },
    { category: "Education", score: 88, weight: 15 },
    { category: "Location Match", score: 100, weight: 10 },
    { category: "Culture Fit", score: 85, weight: 10 },
  ],
  strengths: [
    "Strong proficiency in React and TypeScript",
    "8 years of relevant industry experience",
    "Experience with Next.js framework",
    "Located in target job market",
  ],
  gaps: [
    "Limited experience with GraphQL",
    "No mention of testing frameworks",
    "Could benefit from more leadership examples",
  ],
  recommendation:
    "This is an excellent match. The candidate's technical skills and experience align well with the job requirements. Schedule an interview to assess cultural fit and leadership potential.",
}

export const testimonials = [
  {
    quote: "HireAI helped us reduce our time-to-hire by 60%. The AI matching is incredibly accurate.",
    author: "Jennifer Lee",
    role: "VP of Talent, TechCorp",
  },
  {
    quote: "Finally landed my dream job thanks to the resume feedback. The suggestions were spot-on.",
    author: "Marcus Johnson",
    role: "Software Engineer",
  },
  {
    quote: "The candidate matching saves us hours of manual resume screening every week.",
    author: "Amanda Foster",
    role: "HR Director, StartupXYZ",
  },
]

export const stats = [
  { value: "50K+", label: "Candidates Matched" },
  { value: "5,000+", label: "Companies Hiring" },
  { value: "85%", label: "Interview Success Rate" },
  { value: "60%", label: "Faster Hiring" },
]
