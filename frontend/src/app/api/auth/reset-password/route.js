import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: { email: normalizedEmail, verified: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // 5. Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
