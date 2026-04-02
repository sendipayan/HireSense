// src/inngest/functions.ts
import { inngest } from "./client";
import axios from "axios";
import prisma from "@/lib/prisma";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  },
);

export const updateScore = inngest.createFunction(
  {id: "update-scores", triggers: {event: "app/update/scores"}},
  async ({event,step})=>{
    const application= await step.run("fetch-applications", async () =>{
      return await prisma.application.findMany({
        where:{
          jobId:event.data.jobId
        },
        select: {
          id:true,
          resume:true
        }
      })
    })

    await step.sendEvent("fan-out-score-events",
      application.map((app) => ({
        name: "app/jdmatch",
        data: {
          applicationId: app.id,
          resume_url:     app.resume.resumeUrl,
          tittle:      event.data.jobTitle,
          primary_skills:    event.data.primSkills,
          secondry_skill:   event.data.seconSkills,
          description:       event.data.jobResp,
        }
      }))
    )

    return {message: `${application.length} applications found` }
  }
)

export const getScore = inngest.createFunction(
  { id: "process-score", triggers: { event: "app/jdmatch" } },
  async ({ event, step }) => {
    const result = await step.run("call-backend", async () => {
        try{
      const { data } = await axios.post(
        "https://53jljxuloivay4q5n3pizi274m0deskh.lambda-url.eu-north-1.on.aws/jdmatch",
        {
          resume_url: event.data.resume_url,
          j_title: event.data.tittle,
          prim_skills: event.data.primary_skills,
          secon_skills: event.data.secondry_skill,
          j_resp: event.data.description,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return  data ;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Status:", error.response?.status)
      console.log("Response body:", error.response?.data)  
      console.log("Request payload:", error.config?.data)
    }
    throw error
  }
    });

    const save= await step.run("save-db", async()=>{
        const rec = result.recommendations[0] 
        console.log(rec)
        const application=await prisma.$transaction([
            prisma.application.update({
                where:{
                    id:event.data.applicationId
                },
                data:{
                   score: rec.score
                }
            }),
            prisma.application_report.upsert({
                where:{applicationId:event.data.applicationId},
                create:{
                    applicationId: event.data.applicationId,
                    missing_sections: result.missing_sections,
                    achievment: rec.achievment,
                    certificates: rec.certificates,
                    experience: rec.experience,
                    primary_skill: rec.primary_skill,
                    projects: rec.projects,
                    secondry_skill: rec.secondry_skill
                },
                update:{
                    missing_sections: result.missing_sections,
                    achievment: rec.achievment,
                    certificates: rec.certificates,
                    experience: rec.experience,
                    primary_skill: rec.primary_skill,
                    projects: rec.projects,
                    secondry_skill: rec.secondry_skill
                }
            })
        ])

        return application;
    } )
  },
);

export const functions = [processTask, getScore,updateScore];