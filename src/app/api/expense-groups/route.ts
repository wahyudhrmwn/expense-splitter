import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/expense-groups - Get all expense groups for current user
export async function GET() {
  try {
    // Get current user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get only groups belonging to current user
    const groups = await prisma.expenseGroup.findMany({
      where: {
        userId: user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match store interface
    const transformedGroups = groups.map((group) => ({
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
    }));

    return NextResponse.json(transformedGroups);
  } catch (error) {
    console.error("Error fetching expense groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense groups" },
      { status: 500 }
    );
  }
}

// POST /api/expense-groups - Create new expense group
export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, people } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create group with people if provided, linked to current user
    const group = await prisma.expenseGroup.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: user.id,
        people: people && people.length > 0
          ? {
              create: people.map((p: { name: string; email?: string | null }) => ({
                name: p.name.trim(),
                email: p.email && p.email.trim() ? p.email.trim() : null,
              })),
            }
          : undefined,
      },
      include: {
        people: true,
        expenses: true,
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
      expenses: [],
    };

    return NextResponse.json(transformedGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating expense group:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create expense group";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

