import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("githubUrl");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Query is required", result: [] },
        { status: 400 },
      );
    }

    let searchTerm = query.toLowerCase().trim();

    while (searchTerm.endsWith("/")) {
      searchTerm = searchTerm.slice(0, -1);
    }

    const username = searchTerm.split("/").at(-1)?.trim();

    if (!username) {
      return NextResponse.json(
        { error: "User is required", result: [] },
        { status: 400 },
      );
    }

    const result = [];
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos`);
      const data = await res.json();
      console.log(data);
      for (const repo of data) {
        result.push({
          title: repo?.name,
          description: repo?.description || "No description",
          repoUrl: repo?.html_url || "No repo url",
          liveLink: repo?.homepage || "No live link",
          language: repo?.language || "No language",
          stars: repo?.stargazers_count || 0,
          forks: repo?.forks_count || 0,
          githubRepoId: repo?.id, //flag
          githubUpdatedAt: repo?.updated_at,
        });
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch projects", result: [] },
        { status: 500 },
      );
    }

    console.log(result.length);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", result: [] },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler, {
  allowedRoles: ["CANDIDATE", "RECRUITER"],
});
