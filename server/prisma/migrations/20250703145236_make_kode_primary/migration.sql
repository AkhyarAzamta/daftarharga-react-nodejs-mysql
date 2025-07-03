/*
  Warnings:

  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `products_kode_key` ON `products`;

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`kode`);
