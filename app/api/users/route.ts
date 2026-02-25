import { NextResponse } from "next/server";
import { createUser, getUsers } from "@/controllers/userController";
import { createUserSchema } from "@/validations/user.schema";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get("currentUserId");

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Missing currentUserId" },
        { status: 400 }
      );
    }

    const users = await getUsers(currentUserId);

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await createUser(parsed.data);

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}