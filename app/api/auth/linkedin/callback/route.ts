import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
    const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
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

  const { access_token } = await tokenRes.json();

  // Step 2: Fetch user info
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { sub, name, email } = await userRes.json();

  // Step 3: sub, name, email → save to your DB here
  console.log({ sub, name, email });
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

  // Step 4: return to your frontend with the data
  return NextResponse.json({ sub, name, email });
}

export const GET = withAuth(handler, { allowedRoles: ["CANDIDATE","RECRUITER"] });

