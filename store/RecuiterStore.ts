import { create } from "zustand";

type BaseUser = {
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
};

type verificationStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  isVerified: verificationStatus;
  failedReasons?: any;
};

type RecruiterStore = {
  RecuiterProfile: RecruiterProfile | null;
  setRecuiterProfile: (profile: RecruiterProfile | null) => void;
  clearRecuiterProfile: () => void;
};

export const useRecruiterStore = create<RecruiterStore>((set) => ({
  RecuiterProfile: null,

  setRecuiterProfile: (profile) => set({ RecuiterProfile: profile }),

  clearRecuiterProfile: () => set({ RecuiterProfile: null }),
}));
