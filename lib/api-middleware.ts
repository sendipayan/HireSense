import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

// Define the payload type based on your jwt.ts
export type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED";
};

type AuthOptions = {
  allowedRoles?: string[];
};

/**
 * Higher-order function to wrap API route handlers with authentication and authorization.
 *
 * @param handler The actual API route handler function. It receives (req, user, context).
 * @param options Optional configuration for roles.
 * @returns A Next.js API route handler.
 */
export function withAuth(
  handler: (
    req: NextRequest,
    user: UserPayload,
    context?: any,
  ) => Promise<NextResponse>,
  options: AuthOptions = {},
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const token = req.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      let payload: UserPayload;
      try {
        payload = verifyJwt(token);
      } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (
        options.allowedRoles &&
        !options.allowedRoles.includes(payload.role)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Pass the user payload as the second argument to the handler
      return await handler(req, payload, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
