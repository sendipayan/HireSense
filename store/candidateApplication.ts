import { create } from "zustand";

type ApplicationJob = {
  title: string;
  id: string;
  recruiter: {
    companyName: string | null;
  };
};

type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLIST"
  | "SCHEDULED";

type Resume = {
  resumeName: string;
  resumeUrl: string;
  resumeMimeType: string;
  resumeSize: number;
  id: string;
};

type Application = {
  id: string;
  status: ApplicationStatus;
  score: number;
  createdAt: string;
  job: ApplicationJob;
  resume: Resume;
};

type ApplicationsState = {
  applications: Application[];

  // actions
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  removeApplication: (id: string) => void;
  clear: () => void;
};

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: [],

  setApplications: (apps) => set({ applications: apps }),

  addApplication: (app) =>
    set((state) => ({
      applications: [app, ...state.applications],
    })),

  updateApplication: (id, data) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, ...data } : a,
      ),
    })),

  removeApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
    })),

  clear: () => set({ applications: [] }),
}));
