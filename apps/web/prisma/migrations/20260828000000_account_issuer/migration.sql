-- Better Auth 1.7 keys accounts by (issuer, accountId).
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "issuer" TEXT NOT NULL DEFAULT 'https://auth.hackclub.com';

CREATE UNIQUE INDEX IF NOT EXISTS "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
