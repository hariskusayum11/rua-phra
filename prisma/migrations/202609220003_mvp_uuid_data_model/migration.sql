-- CreateEnum
CREATE TYPE "BoatStoryKind" AS ENUM ('MAIN', 'INSPIRATION', 'DESIGN_CONCEPT', 'COMMUNITY', 'CULTURAL_CONTEXT');

-- CreateEnum
CREATE TYPE "PatternCategory" AS ENUM ('FLORAL', 'FOLIAGE', 'GEOMETRIC', 'MYTHICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('LOCAL', 'CLOUDINARY', 'OBJECT_STORAGE', 'PLACEHOLDER');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('FIELD_INTERVIEW', 'FIELD_OBSERVATION', 'PUBLICATION', 'ARCHIVAL_DOCUMENT', 'DEMO');

-- CreateEnum
CREATE TYPE "QRTargetKind" AS ENUM ('BOAT', 'PATTERN', 'MASTER', 'PROCESS', 'STEP', 'LESSON');

-- CreateEnum
CREATE TYPE "StepMediaRole" AS ENUM ('INSTRUCTION', 'BEFORE', 'AFTER');

-- DropForeignKey
ALTER TABLE "AssessmentQuestion" DROP CONSTRAINT "AssessmentQuestion_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentResponse" DROP CONSTRAINT "AssessmentResponse_questionId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentResponse" DROP CONSTRAINT "AssessmentResponse_userId_fkey";

-- DropForeignKey
ALTER TABLE "Boat" DROP CONSTRAINT "Boat_templeId_fkey";

-- DropForeignKey
ALTER TABLE "BoatPattern" DROP CONSTRAINT "BoatPattern_boatId_fkey";

-- DropForeignKey
ALTER TABLE "BoatPattern" DROP CONSTRAINT "BoatPattern_patternId_fkey";

-- DropForeignKey
ALTER TABLE "BoatSection" DROP CONSTRAINT "BoatSection_boatId_fkey";

-- DropForeignKey
ALTER TABLE "BoatSectionPattern" DROP CONSTRAINT "BoatSectionPattern_patternId_fkey";

-- DropForeignKey
ALTER TABLE "BoatSectionPattern" DROP CONSTRAINT "BoatSectionPattern_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "BoatStory" DROP CONSTRAINT "BoatStory_boatId_fkey";

-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_boatId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_masterId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_patternId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_processId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_stepId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_storyId_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_verifiedById_fkey";

-- DropForeignKey
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_workId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_boatId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_masterId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_patternId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_processId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_stepId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_storyId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_workId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LessonContent" DROP CONSTRAINT "LessonContent_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "MasterBoat" DROP CONSTRAINT "MasterBoat_boatId_fkey";

-- DropForeignKey
ALTER TABLE "MasterBoat" DROP CONSTRAINT "MasterBoat_masterId_fkey";

-- DropForeignKey
ALTER TABLE "MasterExpertise" DROP CONSTRAINT "MasterExpertise_masterId_fkey";

-- DropForeignKey
ALTER TABLE "MasterPattern" DROP CONSTRAINT "MasterPattern_masterId_fkey";

-- DropForeignKey
ALTER TABLE "MasterPattern" DROP CONSTRAINT "MasterPattern_patternId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_consentId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessStep" DROP CONSTRAINT "ProcessStep_processId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "StepMaterial" DROP CONSTRAINT "StepMaterial_materialId_fkey";

-- DropForeignKey
ALTER TABLE "StepMaterial" DROP CONSTRAINT "StepMaterial_stepId_fkey";

-- DropForeignKey
ALTER TABLE "StepTechnique" DROP CONSTRAINT "StepTechnique_stepId_fkey";

-- DropForeignKey
ALTER TABLE "StepTechnique" DROP CONSTRAINT "StepTechnique_techniqueId_fkey";

-- DropForeignKey
ALTER TABLE "StepTool" DROP CONSTRAINT "StepTool_stepId_fkey";

-- DropForeignKey
ALTER TABLE "StepTool" DROP CONSTRAINT "StepTool_toolId_fkey";

-- DropForeignKey
ALTER TABLE "StudentWork" DROP CONSTRAINT "StudentWork_patternId_fkey";

-- DropForeignKey
ALTER TABLE "StudentWork" DROP CONSTRAINT "StudentWork_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudentWorkMedia" DROP CONSTRAINT "StudentWorkMedia_workId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkFeedback" DROP CONSTRAINT "WorkFeedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkFeedback" DROP CONSTRAINT "WorkFeedback_workId_fkey";

-- DropForeignKey
ALTER TABLE "_MasterToProcessStep" DROP CONSTRAINT "_MasterToProcessStep_A_fkey";

-- DropForeignKey
ALTER TABLE "_MasterToProcessStep" DROP CONSTRAINT "_MasterToProcessStep_B_fkey";

-- DropForeignKey
ALTER TABLE "_PatternToProcessStep" DROP CONSTRAINT "_PatternToProcessStep_A_fkey";

-- DropForeignKey
ALTER TABLE "_PatternToProcessStep" DROP CONSTRAINT "_PatternToProcessStep_B_fkey";

-- DropIndex
DROP INDEX "Material_name_key";

-- DropIndex
DROP INDEX "Technique_name_key";

-- DropIndex
DROP INDEX "Tool_name_key";

-- AlterTable
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AssessmentQuestion" DROP CONSTRAINT "AssessmentQuestion_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "assessmentId",
ADD COLUMN     "assessmentId" UUID NOT NULL,
ADD CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AssessmentResponse" DROP CONSTRAINT "AssessmentResponse_pkey",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "questionId",
ADD COLUMN     "questionId" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Boat" DROP CONSTRAINT "Boat_pkey",
DROP COLUMN "image",
ADD COLUMN     "coverMediaId" UUID,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
DROP COLUMN "templeId",
ADD COLUMN     "templeId" UUID NOT NULL,
ADD CONSTRAINT "Boat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BoatPattern" DROP CONSTRAINT "BoatPattern_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID NOT NULL,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID NOT NULL,
ADD CONSTRAINT "BoatPattern_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BoatSection" DROP CONSTRAINT "BoatSection_pkey",
DROP COLUMN "image",
ADD COLUMN     "closeupMediaId" UUID,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "slug" VARCHAR(160) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID NOT NULL,
ADD CONSTRAINT "BoatSection_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BoatSectionPattern" DROP CONSTRAINT "BoatSectionPattern_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "sectionId",
ADD COLUMN     "sectionId" UUID NOT NULL,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID NOT NULL,
ADD CONSTRAINT "BoatSectionPattern_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BoatStory" DROP CONSTRAINT "BoatStory_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "kind",
ADD COLUMN     "kind" "BoatStoryKind" NOT NULL,
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID NOT NULL,
ADD CONSTRAINT "BoatStory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "questionId",
ADD COLUMN     "questionId" UUID NOT NULL,
ADD CONSTRAINT "Choice_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "sourceId",
ADD COLUMN     "sourceId" UUID NOT NULL,
ALTER COLUMN "grantedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "revokedAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "Consent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ContentVerification" DROP CONSTRAINT "ContentVerification_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID,
DROP COLUMN "storyId",
ADD COLUMN     "storyId" UUID,
DROP COLUMN "sectionId",
ADD COLUMN     "sectionId" UUID,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID,
DROP COLUMN "masterId",
ADD COLUMN     "masterId" UUID,
DROP COLUMN "processId",
ADD COLUMN     "processId" UUID,
DROP COLUMN "stepId",
ADD COLUMN     "stepId" UUID,
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" UUID,
DROP COLUMN "workId",
ADD COLUMN     "workId" UUID,
DROP COLUMN "verifiedById",
ADD COLUMN     "verifiedById" UUID,
ALTER COLUMN "verifiedAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "ContentVerification_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "courseId",
ADD COLUMN     "courseId" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "KnowledgeProcess" DROP CONSTRAINT "KnowledgeProcess_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
ADD CONSTRAINT "KnowledgeProcess_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "KnowledgeSource" DROP CONSTRAINT "KnowledgeSource_pkey",
ADD COLUMN     "citation" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kind" "SourceKind" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "interviewDate" SET DATA TYPE DATE,
ADD CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "KnowledgeSourceLink" DROP CONSTRAINT "KnowledgeSourceLink_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "sourceId",
ADD COLUMN     "sourceId" UUID NOT NULL,
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID,
DROP COLUMN "storyId",
ADD COLUMN     "storyId" UUID,
DROP COLUMN "sectionId",
ADD COLUMN     "sectionId" UUID,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID,
DROP COLUMN "masterId",
ADD COLUMN     "masterId" UUID,
DROP COLUMN "processId",
ADD COLUMN     "processId" UUID,
DROP COLUMN "stepId",
ADD COLUMN     "stepId" UUID,
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" UUID,
DROP COLUMN "workId",
ADD COLUMN     "workId" UUID,
ADD CONSTRAINT "KnowledgeSourceLink_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "courseId",
ADD COLUMN     "courseId" UUID NOT NULL,
ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LessonContent" DROP CONSTRAINT "LessonContent_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" UUID NOT NULL,
ADD CONSTRAINT "LessonContent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" UUID NOT NULL,
ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Master" DROP CONSTRAINT "Master_pkey",
DROP COLUMN "experience",
DROP COLUMN "interviewUrl",
DROP COLUMN "portrait",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "interviewMediaId" UUID,
ADD COLUMN     "portraitMediaId" UUID,
ADD COLUMN     "practiceSinceYear" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
ADD CONSTRAINT "Master_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MasterBoat" DROP CONSTRAINT "MasterBoat_pkey",
ADD COLUMN     "contribution" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "masterId",
ADD COLUMN     "masterId" UUID NOT NULL,
DROP COLUMN "boatId",
ADD COLUMN     "boatId" UUID NOT NULL,
ADD CONSTRAINT "MasterBoat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MasterExpertise" DROP CONSTRAINT "MasterExpertise_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "masterId",
ADD COLUMN     "masterId" UUID NOT NULL,
ADD CONSTRAINT "MasterExpertise_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MasterPattern" DROP CONSTRAINT "MasterPattern_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "masterId",
ADD COLUMN     "masterId" UUID NOT NULL,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID NOT NULL,
ADD CONSTRAINT "MasterPattern_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Material" DROP CONSTRAINT "Material_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(160) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Material_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationSeconds" DOUBLE PRECISION,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kind" "MediaKind" NOT NULL,
ADD COLUMN     "provider" "MediaProvider" NOT NULL,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "url" DROP NOT NULL,
DROP COLUMN "consentId",
ADD COLUMN     "consentId" UUID,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Pattern" DROP CONSTRAINT "Pattern_pkey",
DROP COLUMN "image",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageMediaId" UUID,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
DROP COLUMN "category",
ADD COLUMN     "category" "PatternCategory" NOT NULL,
ADD CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProcessStep" DROP CONSTRAINT "ProcessStep_pkey",
DROP COLUMN "image",
DROP COLUMN "videoUrl",
ADD COLUMN     "coverMediaId" UUID,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoMediaId" UUID,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
ALTER COLUMN "instructions" SET DEFAULT '[]',
DROP COLUMN "processId",
ADD COLUMN     "processId" UUID NOT NULL,
ADD CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_pkey",
DROP COLUMN "targetPath",
ADD COLUMN     "boatId" UUID,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lessonId" UUID,
ADD COLUMN     "masterId" UUID,
ADD COLUMN     "patternId" UUID,
ADD COLUMN     "processId" UUID,
ADD COLUMN     "stepId" UUID,
ADD COLUMN     "targetKind" "QRTargetKind" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "quizId",
ADD COLUMN     "quizId" UUID NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" UUID NOT NULL,
ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_pkey",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "quizId",
ADD COLUMN     "quizId" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StepMaterial" DROP CONSTRAINT "StepMaterial_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "quantityNote" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "stepId",
ADD COLUMN     "stepId" UUID NOT NULL,
DROP COLUMN "materialId",
ADD COLUMN     "materialId" UUID NOT NULL,
ADD CONSTRAINT "StepMaterial_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StepTechnique" DROP CONSTRAINT "StepTechnique_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "stepId",
ADD COLUMN     "stepId" UUID NOT NULL,
DROP COLUMN "techniqueId",
ADD COLUMN     "techniqueId" UUID NOT NULL,
ADD CONSTRAINT "StepTechnique_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StepTool" DROP CONSTRAINT "StepTool_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usageNote" TEXT,
DROP COLUMN "stepId",
ADD COLUMN     "stepId" UUID NOT NULL,
DROP COLUMN "toolId",
ADD COLUMN     "toolId" UUID NOT NULL,
ADD CONSTRAINT "StepTool_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StudentWork" DROP CONSTRAINT "StudentWork_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "patternId",
ADD COLUMN     "patternId" UUID,
ADD CONSTRAINT "StudentWork_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StudentWorkMedia" DROP CONSTRAINT "StudentWorkMedia_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "workId",
ADD COLUMN     "workId" UUID NOT NULL,
ADD CONSTRAINT "StudentWorkMedia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Technique" DROP CONSTRAINT "Technique_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(160) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Technique_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Temple" DROP CONSTRAINT "Temple_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(160),
ADD CONSTRAINT "Temple_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(160) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Tool_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WorkFeedback" DROP CONSTRAINT "WorkFeedback_pkey",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "workId",
ADD COLUMN     "workId" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ADD CONSTRAINT "WorkFeedback_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_MasterToProcessStep";

-- DropTable
DROP TABLE "_PatternToProcessStep";

-- CreateTable
CREATE TABLE "PatternStep" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patternId" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterStep" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "masterId" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "contribution" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepMedia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stepId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "role" "StepMediaRole" NOT NULL,
    "position" INTEGER NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StepMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatternStep_stepId_idx" ON "PatternStep"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "PatternStep_patternId_stepId_key" ON "PatternStep"("patternId", "stepId");

-- CreateIndex
CREATE INDEX "MasterStep_stepId_idx" ON "MasterStep"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterStep_masterId_stepId_key" ON "MasterStep"("masterId", "stepId");

-- CreateIndex
CREATE INDEX "StepMedia_mediaId_idx" ON "StepMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "StepMedia_stepId_position_key" ON "StepMedia"("stepId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StepMedia_stepId_mediaId_role_key" ON "StepMedia"("stepId", "mediaId", "role");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_assessmentId_idx" ON "AssessmentQuestion"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_questionId_idx" ON "AssessmentResponse"("questionId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_userId_idx" ON "AssessmentResponse"("userId");

-- CreateIndex
CREATE INDEX "Boat_year_templeId_idx" ON "Boat"("year", "templeId");

-- CreateIndex
CREATE INDEX "Boat_templeId_year_idx" ON "Boat"("templeId", "year");

-- CreateIndex
CREATE INDEX "Boat_coverMediaId_idx" ON "Boat"("coverMediaId");

-- CreateIndex
CREATE INDEX "BoatPattern_patternId_idx" ON "BoatPattern"("patternId");

-- CreateIndex
CREATE UNIQUE INDEX "BoatPattern_boatId_patternId_key" ON "BoatPattern"("boatId", "patternId");

-- CreateIndex
CREATE INDEX "BoatSection_closeupMediaId_idx" ON "BoatSection"("closeupMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "BoatSection_boatId_slug_key" ON "BoatSection"("boatId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "BoatSection_boatId_position_key" ON "BoatSection"("boatId", "position");

-- CreateIndex
CREATE INDEX "BoatSectionPattern_patternId_idx" ON "BoatSectionPattern"("patternId");

-- CreateIndex
CREATE UNIQUE INDEX "BoatSectionPattern_sectionId_patternId_key" ON "BoatSectionPattern"("sectionId", "patternId");

-- CreateIndex
CREATE UNIQUE INDEX "BoatStory_boatId_position_key" ON "BoatStory"("boatId", "position");

-- CreateIndex
CREATE INDEX "Choice_questionId_idx" ON "Choice"("questionId");

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
CREATE INDEX "ContentVerification_status_updatedAt_idx" ON "ContentVerification"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ContentVerification_verifiedById_idx" ON "ContentVerification"("verifiedById");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "KnowledgeSource_kind_interviewDate_idx" ON "KnowledgeSource"("kind", "interviewDate");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_boatId_idx" ON "KnowledgeSourceLink"("boatId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_storyId_idx" ON "KnowledgeSourceLink"("storyId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_sectionId_idx" ON "KnowledgeSourceLink"("sectionId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_patternId_idx" ON "KnowledgeSourceLink"("patternId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_masterId_idx" ON "KnowledgeSourceLink"("masterId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_processId_idx" ON "KnowledgeSourceLink"("processId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_stepId_idx" ON "KnowledgeSourceLink"("stepId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_lessonId_idx" ON "KnowledgeSourceLink"("lessonId");

-- CreateIndex
CREATE INDEX "KnowledgeSourceLink_workId_idx" ON "KnowledgeSourceLink"("workId");

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
CREATE UNIQUE INDEX "Lesson_courseId_slug_key" ON "Lesson"("courseId", "slug");

-- CreateIndex
CREATE INDEX "LessonContent_lessonId_idx" ON "LessonContent"("lessonId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "Master_name_idx" ON "Master"("name");

-- CreateIndex
CREATE INDEX "Master_portraitMediaId_idx" ON "Master"("portraitMediaId");

-- CreateIndex
CREATE INDEX "Master_interviewMediaId_idx" ON "Master"("interviewMediaId");

-- CreateIndex
CREATE INDEX "MasterBoat_boatId_idx" ON "MasterBoat"("boatId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterBoat_masterId_boatId_key" ON "MasterBoat"("masterId", "boatId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterExpertise_masterId_title_key" ON "MasterExpertise"("masterId", "title");

-- CreateIndex
CREATE INDEX "MasterPattern_patternId_idx" ON "MasterPattern"("patternId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterPattern_masterId_patternId_key" ON "MasterPattern"("masterId", "patternId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_slug_key" ON "Material"("slug");

-- CreateIndex
CREATE INDEX "Material_name_idx" ON "Material"("name");

-- CreateIndex
CREATE INDEX "Media_kind_createdAt_idx" ON "Media"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "Media_consentId_idx" ON "Media"("consentId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_provider_storageKey_key" ON "Media"("provider", "storageKey");

-- CreateIndex
CREATE INDEX "Pattern_category_name_idx" ON "Pattern"("category", "name");

-- CreateIndex
CREATE INDEX "Pattern_imageMediaId_idx" ON "Pattern"("imageMediaId");

-- CreateIndex
CREATE INDEX "ProcessStep_coverMediaId_idx" ON "ProcessStep"("coverMediaId");

-- CreateIndex
CREATE INDEX "ProcessStep_videoMediaId_idx" ON "ProcessStep"("videoMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_processId_position_key" ON "ProcessStep"("processId", "position");

-- CreateIndex
CREATE INDEX "QRCode_active_targetKind_idx" ON "QRCode"("active", "targetKind");

-- CreateIndex
CREATE INDEX "QRCode_boatId_idx" ON "QRCode"("boatId");

-- CreateIndex
CREATE INDEX "QRCode_patternId_idx" ON "QRCode"("patternId");

-- CreateIndex
CREATE INDEX "QRCode_masterId_idx" ON "QRCode"("masterId");

-- CreateIndex
CREATE INDEX "QRCode_processId_idx" ON "QRCode"("processId");

-- CreateIndex
CREATE INDEX "QRCode_stepId_idx" ON "QRCode"("stepId");

-- CreateIndex
CREATE INDEX "QRCode_lessonId_idx" ON "QRCode"("lessonId");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Quiz_lessonId_idx" ON "Quiz"("lessonId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "StepMaterial_materialId_idx" ON "StepMaterial"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "StepMaterial_stepId_materialId_key" ON "StepMaterial"("stepId", "materialId");

-- CreateIndex
CREATE INDEX "StepTechnique_techniqueId_idx" ON "StepTechnique"("techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "StepTechnique_stepId_techniqueId_key" ON "StepTechnique"("stepId", "techniqueId");

-- CreateIndex
CREATE INDEX "StepTool_toolId_idx" ON "StepTool"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "StepTool_stepId_toolId_key" ON "StepTool"("stepId", "toolId");

-- CreateIndex
CREATE INDEX "StudentWork_userId_idx" ON "StudentWork"("userId");

-- CreateIndex
CREATE INDEX "StudentWork_patternId_idx" ON "StudentWork"("patternId");

-- CreateIndex
CREATE INDEX "StudentWorkMedia_workId_idx" ON "StudentWorkMedia"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "Technique_slug_key" ON "Technique"("slug");

-- CreateIndex
CREATE INDEX "Technique_name_idx" ON "Technique"("name");

-- CreateIndex
CREATE INDEX "Temple_name_idx" ON "Temple"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "Tool_name_idx" ON "Tool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "WorkFeedback_workId_idx" ON "WorkFeedback"("workId");

-- CreateIndex
CREATE INDEX "WorkFeedback_userId_idx" ON "WorkFeedback"("userId");

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatStory" ADD CONSTRAINT "BoatStory_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatSection" ADD CONSTRAINT "BoatSection_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatSection" ADD CONSTRAINT "BoatSection_closeupMediaId_fkey" FOREIGN KEY ("closeupMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_portraitMediaId_fkey" FOREIGN KEY ("portraitMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_interviewMediaId_fkey" FOREIGN KEY ("interviewMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterExpertise" ADD CONSTRAINT "MasterExpertise_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "KnowledgeProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_videoMediaId_fkey" FOREIGN KEY ("videoMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "StepMaterial" ADD CONSTRAINT "StepMaterial_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepMaterial" ADD CONSTRAINT "StepMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTool" ADD CONSTRAINT "StepTool_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTool" ADD CONSTRAINT "StepTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTechnique" ADD CONSTRAINT "StepTechnique_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepTechnique" ADD CONSTRAINT "StepTechnique_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternStep" ADD CONSTRAINT "PatternStep_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternStep" ADD CONSTRAINT "PatternStep_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterStep" ADD CONSTRAINT "MasterStep_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterStep" ADD CONSTRAINT "MasterStep_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "Consent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepMedia" ADD CONSTRAINT "StepMedia_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepMedia" ADD CONSTRAINT "StepMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "KnowledgeSourceLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_processId_fkey" FOREIGN KEY ("processId") REFERENCES "KnowledgeProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "StudentWork" ADD CONSTRAINT "StudentWork_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- Cross-field invariants that Prisma cannot express in schema.prisma.
ALTER TABLE "QRCode" ADD CONSTRAINT "qr_exactly_one_target"
CHECK (num_nonnulls("boatId", "patternId", "masterId", "processId", "stepId", "lessonId") = 1);
ALTER TABLE "QRCode" ADD CONSTRAINT "qr_kind_matches_target"
CHECK (("targetKind" = 'BOAT' AND "boatId" IS NOT NULL) OR
       ("targetKind" = 'PATTERN' AND "patternId" IS NOT NULL) OR
       ("targetKind" = 'MASTER' AND "masterId" IS NOT NULL) OR
       ("targetKind" = 'PROCESS' AND "processId" IS NOT NULL) OR
       ("targetKind" = 'STEP' AND "stepId" IS NOT NULL) OR
       ("targetKind" = 'LESSON' AND "lessonId" IS NOT NULL));

ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "source_exactly_one_target"
CHECK (num_nonnulls("boatId", "storyId", "sectionId", "patternId", "masterId", "processId", "stepId", "lessonId", "workId") = 1);

ALTER TABLE "ContentVerification" ADD CONSTRAINT "verification_exactly_one_target"
CHECK (num_nonnulls("boatId", "storyId", "sectionId", "patternId", "masterId", "processId", "stepId", "lessonId", "workId") = 1);
ALTER TABLE "ContentVerification" ADD CONSTRAINT "verified_requires_attribution"
CHECK (("status" = 'VERIFIED' AND "verifiedById" IS NOT NULL AND "verifiedAt" IS NOT NULL) OR
       ("status" <> 'VERIFIED' AND "verifiedById" IS NULL AND "verifiedAt" IS NULL));
