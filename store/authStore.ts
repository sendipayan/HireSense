import { create } from "zustand";

type User = {
  id: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
};

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  setUser: (user) =>
    set({
      user,
      isLoggedIn: !!user,
    }),

  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),
}));
