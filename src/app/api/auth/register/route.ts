import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const email = validatedData.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name.trim(),
        email,
        passwordHash,
        country: validatedData.country,
        phoneCountryCode: validatedData.phoneCountryCode,
        phone: validatedData.phone,
        role: "CUSTOMER",
        emailVerified: new Date(), // verified on registration for instant seamless checkout
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
