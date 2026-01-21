import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function handler(
  req: NextRequest,
  user: { userId: string; role: string },
) {
  const body = await req.json();
  const { paramsToSign, uploadType } = body;

  // Dynamically set folder based on upload type
  if (uploadType === "resume") {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 },
      );
    }

    paramsToSign.folder = `resumes/${candidate.id}`;
  } else if (uploadType === "profile") {
    paramsToSign.folder = `profile/${user.userId}`;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    signature,
    params: paramsToSign,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}

export const POST = withAuth(handler);
