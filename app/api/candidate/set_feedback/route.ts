import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();
  const { ats, recomendation, resume_id } = body;

  if (!resume_id || !ats) {
    return NextResponse.json(
      { error: "Missing resume_id or ats" },
      { status: 400 },
    );
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  const score =
  ats?.ATS_score == null ? 0 : Math.round(Number(ats.ATS_score));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const atsRecord = await tx.resume_ats.create({
        data: {
          resume_id,
          ATS_score: ats.ATS_score,
          section_score: ats.section_score,
          contact_score: ats.contact_score,
          formating_score: ats.formating_score,
          issues: ats.issues,
        },
      });

      const createdRecommendations: any[] = [];
      const roles: string[]=[];
      const recommendationArray = Array.isArray(recomendation)
        ? recomendation
        : [];

      for (const rec of recommendationArray) {
        roles.push(rec?.Title)
        const created = await tx.resume_recommendations.create({
          data: {
            resume_id,
            Title: rec?.Title ?? rec?.title ?? null,
            score: rec?.score ?? null,
            Responsibilities: Array.isArray(rec?.Responsibilities)
              ? rec.Responsibilities
              : [],
            primary_skill: rec?.primary_skill ?? rec?.primary_skil ?? null,
            secondry_skill:
              rec?.secondary_skill ?? rec?.secondry_skill ?? null,
            projects: rec?.projects ?? null,
            experience: rec?.experience.score ?? null,
            achievment: rec?.achievement ?? rec?.achievment ?? null,
            certificates: rec?.certificates.final_score ?? null,
          },
        });
        createdRecommendations.push(created);
      }
      console.log(roles)
      
      const profile=await tx.candidate.update({
          where:{
            id:candidate.id
          },
          data:{
            preferredRoles:roles
          }
      })

      const resume=await tx.resume.update({
        where:{
          id:resume_id
        },
        data:{
          resumeScore: score
        }
      })
      

      return { atsRecord, createdRecommendations, profile, resume };
    });

    return NextResponse.json(
      {
        message: "Feedback stored successfully",
        atsId: result.atsRecord.id,
        recommendations: result.createdRecommendations,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error storing feedback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
