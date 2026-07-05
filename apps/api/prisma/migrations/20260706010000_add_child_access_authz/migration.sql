-- P1 multi-tenancy/authz baseline.
-- Existing children are attached to a deterministic system/demo owner.

INSERT INTO "users" ("id", "email", "role", "createdAt")
VALUES ('user-demo-parent', 'demo-parent@qoldau.local', 'parent', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

ALTER TABLE "children" ADD COLUMN "ownerUserId" TEXT;

UPDATE "children"
SET "ownerUserId" = (
    SELECT "id"
    FROM "users"
    WHERE "email" = 'demo-parent@qoldau.local'
    LIMIT 1
)
WHERE "ownerUserId" IS NULL;

ALTER TABLE "children" ALTER COLUMN "ownerUserId" SET NOT NULL;

CREATE TABLE "child_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "child_access_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "child_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "child_access_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "child_access_userId_childId_key" ON "child_access"("userId", "childId");
CREATE INDEX "children_ownerUserId_idx" ON "children"("ownerUserId");
CREATE INDEX "child_access_userId_idx" ON "child_access"("userId");
CREATE INDEX "child_access_childId_idx" ON "child_access"("childId");

ALTER TABLE "children"
ADD CONSTRAINT "children_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
