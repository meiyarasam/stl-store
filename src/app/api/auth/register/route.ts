import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { getLocalDevUser, saveLocalDevUser, StoredUser } from "@/lib/database/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const email = validatedData.email.toLowerCase().trim();
    const dbOnline = await isDatabaseReachable();

    // Check if user already exists
    let existingUser = null;
    if (dbOnline) {
      try {
        existingUser = await prisma.user.findUnique({
          where: { email },
        });
      } catch (dbErr) {
        console.warn("Database lookup warning:", dbErr);
      }
    }

    if (!existingUser) {
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
    if (dbOnline) {
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
        console.warn("Prisma user creation error, falling back to local file store:", createErr);
      }
    }

    if (!newUser) {
      const devId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const devUser: StoredUser = {
        id: devId,
        name: validatedData.name.trim(),
        email,
        passwordHash,
        country: validatedData.country,
        phoneCountryCode: validatedData.phoneCountryCode,
        phone: validatedData.phone,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
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
