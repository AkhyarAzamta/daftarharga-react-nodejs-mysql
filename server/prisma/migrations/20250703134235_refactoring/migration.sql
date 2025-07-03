-- AlterTable
ALTER TABLE `Product` ADD COLUMN `provider` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Product_category_idx` ON `Product`(`category`);

-- CreateIndex
CREATE INDEX `Product_provider_idx` ON `Product`(`provider`);
