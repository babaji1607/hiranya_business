import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/db"
import { admins } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "uowiqhwjeiougqbwefbiuqbwefoqweiufgbqwiefquwiobfiqubwefqofibweoibfiq",
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Missing username or password in credentials", credentials);
          return null;
        }
        
        try {
          console.log("Authorize attempt for:", credentials.username);
          const adminUser = await db.select().from(admins).where(eq(admins.username, credentials.username as string)).limit(1);
          
          if (adminUser.length > 0) {
            console.log("User found in DB. Comparing password...");
            const isValid = await bcrypt.compare(credentials.password as string, adminUser[0].passwordHash);
            console.log("Password valid?", isValid);
            if (isValid) {
              return { id: String(adminUser[0].id), name: adminUser[0].username, email: `${adminUser[0].username}@example.com` }
            }
          } else {
            console.log("User not found in DB.");
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
        
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
})
