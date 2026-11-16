import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    // 1. Read request body
    const body = await req.json();

    // 2. Validate registration data
    const validatedData = registerSchema.parse(body);

    // 3. Normalize email
    const email = validatedData.email.toLowerCase().trim();

    // 4. Check database connection
    const dbOnline = await isDatabaseReachable();

    if (!dbOnline) {
      console.error("Database is not reachable.");

      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed. Please try again later.",
        },
        { status: 503 }
      );
    }

    // 5. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    // 6. Securely hash password
    const passwordHash = await bcrypt.hash(
      validatedData.password,
      12
    );

    // 7. Create user directly in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name.trim(),
        email: email,
        passwordHash: passwordHash,
        country: validatedData.country,
        phoneCountryCode: validatedData.phoneCountryCode,
        phone: validatedData.phone,
        role: "CUSTOMER",

        // Keep this only if your existing registration
        // process intentionally verifies email immediately.
        emailVerified: new Date(),
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        phoneCountryCode: true,
        phone: true,
        createdAt: true,
      },
    });

    // 8. Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully!",
        user: newUser,
      },
      { status: 201 }
    );

  } catch (error: any) {

    // 9. Handle validation errors
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: error.errors?.[0]?.message || "Invalid registration data.",
        },
        { status: 400 }
      );
    }

    // 10. Handle duplicate email
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // 11. Log database and server errors
    console.error("Registration API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}