import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      user: {
        name: user.name || email.split("@")[0],
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
