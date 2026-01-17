-- CreateIndex
CREATE INDEX "Application_createdAt_id_idx" ON "Application"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Interview_createdAt_id_idx" ON "Interview"("createdAt", "id");

-- CreateIndex
CREATE INDEX "PostJob_createdAt_id_idx" ON "PostJob"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Resume_createdAt_id_idx" ON "Resume"("createdAt", "id");
