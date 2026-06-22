import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[authorize] credentials received:", credentials);

        if (!credentials?.username || !credentials?.password) {
          console.log("[authorize] missing username or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        console.log("[authorize] user found:", user ? user.username : "NOT FOUND");

        if (!user || !user.password) return null;

        const isValid = credentials.password === user.password;

        console.log("[authorize] password valid:", isValid);

        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.fullname || user.username,
          email: user.email,
          role: user.role, // Add role here
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
