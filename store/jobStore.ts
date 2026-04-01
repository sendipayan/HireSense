import { create } from "zustand";

type Department =
  | "ENGINEERING"
  | "DESIGN"
  | "MARKETING"
  | "SALES"
  | "SUPPORT"
  | "HR"
  | "FINANCE"
  | "OPERATIONS"
  | "NONE";

type JobType = "FULL_TIME" | "INTERNSHIP" | "BOTH" | "NONE";

type ExperienceRequired =
  | "ENTRY_LEVEL"
  | "MID_LEVEL"
  | "SENIOR_LEVEL"
  | "LEAD"
  | "EXECUTIVE"
  | "NONE";

type JobStatus = "ACTIVE" | "CLOSED";

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  department: Department;
  jobType: JobType;
  experienceRequired: ExperienceRequired;
  primary_skills: string[],
  secondry_skill: string[],
  benifits: string[];
  createdAt: string;
  updatedAt: string;
  recruiter?: string;
  applied?: boolean;
  status: JobStatus;
}

interface JobStore {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  removeJob: (id: string) => void;
  clear: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],

  setJobs: (jobs) => set({ jobs }),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),

  updateJob: (job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    })),

  clear: () => set({ jobs: [] }),
}));
