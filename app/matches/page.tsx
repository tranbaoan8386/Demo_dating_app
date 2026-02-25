"use client";

import { useEffect, useState } from "react";
import { Heart, Calendar, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  email: string;
}

interface Match {
  _id: string;
  users: User[];
  status: "pending" | "confirmed";
  dateConfirmed?: {
    date: string;
    from: string;
    to: string;
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("currentUserId");

    if (id) {
      setCurrentUserId(id);
      fetchMatches(id);
    }
  }, []);

  // ✅ polling để khỏi cần login lại
  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      fetchMatches(currentUserId);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  const fetchMatches = async (id: string) => {
    try {
      const res = await fetch("/api/matches?userId=" + id, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error("Fetch matches error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Your Matches
        </h1>

        {matches.length === 0 && (
          <p className="text-center text-gray-500">No matches yet.</p>
        )}

        {matches.map((match) => {
          const otherUser = match.users.find(
            (user) => user._id.toString() !== currentUserId
          );

          if (!otherUser) return null;

          return (
            <div
              key={match._id}
              onClick={() => {
                if (match.status === "pending") {
                  router.push(`/match/${match._id}`);
                } else if (match.status === "confirmed") {
                  router.push(`/match/${match._id}`);
                }
              }}
              className={`relative bg-white p-6 rounded-2xl shadow-lg mb-6 transition
                ${
                  match.status === "pending"
                    ? "hover:shadow-xl cursor-pointer hover:scale-[1.02]"
                    : match.status === "confirmed"
                    ? "hover:shadow-xl cursor-pointer"
                    : ""
                }`}
            >
              {/* Pending Badge */}
              {match.status === "pending" && (
                <div className="absolute -top-3 -right-3 pointer-events-none">
                  <div
                    className="flex items-center gap-2 px-4 py-1 rounded-full
                    text-white text-sm font-semibold
                    bg-linear-to-r from-pink-500 to-purple-500
                    shadow-lg"
                  >
                    <Heart className="w-4 h-4 fill-white animate-pulse" />
                    <span>It’s a Match</span>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {otherUser.name}
              </h2>

              <p className="text-gray-600 mb-2">
                {otherUser.age} • {otherUser.gender}
              </p>

              <p className="text-gray-500">{otherUser.bio}</p>

              {/* Confirmed Date */}
              {match.status === "confirmed" && match.dateConfirmed && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Chúng ta có lịch hẹn</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(
                        match.dateConfirmed.date
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {match.dateConfirmed.from} -{" "}
                      {match.dateConfirmed.to}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}