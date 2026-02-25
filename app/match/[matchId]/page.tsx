import { connectDB } from "@/lib/mongoose";
import Match from "@/models/Match";
import { Heart, Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{
    matchId: string;
  }>;
}

export default async function MatchPage({ params }: Props) {
  await connectDB();

  const { matchId } = await params;

  const match = await Match.findById(matchId).lean();

  if (!match) {
    return <div className="p-10">Không tìm thấy match.</div>;
  }

  // ✅ Nếu đã confirm lịch
  if (match.status === "confirmed" && match.dateConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-green-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center w-full max-w-md">
          
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Lịch hẹn đã được xác nhận
          </h1>

          <div className="space-y-3 text-gray-700">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(
                  match.dateConfirmed.date
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                {match.dateConfirmed.from} - {match.dateConfirmed.to}
              </span>
            </div>
          </div>
                    <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full shadow hover:scale-105 transition"
            >
              Về Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Nếu chưa confirm
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-purple-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center w-full max-w-md">

        <div className="flex justify-center mb-6">
          <div className="bg-linear-to-r from-pink-500 to-purple-500 p-4 rounded-full shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          It’s a Match
        </h1>

        <a
          href={`/match/${matchId}/availability`}
          className="inline-block bg-purple-500 text-white px-6 py-2 rounded-full shadow hover:scale-105 transition"
        >
          Chọn thời gian hẹn
        </a>
      </div>
    </div>
  );
}