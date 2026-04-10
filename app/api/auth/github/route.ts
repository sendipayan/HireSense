import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload || payload.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Missing GitHub OAuth environment variables." },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo",
    state,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
  );

  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
