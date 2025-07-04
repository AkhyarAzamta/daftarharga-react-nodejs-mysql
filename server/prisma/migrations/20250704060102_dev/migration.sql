-- CreateTable
CREATE TABLE "products" (
    "kode" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("kode")
);
