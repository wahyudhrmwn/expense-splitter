import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google" && user.email) {
        try {
          // Cek apakah user sudah ada di database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Jika belum ada, buat user baru
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image || null,
              },
            });
          } else {
            // Update user jika ada perubahan (nama atau gambar)
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              },
            });
          }
        } catch (error) {
          console.error("Error saving user to database:", error);
          // Tetap izinkan login meskipun ada error
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      // Simpan user info ke token
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Kirim user info ke session
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Redirect ke halaman utama setelah login
      if (url === baseUrl || url.startsWith(baseUrl + "/")) {
        return baseUrl;
      }
      return baseUrl;
    },
  },
};
