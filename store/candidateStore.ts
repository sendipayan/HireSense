import { create } from "zustand";

type BaseUser = {
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
};

type CandidateProfile = {
  id: string;
  userId: string;
  user: BaseUser;
  phoneNumber?: string | null;
  status?: string | null;
  institution?: string | null;
  graduationYear?: string | null;
  degree?: string | null;
  primarySkills?: any;
  secondarySkills?: any;
  experienceLevel?: string | null;
  preferredRoles?: any;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  jobTypePreference?: string | null;
  openToWork: boolean;
  isVerified: boolean;
  availability?: string | null;
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
