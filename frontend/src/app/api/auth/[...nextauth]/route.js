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
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // Enforce SSL for port 465
      },
      from: process.env.EMAIL_FROM,
      // Debug callback if email fails to send in production
      sendVerificationRequest: async (params) => {
        const { identifier, url, provider, theme } = params;
        const { host } = new URL(url);

        try {
          // Dynamic import of nodemailer to avoid bundling issues
          const nodemailer = await import("nodemailer");

          const transport = nodemailer.createTransport(provider.server);
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n\n`,
            html: `
              <body style="background: #0a0a0a; color: #fff; font-family: sans-serif; padding: 20px;">
                <h1 style="color: #D4AF37;">Welcome to Elevate</h1>
                <p>Click the secure link below to sign in:</p>
                <a href="${url}" style="background: #D4AF37; color: #0a0a0a; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Sign In</a>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">If you did not request this email you can safely ignore it.</p>
              </body>
            `,
          });

          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
          }
        } catch (error) {
          console.error("SEND_VERIFICATION_EMAIL_ERROR", error);
          throw new Error("Failed to send verification email. Please try again or use Google sign in.");
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // Explicitly define custom sign in page
    error: '/login',  // Redirect auth errors back to login to display to user
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