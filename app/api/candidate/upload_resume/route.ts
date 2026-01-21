import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handler(
  req: NextRequest,
  user: { userId: string; role: string },
) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `resumes/${candidate?.id}`,
            resource_type: "raw",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Check for existing active resume
    const existing = await prisma.resume.findMany({
      where: {
        candidateId: candidate.id,
        isActive: true,
      },
    });

    let activeResume = false;
    if (existing.length === 0) {
      activeResume = true;
    }

    const resume = await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        resumeUrl: uploadResult.secure_url,
        resumeMimeType: file.type,
        resumeSize: uploadResult.bytes,
        resumeName: file.name,
        isActive: activeResume,
      },
    });

    return NextResponse.json(
      { message: "Resume uploaded successfully", id: resume.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
