import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Match from "@/models/Match";
import mongoose from "mongoose";

export const createUser = async (data: any) => {
  await connectDB();
  const user = await User.create(data);
  return user;
};

export const getUsers = async (currentUserId: string) => {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(currentUserId);

  // Lấy match của user hiện tại
  const matches = await Match.find({
    users: userObjectId,
  });

  // Lấy id người đã match
  const matchedUserIds = matches.flatMap((match) =>
    match.users.filter(
      (id: mongoose.Types.ObjectId) =>
        id.toString() !== currentUserId
    )
  );

  // Query user và loại trừ
  const users = await User.find({
    _id: {
      $nin: [userObjectId, ...matchedUserIds],
    },
  }).lean();

  return users;
};