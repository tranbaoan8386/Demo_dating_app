import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Match from "@/models/Match";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const objectId = new mongoose.Types.ObjectId(userId);

  const matches = await Match.find({
    users: { $in: [objectId] },
  })
    .populate("users") 
    .lean();

  return NextResponse.json(matches);
}