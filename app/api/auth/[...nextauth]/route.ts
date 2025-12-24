import NextAuth, { Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    /**
     * 1️⃣ Runs FIRST on Google sign-in
     * Decide whether to allow OAuth login/signup
     */
    async signIn({ user }: { user: User }) {
      if (!user.email) return false;

      /**
       * RULE:
       * - If user exists → allow login
       * - If user does NOT exist → allow signup (role later)
       */
      return true;
    },

    /**
     * 2️⃣ Runs on every JWT creation/update
     */
    async jwt({ token }: { token: JWT }) {
      if (!token.email) return token;

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
      });

      if (dbUser) {
        token.name = dbUser.name;
        token.userId = dbUser.id;
        token.role = dbUser.role;
        token.isNewUser = false;
      } else {
        token.isNewUser = true;
      }

      return token;
    },

    /**
     * 3️⃣ Expose safe fields to the client
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.isNewUser = token.isNewUser;
      session.user.name = token.name;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
