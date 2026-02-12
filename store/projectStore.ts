import { create } from "zustand";

export type Project = {
  title: string;
  description?: string | null;
  repoUrl?: string | null;
  liveLink?: string | null;
  githubRepoId: number;
  language?: string | null;
  stars?: number | null;
  forks?: number | null;
  githubUpdatedAt?: Date | string | null;
};

type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: number, updatedData: Partial<Project>) => void;
  removeProject: (id: number) => void;
  clearProjects: () => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updatedData) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.githubRepoId === id ? { ...p, ...updatedData } : p,
      ),
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.githubRepoId !== id),
    })),

  clearProjects: () => set({ projects: [] }),
}));
