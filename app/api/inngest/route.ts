import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processTask,getScore, updateScore } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask,getScore,updateScore],
});