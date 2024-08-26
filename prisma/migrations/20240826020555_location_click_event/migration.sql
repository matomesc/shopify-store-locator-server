-- CreateTable
CREATE TABLE "LocationClickEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationClickEvent_sessionId_idx" ON "LocationClickEvent"("sessionId");

-- CreateIndex
CREATE INDEX "LocationClickEvent_locationId_idx" ON "LocationClickEvent"("locationId");

-- AddForeignKey
ALTER TABLE "LocationClickEvent" ADD CONSTRAINT "LocationClickEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationClickEvent" ADD CONSTRAINT "LocationClickEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
