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

  const roles = await prisma.role.findMany({
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

  if (roles.length === 0) {
    return NextResponse.json(
      { error: "No roles found", result: [] },
      { status: 404 },
    );
  }

  // Transform to { label, value } format for MultiSelect component
  const transformedRoles = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  // Return 200 with transformed data
  return NextResponse.json({ result: transformedRoles }, { status: 200 });
}

export const GET = withAuth(handler, {
  allowedRoles: ["CANDIDATE", "RECRUITER"],
});
