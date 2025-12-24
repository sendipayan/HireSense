import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      id?: string;
      email: string;
      role?: "CANDIDATE" | "RECRUITER";
      isNewUser?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name?: string;
    d;
    userId?: string;
    role?: "CANDIDATE" | "RECRUITER";
    isNewUser?: boolean;
  }
}
