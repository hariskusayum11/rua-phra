-- These PostgreSQL invariants are not expressible in Prisma's schema language.
ALTER TABLE "KnowledgeSourceLink" ADD CONSTRAINT "source_exactly_one_target"
CHECK (num_nonnulls("boatId", "storyId", "sectionId", "patternId", "masterId", "processId", "stepId", "lessonId", "workId") = 1);

ALTER TABLE "ContentVerification" ADD CONSTRAINT "verification_exactly_one_target"
CHECK (num_nonnulls("boatId", "storyId", "sectionId", "patternId", "masterId", "processId", "stepId", "lessonId", "workId") = 1);

ALTER TABLE "ContentVerification" ADD CONSTRAINT "verified_requires_attribution"
CHECK (("status" = 'VERIFIED' AND "verifiedById" IS NOT NULL AND "verifiedAt" IS NOT NULL)
OR ("status" <> 'VERIFIED' AND "verifiedById" IS NULL AND "verifiedAt" IS NULL));

ALTER TABLE "BoatSection" ADD CONSTRAINT "hotspot_percentage_bounds"
CHECK ("x" BETWEEN 0 AND 100 AND "y" BETWEEN 0 AND 100);

ALTER TABLE "QRCode" ADD CONSTRAINT "nonnegative_scan_count" CHECK ("scanCount" >= 0);
ALTER TABLE "QRCode" ADD CONSTRAINT "local_qr_target"
CHECK ("targetPath" ~ '^/(boats|patterns|masters|craft|learn)/[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)?$' OR "targetPath" = '/craft');

ALTER TABLE "Media" ADD CONSTRAINT "positive_media_dimensions"
CHECK (("width" IS NULL AND "height" IS NULL) OR ("width" IS NOT NULL AND "height" IS NOT NULL AND "width" > 0 AND "height" > 0));

ALTER TABLE "Consent" ADD CONSTRAINT "consent_date_order"
CHECK ("revokedAt" IS NULL OR ("grantedAt" IS NOT NULL AND "revokedAt" >= "grantedAt"));
