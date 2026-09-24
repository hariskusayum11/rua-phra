-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REVISION_REQUIRED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEARNER', 'EDITOR', 'REVIEWER', 'ADMIN');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ORDERING', 'MATCHING', 'IMAGE_HOTSPOT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LEARNER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temple" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Temple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boat" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "concept" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "competition" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "templeId" TEXT NOT NULL,

    CONSTRAINT "Boat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoatStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "boatId" TEXT NOT NULL,

    CONSTRAINT "BoatStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoatSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "meaning" TEXT,
    "image" TEXT,
    "boatId" TEXT NOT NULL,

    CONSTRAINT "BoatSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT,
    "category" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL,
    "meaning" TEXT,
    "historicalNote" TEXT,
    "image" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoatPattern" (
    "boatId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,

    CONSTRAINT "BoatPattern_pkey" PRIMARY KEY ("boatId","patternId")
);

-- CreateTable
CREATE TABLE "BoatSectionPattern" (
    "sectionId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,

    CONSTRAINT "BoatSectionPattern_pkey" PRIMARY KEY ("sectionId","patternId")
);

-- CreateTable
CREATE TABLE "Master" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "portrait" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "quote" TEXT,
    "experience" INTEGER,
    "interviewUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterPattern" (
    "masterId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,

    CONSTRAINT "MasterPattern_pkey" PRIMARY KEY ("masterId","patternId")
);

-- CreateTable
CREATE TABLE "MasterBoat" (
    "masterId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,

    CONSTRAINT "MasterBoat_pkey" PRIMARY KEY ("masterId","boatId")
);

-- CreateTable
CREATE TABLE "MasterExpertise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,

    CONSTRAINT "MasterExpertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeProcess" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KnowledgeProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "instructions" JSONB NOT NULL,
    "tips" TEXT,
    "warnings" TEXT,
    "videoUrl" TEXT,
    "image" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "processId" TEXT NOT NULL,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepMaterial" (
    "stepId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "StepMaterial_pkey" PRIMARY KEY ("stepId","materialId")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepTool" (
    "stepId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,

    CONSTRAINT "StepTool_pkey" PRIMARY KEY ("stepId","toolId")
);

