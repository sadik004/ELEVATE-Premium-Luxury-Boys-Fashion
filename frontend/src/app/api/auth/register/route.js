import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    if (!email || !password || !otp) {
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

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        password: hashedPassword,
        emailVerified: new Date(),
      }
    });

    // 5. Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    return NextResponse.json({ 
      message: "User registered successfully", 
      user: { id: user.id, email: user.email, name: user.name } 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
