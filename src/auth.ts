import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getDb } from "@/lib/db";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function matchesSecret(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        const expectedEmail = process.env.ADMIN_EMAIL;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!parsed.success || !expectedEmail || !expectedPassword) return null;
        if (!matchesSecret(parsed.data.email.toLowerCase(), expectedEmail.toLowerCase())) return null;
        if (!matchesSecret(parsed.data.password, expectedPassword)) return null;
        const user = await getDb().user.upsert({
          where: { email: expectedEmail.toLowerCase() },
          update: { role: "ADMIN" },
          create: { email: expectedEmail.toLowerCase(), name: "ผู้ดูแลระบบ", role: "ADMIN" },
        });
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
