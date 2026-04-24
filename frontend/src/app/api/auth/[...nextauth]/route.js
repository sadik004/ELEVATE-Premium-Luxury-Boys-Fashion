import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required");
        }

        // 1. Find OTP by email
        // Sort by creation date descending to get the most recent one
        const otpRecord = await prisma.oTP.findFirst({
          where: { email: credentials.email },
          orderBy: { createdAt: 'desc' }
        });

        // 2. Validate
        if (!otpRecord) {
          throw new Error("Invalid OTP");
        }

        if (otpRecord.otp !== credentials.otp) {
          throw new Error("Invalid OTP");
        }

        if (new Date() > otpRecord.expiresAt) {
          throw new Error("OTP has expired");
        }

        if (otpRecord.verified) {
          throw new Error("OTP has already been used");
        }

        // 3. Mark OTP as verified
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { verified: true }
        });

        // 4. Find or create user by email
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              emailVerified: new Date(),
            }
          });
        }

        // 5. Return user object
        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };