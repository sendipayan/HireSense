import { create } from "zustand";

export interface Cursor {
  id: string;
  createdAt: string;
}

interface CursorStore {
  cursor: Cursor | null;
  hasMore: boolean;

  setPage: (payload: { cursor: Cursor | null; hasMore: boolean }) => void;

  clear: () => void;
}

export const useCursorStore = create<CursorStore>((set) => ({
  cursor: null,
  hasMore: true,

  setPage: ({ cursor, hasMore }) => set({ cursor, hasMore }),

  clear: () =>
    set({
      cursor: null,
      hasMore: true,
    }),
}));
