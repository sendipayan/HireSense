import { create } from "zustand";

export type ApplicationJob = {
  title: string;
  id: string;
};

type Candidate = {
  id: string;
  institution: string;
  experienceLevel: string;
  degree: string;
  primarySkills: string[];
  secondarySkills: string[];
  user: {
    name: string;
  };
};

type Application = {
  candidate: Candidate;
  createdAt: string;
  id: string;
  score: number;
  status: string;
  job: ApplicationJob;
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
  })
);
