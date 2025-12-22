import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/expense-groups/[id]/expenses/[expenseId] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    // Unwrap params (Next.js 16+ requires await)
    const { id, expenseId } = await params;
    
    // Get current user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if group exists and belongs to user
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Expense group not found" },
        { status: 404 }
      );
    }

    // Check if expense exists and belongs to this group
    const expenseExists = await prisma.expenseItem.findFirst({
      where: {
        id: expenseId,
        expenseGroupId: id,
      },
    });

    if (!expenseExists) {
      return NextResponse.json(
        { error: "Expense not found in this group" },
        { status: 404 }
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

    // Delete existing items
    await prisma.expenseItemPerson.deleteMany({
      where: { expenseItemId: expenseId },
    });

    // Update expense
    const expense = await prisma.expenseItem.update({
      where: { id: expenseId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(paidBy !== undefined && { paidBy }),
        ...(includeTax !== undefined && { includeTax }),
        ...(taxPercentage !== undefined && { taxPercentage }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(items !== undefined && {
          items: {
            create: items.map((item: { personId: string; itemName: string; amount: number }) => ({
              personId: item.personId,
              itemName: item.itemName.trim(),
              amount: item.amount,
            })),
          },
        }),
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

    return NextResponse.json(transformedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/expense-groups/[id]/expenses/[expenseId] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    // Unwrap params (Next.js 16+ requires await)
    const { id, expenseId } = await params;
    
    // Get current user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if group exists and belongs to user
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Expense group not found" },
        { status: 404 }
      );
    }

    // Check if expense exists and belongs to this group
    const expenseExists = await prisma.expenseItem.findFirst({
      where: {
        id: expenseId,
        expenseGroupId: id,
      },
    });

    if (!expenseExists) {
      return NextResponse.json(
        { error: "Expense not found in this group" },
        { status: 404 }
      );
    }

    await prisma.expenseItem.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

