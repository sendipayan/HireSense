import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const searchParams = req.nextUrl.searchParams;

  const query = searchParams.get("query");

  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Query is required", result: [] },
      { status: 400 },
    );
  }

  const searchTerm = query.toLowerCase();

  const skills = await prisma.skill.findMany({
    where: {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          // Search in category array
          category: {
            has: searchTerm,
          },
        },
        {
          // Search in aliases array
          aliases: {
            has: searchTerm,
          },
        },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      popularity: "desc", // Return most popular skills first
    },
  });

  if (skills.length === 0) {
    return NextResponse.json(
      { error: "No skills found", result: [] },
      { status: 404 },
    );
  }

  // Transform to { label, value } format for MultiSelect component
  const transformedSkills = skills.map((skill) => ({
    label: skill.name,
    value: skill.id,
  }));

  // Return 200 with transformed data
  return NextResponse.json({ result: transformedSkills }, { status: 200 });
}

export const GET = withAuth(handler, {
  allowedRoles: ["CANDIDATE", "RECRUITER"],
});
