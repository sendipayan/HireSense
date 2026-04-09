import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { v2 as cloudinary } from "cloudinary";
import { redis } from "@/lib/redis";
import { AUTH_USER_CACHE_TTL_SECONDS } from "@/lib/auth";

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
    if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be a PDF and less than 5MB" },
        { status: 400 },
      );
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

    const resumeCount = await prisma.resume.count({
      where: {
        candidateId: candidate.id,
      },
    });

    if (resumeCount >= 5) {
      return NextResponse.json(
        { error: "Resume upload limit reached (max 5)" },
        { status: 400 },
      );
    }

    // Check for existing active resume
    const existing = await prisma.resume.findMany({
      where: {
        candidateId: candidate.id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.subarray(0, 5).toString().startsWith("%PDF")) {
      return NextResponse.json(
        { error: "Invalid or corrupted PDF file" },
        { status: 400 },
      );
    }

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

    try {
      const cacheKey = `user:${user.userId}`;
      await redis.del(cacheKey);

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
    } catch (err) {
      console.error("Redis cache update error", err);
    }

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
