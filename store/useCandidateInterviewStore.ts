import { create } from "zustand";
import { type InterviewStatus } from "@/components/interview/interview-status-badge";
export type CandidateInterview = {
  id: string;
  application: {
    job: {
      title: string;
    };
  };
  recruiter: {
    companyName: string;
    user: {
      name: string;
    };
  };
  startAt: Date;
  duration: number;
  status: InterviewStatus;
  type: string;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  phno: string | null;
};

type CandidateInterviewState = {
  interviews: CandidateInterview[];

  // actions
  setInterviews: (interviews: CandidateInterview[]) => void;
  addInterview: (interview: CandidateInterview) => void;
  updateInterview: (id: string, data: Partial<CandidateInterview>) => void;
  removeInterview: (id: string) => void;
  clear: () => void;
};

export const useCandidateInterviewStore = create<CandidateInterviewState>(
  (set) => ({
    interviews: [],

    setInterviews: (interviews) => set({ interviews }),

    addInterview: (interview) =>
      set((state) => ({
        interviews: [interview, ...state.interviews],
      })),

    updateInterview: (id, data) =>
      set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === id ? { ...i, ...data } : i
        ),
      })),

    removeInterview: (id) =>
      set((state) => ({
        interviews: state.interviews.filter((i) => i.id !== id),
      })),

    clear: () => set({ interviews: [] }),
  })
);
