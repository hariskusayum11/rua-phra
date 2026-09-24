ALTER TYPE "VerificationStatus" ADD VALUE 'PUBLISHED';

ALTER TABLE "ContentVerification" DROP CONSTRAINT "verified_requires_attribution";
ALTER TABLE "ContentVerification" ADD CONSTRAINT "verified_requires_attribution"
CHECK ((("status" = 'VERIFIED' OR "status" = 'PUBLISHED') AND "verifiedById" IS NOT NULL AND "verifiedAt" IS NOT NULL) OR
       (("status" <> 'VERIFIED' AND "status" <> 'PUBLISHED') AND "verifiedById" IS NULL AND "verifiedAt" IS NULL));
