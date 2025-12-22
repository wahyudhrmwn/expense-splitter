import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/expense-groups/[id]/expenses - Add expense to expense group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params (Next.js 16+ requires await)
    const { id } = await params;
    
    // Get current user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      totalAmount,
      paidBy,
      items,
      includeTax,
      taxPercentage,
      category,
      date,
      description,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!paidBy) {
      return NextResponse.json(
        { error: "Paid by person ID is required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Validate items
    const validItems = items.filter(
      (item: { personId: string; itemName: string; amount: number }) =>
        item.personId &&
        item.personId.trim() !== "" &&
        item.itemName &&
        item.itemName.trim() !== "" &&
        item.amount > 0
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "All items must have a valid person, item name, and amount greater than 0" },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to user
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        people: true,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Expense group not found" },
        { status: 404 }
      );
    }

    // Check if paidBy person exists and belongs to this group
    const paidByPerson = group.people.find((p) => p.id === paidBy);

    if (!paidByPerson) {
      return NextResponse.json(
        { error: "Person who paid not found in this group" },
        { status: 400 }
      );
    }

    // Validate all personIds in items belong to this group
    const invalidPersonIds = validItems.filter(
      (item: { personId: string }) => !group.people.some((p) => p.id === item.personId)
    );

    if (invalidPersonIds.length > 0) {
      return NextResponse.json(
        { error: "Some items have invalid person IDs that don't belong to this group" },
        { status: 400 }
      );
    }

    // Create expense with items
    const expense = await prisma.expenseItem.create({
      data: {
        title: title.trim(),
        totalAmount: totalAmount,
        paidBy: paidBy,
        includeTax: includeTax || false,
        taxPercentage: taxPercentage || 0,
        category: category || "",
        date: date ? new Date(date) : new Date(),
        description: description?.trim() || null,
        expenseGroupId: id,
        items: {
          create: validItems.map((item: { personId: string; itemName: string; amount: number }) => ({
            personId: item.personId,
            itemName: item.itemName.trim(),
            amount: Number(item.amount),
          })),
        },
      },
      include: {
        items: {
          include: {
            person: true,
          },
        },
        paidByPerson: true,
      },
    });

    // Transform to match store interface
    const transformedExpense = {
      id: expense.id,
      title: expense.title,
      totalAmount: expense.totalAmount,
      paidBy: expense.paidBy,
      includeTax: expense.includeTax,
      taxPercentage: expense.taxPercentage,
      category: expense.category,
      date: expense.date,
      description: expense.description || "",
      items: expense.items.map((item) => ({
        personId: item.personId,
        itemName: item.itemName,
        amount: item.amount,
      })),
    };

    return NextResponse.json(transformedExpense, { status: 201 });
  } catch (error: any) {
    console.error("Error adding expense to expense group:", error);
    
    // Handle Prisma errors
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid person or group reference" },
        { status: 400 }
      );
    }
    
    const errorMessage = 
      error?.message || 
      error?.meta?.cause || 
      "Failed to add expense to expense group";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          details: {
            code: error?.code,
            meta: error?.meta,
          },
        }),
      },
      { status: error?.code ? 400 : 500 }
    );
  }
}

