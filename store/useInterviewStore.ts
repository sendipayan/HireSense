import { create } from "zustand";
import { type InterviewStatus } from "@/components/interview/interview-status-badge";
export type Interview = {
  id: string;
  startAt: Date;
  duration: number;
  status: InterviewStatus;
  type: string;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  phno: string | null;
  application: {
    candidate: {
      user: {
        name: string;
      };
    };
    job: {
      title: string;
    };
  };
};

interface InterviewState {
  interviews: Interview[];
  setInterviews: (data: Interview[]) => void;
  addInterview: (interview: Interview) => void;
  updateInterviewStatus: (id: string, status: InterviewStatus) => void;
  clearInterviews: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],

  setInterviews: (data) =>
    set(() => ({
      interviews: data,
    })),

  addInterview: (interview) =>
    set((state) => ({
      interviews: [interview, ...state.interviews],
    })),

  updateInterviewStatus: (id, status) =>
    set((state) => ({
      interviews: state.interviews.map((interview) =>
        interview.id === id ? { ...interview, status } : interview
      ),
    })),

  clearInterviews: () =>
    set(() => ({
      interviews: [],
    })),
}));
