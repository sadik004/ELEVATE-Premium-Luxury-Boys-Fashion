import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      id: "resend",
      type: "email",
      sendVerificationRequest: async ({ identifier, url }) => {
        try {
          // 🌐 Dynamic Routing: Route correctly based on preview vs production
          const targetDomain = process.env.VERCEL_ENV === 'production'
            ? process.env.NEXTAUTH_URL
            : `https://${process.env.VERCEL_BRANCH_URL}`;

          const webhookUrl = `${targetDomain}/api/webhooks/email`;

          // 🔁 Ingestion-Level Deduplication: sha256(identifier + time_window_10s)
          const timeWindow = Math.floor(Date.now() / 10000); // 10 second rolling window
          const dedupString = `${identifier}-${timeWindow}`;
          const dedupId = crypto.createHash('sha256').update(dedupString).digest('hex');

          // 🧠 Distributed Tracing: Generate a trace ID
          const traceId = crypto.randomUUID();

          console.log(`[Trace: ${traceId}] Queuing magic link for ${identifier}`);

          const response = await fetch(`https://qstash.upstash.io/v2/publish/${webhookUrl}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.QSTASH_TOKEN}`,
              "Content-Type": "application/json",
              "Upstash-Delay": "2s",
              "Upstash-Retries": "3",
              "Upstash-Retry-Delay": "5s",
              "Upstash-Deduplication-Id": dedupId,
              // 🚨 DLQ Handling: If retries exhaust, QStash will forward payload to this DLQ endpoint
              "Upstash-Failure-Callback": `${targetDomain}/api/webhooks/dlq`,
            },
            body: JSON.stringify({ identifier, url, traceId }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`[Trace: ${traceId}] QSTASH_PUBLISH_FAILED:`, response.status, errorData);
            throw new Error("Failed to queue verification email.");
          }
        } catch (error) {
          console.error("SEND_VERIFICATION_REQUEST_ERROR", error);
          throw new Error("Email delivery service unavailable.");
        }
      }
    }),
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