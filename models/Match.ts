import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },

    dateConfirmed: {
      date: Date,
      from: String,
      to: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Match ||
  mongoose.model("Match", MatchSchema);