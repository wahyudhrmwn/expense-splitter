import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/expense-groups/[id] - Get expense group by id
export async function GET(
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

    const group = await prisma.expenseGroup.findFirst({
      where: {
        id: id,
        userId: user.id, // Only get group owned by current user
      },
      include: {
        people: true,
        expenses: {
          include: {
            items: {
              include: {
                person: true,
              },
            },
            paidByPerson: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Expense group not found" },
        { status: 404 }
      );
    }

    // Transform to match store interface
    const transformedGroup = {
      id: group.id,
      title: group.title,
      description: group.description || "",
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      people: group.people.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
      })),
      expenses: group.expenses.map((expense) => ({
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
      })),
    };

    return NextResponse.json(transformedGroup);
  } catch (error) {
    console.error("Error fetching expense group:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense group" },
      { status: 500 }
    );
  }
}

// PUT /api/expense-groups/[id] - Update expense group
export async function PUT(
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

    // Check if group exists and belongs to user
    const existingGroup = await prisma.expenseGroup.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Expense group not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    const group = await prisma.expenseGroup.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
      },
      include: {
        people: true,
        expenses: {
          include: {
            items: {
              include: {
                person: true,
              },
            },
            paidByPerson: true,
          },
        },
      },
    });

    // Transform to match store interface
    const transformedGroup = {
      id: group.id,
      title: group.title,
      description: group.description || "",
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      people: group.people.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
      })),
      expenses: group.expenses.map((expense) => ({
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
      })),
    };

    return NextResponse.json(transformedGroup);
  } catch (error) {
    console.error("Error updating expense group:", error);
    return NextResponse.json(
      { error: "Failed to update expense group" },
      { status: 500 }
    );
  }
}

// DELETE /api/expense-groups/[id] - Delete expense group
export async function DELETE(
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

    // Check if the group exists and belongs to user
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

    // Delete the group - cascade should handle related records
    // But if cascade doesn't work, we'll delete manually
    await prisma.$transaction(async (tx) => {
      // Delete expense item people (deepest level first)
      const expenses = await tx.expenseItem.findMany({
        where: { expenseGroupId: id },
        select: { id: true },
      });

      if (expenses.length > 0) {
        await tx.expenseItemPerson.deleteMany({
          where: {
            expenseItemId: {
              in: expenses.map((e) => e.id),
            },
          },
        });
      }

      // Delete expenses
      await tx.expenseItem.deleteMany({
        where: { expenseGroupId: id },
      });

      // Delete people
      await tx.person.deleteMany({
        where: { expenseGroupId: id },
      });

      // Finally delete the group
      await tx.expenseGroup.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting expense group:", error);
    
    // Return more detailed error message
    const errorMessage = 
      error?.message || 
      error?.meta?.cause || 
      "Failed to delete expense group";
    
    const statusCode = 
      error?.code === "P2025" || error?.message?.includes("not found") 
        ? 404 
        : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          details: {
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack,
          },
        }),
      },
      { status: statusCode }
    );
  }
}

