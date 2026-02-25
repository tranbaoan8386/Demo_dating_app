import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: String,
    bio: String,
    email: { type: String, unique: true },

    availability: [
      {
        date: String,
        from: String,
        to: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);