import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Like from "@/models/Like";
import Match from "@/models/Match";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { fromUserId, toUserId } = await req.json();

    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: "Cannot like yourself" },
        { status: 400 }
      );
    }

    const fromObjectId = new mongoose.Types.ObjectId(fromUserId);
    const toObjectId = new mongoose.Types.ObjectId(toUserId);

    // 1️⃣ Tránh tạo like trùng
    const alreadyLiked = await Like.findOne({
      from: fromObjectId,
      to: toObjectId,
    });

    if (!alreadyLiked) {
      await Like.create({
        from: fromObjectId,
        to: toObjectId,
      });
    }

    // 2️⃣ Kiểm tra mutual like
    const mutualLike = await Like.findOne({
      from: toObjectId,
      to: fromObjectId,
    });

    if (mutualLike) {
      // 3️⃣ Kiểm tra match đã tồn tại chưa
      let match = await Match.findOne({
        users: { $all: [fromObjectId, toObjectId] },
      });

      // Nếu chưa có thì tạo mới
      if (!match) {
        match = await Match.create({
          users: [fromObjectId, toObjectId],
        });
      }

      return NextResponse.json({
        message: "It's a match!",
        match: true,
        matchId: match._id,
      });
    }

    return NextResponse.json({
      message: "Liked successfully",
      match: false,
    });

  } catch (error) {
    console.error("LIKE ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}