-- CreateTable
CREATE TABLE "Technique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Technique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepTechnique" (
    "stepId" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,

    CONSTRAINT "StepTechnique_pkey" PRIMARY KEY ("stepId","techniqueId")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "credit" TEXT,
    "consentId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "informant" TEXT,
    "interviewDate" TIMESTAMP(3),
    "fieldNote" TEXT,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSourceLink" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "boatId" TEXT,
    "storyId" TEXT,
    "sectionId" TEXT,
    "patternId" TEXT,
    "masterId" TEXT,
    "processId" TEXT,
    "stepId" TEXT,
    "lessonId" TEXT,
    "workId" TEXT,

    CONSTRAINT "KnowledgeSourceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "evidenceUrl" TEXT,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVerification" (
    "id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "boatId" TEXT,
    "storyId" TEXT,
    "sectionId" TEXT,
    "patternId" TEXT,
    "masterId" TEXT,
    "processId" TEXT,
    "stepId" TEXT,
    "lessonId" TEXT,
    "workId" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "ContentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonContent" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "LessonContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "configuration" JSONB,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentWork" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternId" TEXT,
    "inspiration" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "reflection" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentWorkMedia" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "StudentWorkMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkFeedback" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PatternToProcessStep" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PatternToProcessStep_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MasterToProcessStep" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MasterToProcessStep_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Temple_slug_key" ON "Temple"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Boat_slug_key" ON "Boat"("slug");

-- CreateIndex
CREATE INDEX "Boat_year_templeId_idx" ON "Boat"("year", "templeId");

-- CreateIndex
CREATE UNIQUE INDEX "Pattern_slug_key" ON "Pattern"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Master_slug_key" ON "Master"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeProcess_slug_key" ON "KnowledgeProcess"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_slug_key" ON "ProcessStep"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Technique_name_key" ON "Technique"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_boatId_key" ON "KnowledgeSourceLink"("sourceId", "boatId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_storyId_key" ON "KnowledgeSourceLink"("sourceId", "storyId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_sectionId_key" ON "KnowledgeSourceLink"("sourceId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_patternId_key" ON "KnowledgeSourceLink"("sourceId", "patternId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_masterId_key" ON "KnowledgeSourceLink"("sourceId", "masterId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_processId_key" ON "KnowledgeSourceLink"("sourceId", "processId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_stepId_key" ON "KnowledgeSourceLink"("sourceId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_lessonId_key" ON "KnowledgeSourceLink"("sourceId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeSourceLink_sourceId_workId_key" ON "KnowledgeSourceLink"("sourceId", "workId");

-- CreateIndex
CREATE UNIQUE INDEX "Consent_sourceId_key" ON "Consent"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_boatId_key" ON "ContentVerification"("boatId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_storyId_key" ON "ContentVerification"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_sectionId_key" ON "ContentVerification"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_patternId_key" ON "ContentVerification"("patternId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_masterId_key" ON "ContentVerification"("masterId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_processId_key" ON "ContentVerification"("processId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_stepId_key" ON "ContentVerification"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_lessonId_key" ON "ContentVerification"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVerification_workId_key" ON "ContentVerification"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_code_key" ON "QRCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_courseId_slug_key" ON "Lesson"("courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "StudentWork_slug_key" ON "StudentWork"("slug");

-- CreateIndex
CREATE INDEX "_PatternToProcessStep_B_index" ON "_PatternToProcessStep"("B");

-- CreateIndex
CREATE INDEX "_MasterToProcessStep_B_index" ON "_MasterToProcessStep"("B");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatStory" ADD CONSTRAINT "BoatStory_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatSection" ADD CONSTRAINT "BoatSection_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatPattern" ADD CONSTRAINT "BoatPattern_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatPattern" ADD CONSTRAINT "BoatPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatSectionPattern" ADD CONSTRAINT "BoatSectionPattern_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BoatSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatSectionPattern" ADD CONSTRAINT "BoatSectionPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPattern" ADD CONSTRAINT "MasterPattern_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPattern" ADD CONSTRAINT "MasterPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterBoat" ADD CONSTRAINT "MasterBoat_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterBoat" ADD CONSTRAINT "MasterBoat_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterExpertise" ADD CONSTRAINT "MasterExpertise_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "KnowledgeProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepMaterial" ADD CONSTRAINT "StepMaterial_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepMaterial" ADD CONSTRAINT "StepMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTool" ADD CONSTRAINT "StepTool_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTool" ADD CONSTRAINT "StepTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTechnique" ADD CONSTRAINT "StepTechnique_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTechnique" ADD CONSTRAINT "StepTechnique_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "Consent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "BoatStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BoatSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_processId_fkey" FOREIGN KEY ("processId") REFERENCES "KnowledgeProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_workId_fkey" FOREIGN KEY ("workId") REFERENCES "StudentWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "BoatStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BoatSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_processId_fkey" FOREIGN KEY ("processId") REFERENCES "KnowledgeProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_workId_fkey" FOREIGN KEY ("workId") REFERENCES "StudentWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVerification" ADD CONSTRAINT "ContentVerification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonContent" ADD CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWork" ADD CONSTRAINT "StudentWork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWork" ADD CONSTRAINT "StudentWork_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWorkMedia" ADD CONSTRAINT "StudentWorkMedia_workId_fkey" FOREIGN KEY ("workId") REFERENCES "StudentWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFeedback" ADD CONSTRAINT "WorkFeedback_workId_fkey" FOREIGN KEY ("workId") REFERENCES "StudentWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFeedback" ADD CONSTRAINT "WorkFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatternToProcessStep" ADD CONSTRAINT "_PatternToProcessStep_A_fkey" FOREIGN KEY ("A") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PatternToProcessStep" ADD CONSTRAINT "_PatternToProcessStep_B_fkey" FOREIGN KEY ("B") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MasterToProcessStep" ADD CONSTRAINT "_MasterToProcessStep_A_fkey" FOREIGN KEY ("A") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MasterToProcessStep" ADD CONSTRAINT "_MasterToProcessStep_B_fkey" FOREIGN KEY ("B") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
