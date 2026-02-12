import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  if (!token?.userId || token.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 400 },
    );
  }

  // Now fetch user data
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const githubUser = await userRes.json();

  const candidate = await prisma.candidate.findUnique({
    where: {
      userId: token.userId,
    },
    select: {
      id: true,
    },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  await prisma.github.upsert({
    where: {
      id: String(githubUser.id),
    },
    update: {
      accessToken: accessToken,
      connectedAt: new Date(),
      avatarUrl: githubUser.avatar_url,
      profileUrl: githubUser.html_url,
    },
    create: {
      id: String(githubUser.id),
      username: githubUser.login,
      accessToken: accessToken,
      connectedAt: new Date(),
      avatarUrl: githubUser.avatar_url,
      profileUrl: githubUser.html_url,
      candidateId: candidate.id,
    },
  });

  await prisma.candidate.update({
    where: {
      id: candidate.id,
    },
    data: {
      githubUrl: githubUser.html_url,
    },
  });

  console.log(githubUser);

  return NextResponse.redirect(new URL("/candidate/projects", req.url));
}
