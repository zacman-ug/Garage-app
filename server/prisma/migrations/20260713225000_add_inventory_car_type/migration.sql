ALTER TABLE "Inventory" ADD COLUMN "carType" TEXT NOT NULL DEFAULT 'Universal';
DROP INDEX IF EXISTS "Inventory_partName_key";
CREATE UNIQUE INDEX "Inventory_partName_carType_key" ON "Inventory"("partName", "carType");