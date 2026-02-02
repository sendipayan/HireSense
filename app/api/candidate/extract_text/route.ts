import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { extractTextFromPDF } from "@/lib/pdf-parser";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();
  const { resumeId } = body;

  if (!resumeId) {
    return NextResponse.json({ error: "Missing resume Id" }, { status: 400 });
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume Not Found" }, { status: 404 });
  }

  try {
    // Extract text using the utility function from lib
    const text = await extractTextFromPDF(resume.resumeUrl);

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract text from PDF",
      },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
