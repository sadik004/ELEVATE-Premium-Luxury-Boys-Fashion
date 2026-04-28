import crypto from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getApiUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${baseUrl.replace(/\/+$/, "")}/api`;
}

function getBridgePassword(email) {
  const secret = process.env.BACKEND_AUTH_BRIDGE_SECRET || process.env.NEXTAUTH_SECRET;
  return crypto.createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 32);
}

async function backendPost(endpoint, body) {
  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const phone = session?.user?.phone;
  const identifier = email || phone;

  if (!identifier) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const password = getBridgePassword(identifier);
  const loginBody = { email: identifier, password };
  const { response: loginResponse, data: loginData } = await backendPost("/auth/login", loginBody);

  if (loginResponse.ok) {
    return NextResponse.json(loginData);
  }

  const registerBody = {
    email: identifier,
    password,
    name: session.user.name || null,
  };
  const { response: registerResponse, data: registerData } = await backendPost("/auth/register", registerBody);

  if (registerResponse.ok) {
    return NextResponse.json(registerData, { status: 201 });
  }

  return NextResponse.json(
    { error: registerData.detail || loginData.detail || "Unable to create backend session" },
    { status: registerResponse.status || 500 },
  );
}
