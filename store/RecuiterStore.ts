import { create } from "zustand";

type BaseUser = {
  name: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
};

type verificationStatus = "PENDING" | "APPROVED" | "REJECTED";
type CompanySize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

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
  companySize?: CompanySize | null;
  isVerified: verificationStatus;
  failedReasons?: any;
  linkedinName?: string | null;
  hiringForRoles?: { id: string; name: string }[];
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
