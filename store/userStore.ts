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
  availability?: string | null;
};

type RecruiterProfile = {
  id: string;
  userId: string;
  user: BaseUser;

  jobTitle?: string | null;
  phoneNumber?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  companyLinkedIn?: string | null;
  industry?: string | null;
  companySize?: string | null;
  hiringForRoles?: any;
  isVerified: boolean;
};

export type UserProfile = CandidateProfile | RecruiterProfile;

type UserStore = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clearProfile: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  clearProfile: () => set({ profile: null }),
}));
