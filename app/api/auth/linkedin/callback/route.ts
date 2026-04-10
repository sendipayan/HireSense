import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { AUTH_USER_CACHE_TTL_SECONDS } from "@/lib/auth";
import { cookies } from "next/headers";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // ✅ Handle cancel / any OAuth error
  if (error) {
    console.log('LinkedIn OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/${user.role.toLowerCase()}/profile`, req.url));
  }

  // Validate CSRF state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("linkedin_oauth_state")?.value;
  cookieStore.delete("linkedin_oauth_state");

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state. Please try again." },
      { status: 403 },
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'No code received' }, { status: 400 });
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing LinkedIn OAuth environment variables.' },
      { status: 500 }
    );
  }

  // Step 1: Exchange code for access token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    console.error("LinkedIn token exchange failed:", tokenRes.status, await tokenRes.text());
    return NextResponse.redirect(
      new URL(`/${user.role.toLowerCase()}/profile`, req.url),
    );
  }

  const { access_token } = await tokenRes.json();

  // Step 2: Fetch user info
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    console.error("LinkedIn userinfo fetch failed:", userRes.status, await userRes.text());
    return NextResponse.redirect(
      new URL(`/${user.role.toLowerCase()}/profile`, req.url),
    );
  }

  const { sub, name, email } = await userRes.json();

  if (!name) {
    console.error("LinkedIn userinfo response missing name");
    return NextResponse.redirect(
      new URL(`/${user.role.toLowerCase()}/profile`, req.url),
    );
  }

  // Step 3: sub, name, email → save to your DB here

  if(user.role==="CANDIDATE"){
    await prisma.candidate.update({
        where:{
            userId: user.userId
        },
        data:{
            linkedinName:name
        }
    })
  } else{
    await prisma.recruiter.update({
        where:{
            userId: user.userId
        },
        data:{
            linkedinName:name
        }
    })
  }

  try {
    const cacheKey = `user:${user.userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cachedUser = JSON.parse(cached);
      const updatedUser = {
        ...cachedUser,
        linkedinName: name,
      };
      await redis.set(
        cacheKey,
        JSON.stringify(updatedUser),
        "EX",
        AUTH_USER_CACHE_TTL_SECONDS,
      );
    } else if (user.role === "CANDIDATE") {
      const refreshedUser = await prisma.candidate.findUnique({
        where: { userId: user.userId },
        include: {
          resumes: {
            where: { isActive: true },
            select: {
              id: true,
              resumeName: true,
              resumeUrl: true,
              createdAt: true,
            },
          },
          user: {
            select: { name: true, email: true, role: true, profilePic: true },
          },
          projects: true,
        },
      });

      if (refreshedUser) {
        await redis.set(
          cacheKey,
          JSON.stringify(refreshedUser),
          "EX",
          AUTH_USER_CACHE_TTL_SECONDS,
        );
      }
    } else {
      const refreshedUser = await prisma.recruiter.findUnique({
        where: { userId: user.userId },
        include: {
          user: {
            select: { name: true, email: true, role: true, profilePic: true },
          },
        },
      });

      if (refreshedUser) {
        await redis.set(
          cacheKey,
          JSON.stringify(refreshedUser),
          "EX",
          AUTH_USER_CACHE_TTL_SECONDS,
        );
      }
    }
  } catch (err) {
    console.error("Redis cache update error", err);
  }

  // Step 4: return to your frontend
  return NextResponse.redirect(
    new URL(`/${user.role.toLowerCase()}/profile`, req.url),
  );
}

export const GET = withAuth(handler, { allowedRoles: ["CANDIDATE","RECRUITER"] });
