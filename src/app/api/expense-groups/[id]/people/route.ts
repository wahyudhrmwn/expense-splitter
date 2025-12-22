import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/expense-groups/[id]/people - Add person to expense group
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
    const { name, email } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Email is optional, use empty string if not provided
    const emailValue = email && email.trim() ? email.trim() : null;

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

    // Create person
    try {
      const person = await prisma.person.create({
        data: {
          name: name.trim(),
          email: emailValue,
          expenseGroupId: id,
        },
      });

      // Transform to match store interface
      const transformedPerson = {
        id: person.id,
        name: person.name,
        email: person.email,
      };

      return NextResponse.json(transformedPerson, { status: 201 });
    } catch (dbError: any) {
      console.error("Database error adding person:", dbError);
      
      // Handle unique constraint or foreign key errors
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: "Person with this name already exists in this group" },
          { status: 400 }
        );
      }
      
      if (dbError.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid expense group" },
          { status: 400 }
        );
      }
      
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error adding person to expense group:", error);
    
    // Return more detailed error message
    const errorMessage = 
      error?.message || 
      error?.meta?.cause || 
      "Failed to add person to expense group";
    
    const statusCode = 
      error?.code === "P2025" || error?.message?.includes("not found") 
        ? 404 
        : error?.status || 500;
    
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
      { status: statusCode }
    );
  }
}

