import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { getLocalDevUser, saveLocalDevUser } from "@/lib/database/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const email = validatedData.email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      console.warn("Database connection notice on user lookup; checking local dev store:", dbErr);
      existingUser = getLocalDevUser(email);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    let newUser = null;
    try {
      newUser = await prisma.user.create({
        data: {
          name: validatedData.name.trim(),
          email,
          passwordHash,
          country: validatedData.country,
          phoneCountryCode: validatedData.phoneCountryCode,
          phone: validatedData.phone,
          role: "CUSTOMER",
          emailVerified: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          country: true,
        },
      });
    } catch (createErr) {
      console.warn("Database offline during user registration; saving to development store:", createErr);
      const devId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const devUser = {
        id: devId,
        name: validatedData.name.trim(),
        email,
        passwordHash,
        country: validatedData.country,
        phoneCountryCode: validatedData.phoneCountryCode,
        phone: validatedData.phone,
        role: "CUSTOMER" as const,
        createdAt: new Date(),
      };
      saveLocalDevUser(devUser);

      newUser = {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        role: devUser.role,
        country: devUser.country,
      };
    }

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
