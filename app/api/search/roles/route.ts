import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import "dotenv/config";

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

  const searchTerm = query.toLowerCase().trim();

  // 1. Lexical Search (Exact/Partial Match)
  const roles: { id: string; name: string }[] = await prisma.role.findMany({
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
      popularity: "desc", // Return most popular roles first
    },
  });

  console.log("Lexical search results: ", roles.length);
  // 2. Semantic Search (Vector Match) if we have fewer than 10 results
  if (roles.length < 10) {
    try {
      const res = await fetch(`${process.env.PYTHON_URL}/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: searchTerm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const queryVector = `[${data.embedding.join(",")}]`;

        // Fetch up to 10 semantic matches
        const results = await prisma.$queryRaw<
          { id: string; name: string; similarity: number }[]
        >`
          SELECT
            id,
            name,
            1 - (embedding <=> ${queryVector}::vector) AS similarity
          FROM "Role"
          WHERE 1 - (embedding <=> ${queryVector}::vector) >= 0.40
          ORDER BY embedding <=> ${queryVector}::vector
          LIMIT 10;
        `;

        // Filter out duplicates that are already in the lexical 'roles' list
        const filteredResults = results.filter(
          (result) => !roles.some((role) => role.id === result.id),
        );
        console.log("Semantic search results: ", filteredResults.length);
        // Add semantic matches to the list
        roles.push(...filteredResults.map((r) => ({ id: r.id, name: r.name })));
      } else {
        console.error("Failed to fetch embeddings for roles:", res.statusText);
      }
    } catch (error) {
      console.error("Semantic search error in roles:", error);
      // Fail silently and return whatever lexical results we have
    }
  }

  if (roles.length === 0) {
    return NextResponse.json(
      { error: "No matching roles found", result: [] },
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
