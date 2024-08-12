-- CreateIndex
CREATE INDEX "CustomAction_shopId_idx" ON "CustomAction"("shopId");

-- CreateIndex
CREATE INDEX "CustomActionValue_locationId_idx" ON "CustomActionValue"("locationId");

-- CreateIndex
CREATE INDEX "CustomField_shopId_idx" ON "CustomField"("shopId");

-- CreateIndex
CREATE INDEX "CustomFieldValue_locationId_idx" ON "CustomFieldValue"("locationId");

-- CreateIndex
CREATE INDEX "Language_shopId_idx" ON "Language"("shopId");

-- CreateIndex
CREATE INDEX "Location_shopId_idx" ON "Location"("shopId");

-- CreateIndex
CREATE INDEX "SearchFilter_shopId_idx" ON "SearchFilter"("shopId");

-- CreateIndex
CREATE INDEX "Translation_languageId_idx" ON "Translation"("languageId");
