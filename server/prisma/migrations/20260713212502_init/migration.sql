-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'MECHANIC', 'ADMIN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'DIAGNOSING', 'PARTS_ON_ORDER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vin" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairJob" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "mechanicId" TEXT,
    "description" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedCost" DECIMAL(10,2) NOT NULL,
    "actualCost" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPart" (
    "id" TEXT NOT NULL,
    "repairJobId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL DEFAULT 1,
    "unitPriceAtSale" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "JobPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_partName_key" ON "Inventory"("partName");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_sku_key" ON "Inventory"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "JobPart_repairJobId_partId_key" ON "JobPart"("repairJobId", "partId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairJob" ADD CONSTRAINT "RepairJob_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairJob" ADD CONSTRAINT "RepairJob_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPart" ADD CONSTRAINT "JobPart_repairJobId_fkey" FOREIGN KEY ("repairJobId") REFERENCES "RepairJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPart" ADD CONSTRAINT "JobPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
