-- Align Better Auth account issuers with IDENTITY_URL (https://identity.hackclub.com).
UPDATE "Account"
SET "issuer" = 'https://identity.hackclub.com'
WHERE "issuer" IS NULL
   OR "issuer" = ''
   OR "issuer" = 'https://auth.hackclub.com';

ALTER TABLE "Account" ALTER COLUMN "issuer" SET DEFAULT 'https://identity.hackclub.com';
