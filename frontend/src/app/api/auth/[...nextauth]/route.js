import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // 24 hours - aligns with QStash retry window
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!process.env.QSTASH_TOKEN) {
          console.warn("Missing QSTASH_TOKEN - Webhook queue bypassed.");
          return;
        }

        const { Client } = await import("@upstash/qstash");
        const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

        // Ensure we route to production Vercel URL if available, else localhost
        const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await qstashClient.publishJSON({
          url: `${baseUrl}/api/webhooks/email`,
          body: {
            email: identifier,
            url: url,
          },
          retries: 3,
          headers: {
            "Upstash-Delay": "2s",
          }
        });
      }
    }),
  ],
  session: {
    strategy: "jwt",
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };