-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "trialDays" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Plan" ("id", "name", "price", "enabled", "trialDays")
VALUES
    ('free', 'Free', 0.00, true, 0),
    ('starter', 'Starter', 4.99, true, 7),
    ('pro', 'Pro', 9.99, true, 7),
    ('enterprise', 'Enterprise', 19.99, true, 7),
    ('unlimited', 'Unlimited', 39.99, true, 7)
    ;
