import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users);
}