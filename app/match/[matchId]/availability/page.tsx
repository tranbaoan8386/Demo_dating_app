"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Slot {
  date: string;
  from: string;
  to: string;
  userId: string;
}

export default function AvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [userId, setUserId] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [partnerSlots, setPartnerSlots] = useState<Slot[]>([]);

  // Lấy userId từ localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    if (!matchId || !userId) return;

    try {
      const res = await fetch(
        `/api/availability?matchId=${matchId}&userId=${userId}`
      );

      if (!res.ok) {
        throw new Error("Fetch thất bại");
      }

      const data = await res.json();

      setPartnerSlots(data.partnerAvailability || []);

      if (data.matchStatus === "confirmed") {
        setIsConfirmed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  }, [matchId, userId]);

  useEffect(() => {
    if (!matchId || !userId) return;

    fetchAvailability();

    const interval = setInterval(() => {
      fetchAvailability();
    }, 5000);

    return () => clearInterval(interval);
  }, [matchId, userId, fetchAvailability]);

  const handleSubmit = async () => {
    if (loading) return;

    if (!date || !from || !to) {
      setMessage("Vui lòng chọn đầy đủ thời gian.");
      return;
    }

    if (from >= to) {
      setMessage("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      return;
    }

    if (!userId) {
      setMessage("Không tìm thấy user.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          userId,
          date,
          from,
          to,
        }),
      });

      const data = await res.json();

      if (data.status === "matched") {
        router.push(`/match/${matchId}`);
        return;
      }

      if (data.status === "waiting") {
        setMessage("Đang chờ người kia chọn thời gian.");
      }

      if (data.status === "no-match") {
        setMessage("Chưa tìm được thời gian trùng.");
      }
      if (data.status === "duplicate") {
        setMessage(data.message || "Khung giờ này đã tồn tại.");
      }

      if (data.status === "spam-limit") {
        setMessage(data.message || "Bạn chỉ được chọn tối đa 2 khung giờ.");
      }

      if (data.status === "conflict") {
        setMessage("Bạn đã có lịch hẹn trùng giờ.");
      }

      if (data.status === "already-confirmed") {
        setMessage("Cuộc hẹn này đã được xác nhận.");
        setIsConfirmed(true);
      }

      await fetchAvailability();
    } catch (err) {
      setMessage("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-purple-100">
        <div className="animate-pulse text-gray-500 text-lg">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl">

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Chọn thời gian rảnh trong 3 tuần
        </h1>

        <div className="space-y-4">

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Ngày
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Từ
              </label>
              <input
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Đến
              </label>
              <input
                type="time"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-400 outline-none transition"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-purple-500 to-pink-500 hover:scale-105 shadow-md"
            }`}
          >
            {loading ? "Đang lưu..." : "Lưu thời gian"}
          </button>

          {message && (
            <div className="mt-4 p-4 rounded-xl bg-gray-100 text-gray-700 text-sm">
              {message}
            </div>
          )}

          {isConfirmed && (
            <button
              onClick={() => router.push(`/match/${matchId}`)}
              className="w-full mt-2 py-3 bg-green-500 text-white rounded-xl hover:scale-105 transition"
            >
              Xem cuộc hẹn
            </button>
          )}

          {partnerSlots.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">
                Thời gian đối phương đã chọn:
              </h2>

              <div className="space-y-2">
                {partnerSlots.map((slot, index) => {
                  const overlap =
                    slot.date === date &&
                    !(to <= slot.from || from >= slot.to);

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl text-sm ${
                        overlap
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-50 text-gray-700"
                      }`}
                    >
                      {slot.date} | {slot.from} - {slot.to}
                      {overlap && " (Trùng giờ!)"}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}