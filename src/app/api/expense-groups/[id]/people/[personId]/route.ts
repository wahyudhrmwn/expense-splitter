import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/expense-groups/[id]/people/[personId] - Update person
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; personId: string }> }
) {
  try {
    // Unwrap params (Next.js 16+ requires await)
    const { id, personId } = await params;
    
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

    // Check if person exists and belongs to this group
    const personExists = await prisma.person.findFirst({
      where: {
        id: personId,
        expenseGroupId: id,
      },
    });

    if (!personExists) {
      return NextResponse.json(
        { error: "Person not found in this group" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim() || null }),
      },
    });

    // Transform to match store interface
    const transformedPerson = {
      id: person.id,
      name: person.name,
      email: person.email,
    };

    return NextResponse.json(transformedPerson);
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json(
      { error: "Failed to update person" },
      { status: 500 }
    );
  }
}

// DELETE /api/expense-groups/[id]/people/[personId] - Delete person
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; personId: string }> }
) {
  try {
    // Unwrap params (Next.js 16+ requires await)
    const { id, personId } = await params;
    
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

    // Check if person exists and belongs to this group
    const personExists = await prisma.person.findFirst({
      where: {
        id: personId,
        expenseGroupId: id,
      },
    });

    if (!personExists) {
      return NextResponse.json(
        { error: "Person not found in this group" },
        { status: 404 }
      );
    }

    await prisma.person.delete({
      where: { id: personId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Failed to delete person" },
      { status: 500 }
    );
  }
}

