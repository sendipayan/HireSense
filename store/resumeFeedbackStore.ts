import { create } from "zustand";

export type ResumeAts = {
  id: string;
  resume_id: string;
  ATS_score?: number | null;
  section_score?: number | string | null;
  contact_score?: number | string | null;
  formating_score?: number | string | null;
  issues: string[];
  created_at?: string | Date | null;
};

export type ResumeRecommendation = {
  id: string;
  resume_id: string;
  Title?: string | null;
  score?: number | null;
  Responsibilities?: string[];
  primary_skill?: Record<string, unknown> | null;
  secondry_skill?: Record<string, unknown> | null;
  projects?: Record<string, unknown> | null;
  experience?: Record<string, unknown> | null;
  achievment?: Record<string, unknown> | null;
  achievement?: Record<string, unknown> | null;
  certificates?: Record<string, unknown> | null;
  created_at?: string | Date | null;
};

export type Resume = {
  id: string;
  candidateId: string;
  resumeUrl: string;
  resumeMimeType: string;
  resumeName: string;
  resumeSize: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  resumeScore: number;
  resume_ats?: ResumeAts | null;
  resume_recommendations: ResumeRecommendation[];
};

type ResumeFeedbackStore = {
  resume: Resume | null;
  setResume: (resume: Resume | null) => void;
  setResumeAts: (ats: ResumeAts | null) => void;
  setResumeRecommendations: (recommendations: ResumeRecommendation[]) => void;
  clearResume: () => void;
};

export const useResumeFeedbackStore = create<ResumeFeedbackStore>((set) => ({
  resume: null,
  setResume: (resume) => set({ resume }),
  setResumeAts: (resumeAts) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, resume_ats: resumeAts } : null,
    })),
  setResumeRecommendations: (resumeRecommendations) =>
    set((state) => ({
      resume: state.resume
        ? { ...state.resume, resume_recommendations: resumeRecommendations }
        : null,
    })),
  clearResume: () => set({ resume: null }),
}));
