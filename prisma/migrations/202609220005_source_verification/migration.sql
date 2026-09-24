ALTER TABLE "ContentVerification" ADD COLUMN "sourceId" UUID;
CREATE UNIQUE INDEX "ContentVerification_sourceId_key" ON "ContentVerification"("sourceId");
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentVerification" DROP CONSTRAINT "verification_exactly_one_target";
ALTER TABLE "ContentVerification" ADD CONSTRAINT "verification_exactly_one_target"
CHECK (num_nonnulls("boatId", "storyId", "sectionId", "patternId", "masterId", "processId", "stepId", "lessonId", "workId", "sourceId") = 1);
