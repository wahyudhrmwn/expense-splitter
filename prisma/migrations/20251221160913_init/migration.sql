-- CreateTable
CREATE TABLE "expense_groups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expenseGroupId" TEXT NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidBy" TEXT NOT NULL,
    "includeTax" BOOLEAN NOT NULL DEFAULT false,
    "taxPercentage" DOUBLE PRECISION NOT NULL DEFAULT 11.0,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "expenseGroupId" TEXT NOT NULL,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_item_people" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "expenseItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "expense_item_people_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "expense_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "expense_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_item_people" ADD CONSTRAINT "expense_item_people_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_item_people" ADD CONSTRAINT "expense_item_people_expenseItemId_fkey" FOREIGN KEY ("expenseItemId") REFERENCES "expense_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
