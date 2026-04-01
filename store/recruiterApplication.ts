import { create } from "zustand";

export type ApplicationJob = {
  title: string;
  id: string;
};

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "NONE";

type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLIST"
  | "SCHEDULED";

type Candidate = {
  id: string;
  institution: string;
  experienceLevel: ExperienceLevel;
  degree: string;
  user: {
    name: string;
    profilePic?: string;
  };
};

type Resume = {
  resumeName: string;
  resumeUrl: string;
  resumeMimeType: string;
  resumeSize: number;
  id: string;
};

type Application = {
  candidate: Candidate;
  createdAt: string;
  id: string;
  score: number;
  status: ApplicationStatus;
  job: ApplicationJob;
  resume: Resume;
};

type ApplicationsState = {
  applications: Application[];

  // actions
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  clear: () => void;
};

export const useRecruiterApplicationsStore = create<ApplicationsState>(
  (set) => ({
    applications: [],

    setApplications: (apps) => set({ applications: apps }),

    addApplication: (app) =>
      set((state) => ({
        applications: [app, ...state.applications],
      })),

    clear: () => set({ applications: [] }),
  }),
);
