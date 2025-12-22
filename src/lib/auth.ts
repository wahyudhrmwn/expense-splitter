import { getServerSession } from "next-auth";
import { authOptions } from "./auth-config";
import { prisma } from "./prisma";

// Helper untuk mendapatkan user dari session
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

