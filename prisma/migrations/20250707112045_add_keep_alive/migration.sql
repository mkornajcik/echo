-- CreateTable
CREATE TABLE "KeepAlive" (
    "id" SERIAL NOT NULL,
    "lastPing" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeepAlive_pkey" PRIMARY KEY ("id")
);
