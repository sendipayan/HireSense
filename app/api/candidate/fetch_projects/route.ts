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
    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: user.userId,
      },
      select: {
        id: true,
      },
    });
    if (!candidate)
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    const access_token = await prisma.github.findUnique({
      where: {
        candidateId: candidate.id,
      },
      select: {
        accessToken: true,
      },
    });
    if (!access_token)
      return NextResponse.json(
        { error: "Access token not found" },
        { status: 404 },
      );
    const projects = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${access_token.accessToken}`,
      },
    });
    const projectsData = await projects.json();
    const project = projectsData.map((project: any) => ({
      githubRepoId: project.id,
      title: project.name,
      description: project?.description,
      repoUrl: project?.html_url,
      liveLink: project?.homepage,
      language: project?.language,
      stars: project?.stargazers_count,
      forks: project?.forks_count,
      githubUpdatedAt: project?.pushed_at,
    }));
    console.log(project);

    return NextResponse.json({ project }, { status: 200 });
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
