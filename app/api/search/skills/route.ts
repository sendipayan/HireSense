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
  // Use a mutable array type that allows extra properties if needed, or strictly { id, name }
  const skills: { id: string; name: string }[] = await prisma.skill.findMany({
    where: {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            has: searchTerm,
          },
        },
        {
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
      popularity: "desc",
    },
  });

  // 2. Semantic Search (Vector Match) if we usually want more results or if lexical failed
  // We perform this if we have fewer than 10 results, to fill the list.
  console.log("Lexical search results: ", skills.length);
  if (skills.length < 10) {
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
          FROM "Skill"
          WHERE 1 - (embedding <=> ${queryVector}::vector) >= 0.40
          ORDER BY embedding <=> ${queryVector}::vector
          LIMIT 10;
        `;

        // Filter out duplicates that are already in the lexical 'skills' list
        const filteredResults = results.filter(
          (result) => !skills.some((skill) => skill.id === result.id),
        );

        console.log("Semantic search results: ", filteredResults.length);

        // Add semantic matches to the list
        // We push only id and name to match the type
        skills.push(
          ...filteredResults.map((r) => ({ id: r.id, name: r.name })),
        );
      } else {
        console.error("Failed to fetch embeddings:", res.statusText);
      }
    } catch (error) {
      console.error("Semantic search error:", error);
      // Fail silently and return whatever lexical results we have
    }
  }

  // If still no results after both searches
  if (skills.length === 0) {
    return NextResponse.json(
      { error: "No matching skills found", result: [] },
      { status: 404 },
    );
  }

  // Transform to { label, value } format for MultiSelect component
  const transformedSkills = skills.map((skill) => ({
    label: skill.name,
    value: skill.id,
  }));

  return NextResponse.json({ result: transformedSkills }, { status: 200 });
}

export const GET = withAuth(handler, {
  allowedRoles: ["CANDIDATE", "RECRUITER"],
});
