import { create } from "zustand";

type BaseUser = {
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
};

type CandidateStatus =
  | "STUDENT"
  | "GRADUATE"
  | "WORKING_PROFESSIONAL"
  | "NONE";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "NONE";

type JobType = "INTERNSHIP" | "BOTH" | "FULL_TIME" | "NONE";

type Availability =
  | "IMMEDIATE"
  | "ONE_TO_THREE_MONTHS"
  | "THREE_TO_SIX_MONTHS"
  | "LATER"
  | "NONE";

type Resume = {
  id: string;
  resumeName: string;
  resumeUrl: string;
  createdAt: string;
};

type Project = {
  id: string;
  candidateId: string;
  title: string;
  description?: string | null;
  repoUrl?: string | null;
  liveLink?: string | null;
  githubRepoId?: number | null;
  language?: string | null;
  stars?: number | null;
  forks?: number | null;
  createdAt: string;
  updatedAt: string;
  githubUpdatedAt?: string | null;
};

type CandidateProfile = {
  id: string;
  userId: string;
  user: BaseUser;
  resumes: Resume[];
  projects: Project[];
  phoneNumber?: string | null;
  status?: CandidateStatus | null;
  institution?: string | null;
  graduationYear?: string | null;
  degree?: string | null;
  experienceLevel?: ExperienceLevel | null;
  
  preferredRoles?: string[];
  githubUrl?: string | null;
  linkedinName?: string | null;
  portfolioUrl?: string | null;
  jobTypePreference?: JobType | null;
  openToWork: boolean;
  isVerified: boolean;
  availability?: Availability | null;
};

type CandidateStore = {
  candidateProfile: CandidateProfile | null;
  setCandidateProfile: (profile: CandidateProfile | null) => void;
  clearCandidateProfile: () => void;
};

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidateProfile: null,

  setCandidateProfile: (profile) => set({ candidateProfile: profile }),

  clearCandidateProfile: () => set({ candidateProfile: null }),
}));
