ALTER TABLE "children" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "children" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "events" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "events" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "recordings" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "recordings" ADD COLUMN "deletedAt" TIMESTAMP(3);

UPDATE "children" SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP);
UPDATE "events" SET "updatedAt" = COALESCE("timestamp", CURRENT_TIMESTAMP);
UPDATE "recordings" SET "updatedAt" = COALESCE("timestamp", CURRENT_TIMESTAMP);

CREATE INDEX "children_ownerUserId_updatedAt_idx" ON "children"("ownerUserId", "updatedAt");
CREATE INDEX "events_childId_updatedAt_idx" ON "events"("childId", "updatedAt");
CREATE INDEX "recordings_childId_updatedAt_idx" ON "recordings"("childId", "updatedAt");

CREATE TABLE "refresh_tokens" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token"),
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

CREATE TABLE "child_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "child_invites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "child_invites_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "child_invites_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "child_invites_token_key" ON "child_invites"("token");
CREATE INDEX "child_invites_email_idx" ON "child_invites"("email");
CREATE INDEX "child_invites_childId_idx" ON "child_invites"("childId");
