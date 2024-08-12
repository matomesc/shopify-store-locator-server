-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "target" TEXT,
    "searchFilterId" TEXT,
    "customFieldId" TEXT,
    "customActionId" TEXT,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_shopId_code_key" ON "Language"("shopId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languageId_target_key" ON "Translation"("languageId", "target");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languageId_searchFilterId_key" ON "Translation"("languageId", "searchFilterId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languageId_customFieldId_key" ON "Translation"("languageId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languageId_customActionId_key" ON "Translation"("languageId", "customActionId");

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_searchFilterId_fkey" FOREIGN KEY ("searchFilterId") REFERENCES "SearchFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_customActionId_fkey" FOREIGN KEY ("customActionId") REFERENCES "CustomAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
