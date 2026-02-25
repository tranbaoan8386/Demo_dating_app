"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface User {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  email: string;
}

export default function Dashboard() {
  const [listLoading, setListLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard đã được tải");

    const id = localStorage.getItem("currentUserId");
    console.log("ID lấy từ localStorage:", id);

    if (!id) {
      console.warn("Không tìm thấy currentUserId, chuyển về trang profiles");
      router.push("/profiles");
      return;
    }

    setCurrentUserId(id);

    Promise.all([fetchUsers(id), checkMatches(id)])
      .finally(() => {
        setPageLoading(false);
      });

  }, []);

  const fetchUsers = async (id: string) => {
    try {
      setListLoading(true);
      console.log("Đang gọi API /api/users");

      const res = await fetch(`/api/users?currentUserId=${id}`);
      console.log("Trạng thái API /users:", res.status);

      if (!res.ok) {
        const loi = await res.text();
        console.error("Lỗi Backend API /users:", loi);
        return;
      }

      const data = await res.json();
      console.log("Dữ liệu user nhận được:", data);

      // delay 
      setTimeout(() => {
        setUsers(data);
        setListLoading(false);
      }, 400);

    } catch (error) {
      console.error("Lỗi Frontend khi fetch user:", error);
      setListLoading(false);
    }
  };

  const handleLike = async (toUserId: string) => {
    if (loading) return;

    try {
      setLoading(true);

      console.log("Đang gửi yêu cầu like:", {
        fromUserId: currentUserId,
        toUserId,
      });

      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: currentUserId,
          toUserId,
        }),
      });

      if (!res.ok) {
        const loi = await res.text();
        console.error("Lỗi Backend API /like:", loi);
        return;
      }

      const data = await res.json();

      if (data.match) {
        setShowMatchModal(true);

        setTimeout(() => {
          router.push(`/match/${data.matchId}`);
        }, 1000);

        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== toUserId));

    } catch (error) {
      console.error("Lỗi Frontend khi gửi like:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMatches = async (id: string) => {
    try {
      const res = await fetch(`/api/matches?userId=${id}`);

      if (!res.ok) return;

      const data = await res.json();

      const pendingMatch = data.find(
        (match: any) => match.status === "pending"
      );

      if (pendingMatch) {
        setShowMatchModal(true);

        setTimeout(() => {
          router.push(`/match/${pendingMatch._id}`);
        }, 1000);
      }

    } catch (error) {
      console.error("Lỗi kiểm tra match:", error);
    }
  };

  // Loading toàn trang
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-100">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Dashboard
        </h1>

        <button
          onClick={() => router.push("/matches")}
          className="bg-purple-500 text-white px-4 py-2 mb-5 rounded-full shadow hover:scale-105 transition"
        >
          View Matches
        </button>

        {/* Skeleton loading */}
        {listLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Không còn user */}
        {!listLoading && users.length === 0 && (
          <p className="text-center text-gray-500">
            Không còn người dùng nào
          </p>
        )}

        {/* Danh sách user */}
        {!listLoading && users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-6 rounded-2xl shadow-lg mb-6 hover:shadow-xl transition duration-300"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {user.name} ({user.age})
            </h2>

            <p className="text-gray-600 mb-6">{user.bio}</p>

            <button
              disabled={loading}
              onClick={() => handleLike(user._id)}
              className="flex items-center gap-2 bg-linear-to-r from-pink-500 to-purple-500 
              text-white px-5 py-2 rounded-full shadow-md 
              hover:scale-105 transition disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              {loading ? "Loading..." : "Like"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}