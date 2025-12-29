import { create } from "zustand";

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  location: string;
  minSalary: number;
  maxSalary: string; // your sample shows this as a string
  department: string;
  jobType: string;
  experienceRequired: string;
  requirements: string[];
  optional: string[];
  benifits: string[];
  createdAt: string;
  updatedAt: string;
  recruiter?: string;
}

interface JobStore {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  clear: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],

  setJobs: (jobs) => set({ jobs }),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),

  updateJob: (job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    })),

  clear: () => set({ jobs: [] }),
}));
