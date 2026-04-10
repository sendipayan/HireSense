import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  if (!token?.userId || token.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const error = req.nextUrl.searchParams.get("error");

  if (error === "access_denied") {
    return NextResponse.redirect(
      new URL("/candidate/projects?github=cancelled", req.url),
    );
  }

  // Validate CSRF state parameter
  const state = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;
  cookieStore.delete("github_oauth_state");

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state. Please try again." },
      { status: 403 },
    );
  }

  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
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
      },
    );

    if (!tokenRes.ok) {
      console.error(
        "GitHub token exchange failed:",
        tokenRes.status,
        await tokenRes.text(),
      );
      return NextResponse.redirect(
        new URL("/candidate/projects?github=cancelled", req.url),
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("GitHub token exchange returned no access_token:", tokenData);
      return NextResponse.redirect(
        new URL("/candidate/projects?github=cancelled", req.url),
      );
    }

    // Now fetch user data
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      console.error(
        "GitHub user fetch failed:",
        userRes.status,
        await userRes.text(),
      );
      return NextResponse.redirect(
        new URL("/candidate/projects?github=cancelled", req.url),
      );
    }

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
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    const githubId = String(githubUser.id);
    const githubPayload = {
      username: githubUser.login,
      accessToken: accessToken,
      connectedAt: new Date(),
      avatarUrl: githubUser.avatar_url,
      profileUrl: githubUser.html_url,
    };

    await prisma.$transaction([
      prisma.candidate.update({
        where: {
          id: candidate.id,
        },
        data: {
          githubUrl: githubUser.html_url,
        },
      }),
      prisma.github.upsert({
        where: { candidateId: candidate.id },
        update: githubPayload,
        create: {
          id: githubId,
          candidateId: candidate.id,
          ...githubPayload,
        },
      }),
    ]);

    return NextResponse.redirect(new URL("/candidate/projects", req.url));
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/candidate/projects?github=cancelled", req.url),
    );
  }
}
