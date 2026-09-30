-- A page target is the first QR destination that is not a record, so both target
-- constraints have to learn about it: PAGE carries a path and no foreign key, while
-- every other kind still carries exactly one foreign key and no path.
--
-- Separate from the migration that added the enum value, because Postgres refuses to use
-- a new enum value in the same transaction that created it.

ALTER TABLE "QRCode" DROP CONSTRAINT IF EXISTS "qr_exactly_one_target";
ALTER TABLE "QRCode" DROP CONSTRAINT IF EXISTS "qr_kind_matches_target";

ALTER TABLE "QRCode" ADD CONSTRAINT "qr_exactly_one_target"
CHECK (
  (num_nonnulls("boatId", "patternId", "masterId", "processId", "stepId", "lessonId") = 1 AND "path" IS NULL)
  OR
  (num_nonnulls("boatId", "patternId", "masterId", "processId", "stepId", "lessonId") = 0 AND "path" IS NOT NULL)
);

ALTER TABLE "QRCode" ADD CONSTRAINT "qr_kind_matches_target"
CHECK (("targetKind" = 'BOAT'    AND "boatId"    IS NOT NULL) OR
       ("targetKind" = 'PATTERN' AND "patternId" IS NOT NULL) OR
       ("targetKind" = 'MASTER'  AND "masterId"  IS NOT NULL) OR
       ("targetKind" = 'PROCESS' AND "processId" IS NOT NULL) OR
       ("targetKind" = 'STEP'    AND "stepId"    IS NOT NULL) OR
       ("targetKind" = 'LESSON'  AND "lessonId"  IS NOT NULL) OR
       ("targetKind" = 'PAGE'    AND "path"      IS NOT NULL));
