import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // We verify the user is logged in before allowing them to sign an upload
    const payload = verifyJwt(token);
    if (!payload?.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { paramsToSign, uploadType } = body;

    // Dynamically set folder based on upload type
    if (uploadType === "resume") {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: payload.userId },
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
      paramsToSign.folder = `profile/${payload.userId}`;
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
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
