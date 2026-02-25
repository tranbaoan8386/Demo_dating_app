import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Availability from "@/models/Availability";
import Match from "@/models/Match";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");
    const currentUserId = searchParams.get("userId");

    if (!matchId) {
      return NextResponse.json(
        { message: "Thiếu matchId" },
        { status: 400 }
      );
    }

    // Lấy match
    const match = await Match.findById(matchId);

    if (!match) {
      return NextResponse.json(
        { message: "Match không tồn tại" },
        { status: 404 }
      );
    }

    // Lấy toàn bộ slot của match
    const slots = await Availability.find({ matchId });

    // Nếu có currentUserId → lọc slot của đối phương
    let partnerAvailability = slots;

    if (currentUserId) {
      partnerAvailability = slots.filter(
        (slot) => slot.userId.toString() !== currentUserId
      );
    }

    return NextResponse.json({
      partnerAvailability,
      matchStatus: match.status,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const { matchId, userId, date, from, to } = body;

  if (!matchId || !userId || !date || !from || !to) {
    return NextResponse.json({
      status: "error",
      message: "Thiếu dữ liệu",
    });
  }

  // 0️⃣ Lấy match
  const existingMatch = await Match.findById(matchId);
  if (!existingMatch) {
    return NextResponse.json({
      status: "error",
      message: "Match không tồn tại",
    });
  }

  if (existingMatch.status === "confirmed") {
    return NextResponse.json({
      status: "already-confirmed",
    });
  }

  // 🔥 Chuẩn hóa date
  const requestDate = new Date(date + "T00:00:00");
  const requestDateStr = requestDate.toISOString().split("T")[0];

  // =====================================================
  // 1️⃣ CHECK USER HIỆN TẠI CÓ BỊ TRÙNG LỊCH KHÔNG
  // =====================================================

  const userConfirmedMatches = await Match.find({
    status: "confirmed",
    users: userId,
  });

  for (let m of userConfirmedMatches) {
    if (!m.dateConfirmed) continue;

    const confirmedDateStr = new Date(m.dateConfirmed.date)
      .toISOString()
      .split("T")[0];

    const sameDate = confirmedDateStr === requestDateStr;

    const overlap =
      from < m.dateConfirmed.to &&
      m.dateConfirmed.from < to;

    if (sameDate && overlap) {
      return NextResponse.json({
        status: "conflict",
        message: "Bạn đã có lịch hẹn trùng giờ.",
      });
    }
  }

  // =====================================================
  // 2️⃣ Lưu availability
  // =====================================================

  // 🔹 Giới hạn tối đa 2 slot cho 1 user trong 1 match
const userSlotCount = await Availability.countDocuments({
  matchId,
  userId,
});

if (userSlotCount >= 2) {
  return NextResponse.json({
    status: "spam-limit",
    message: "Bạn chỉ được chọn tối đa 2 khung giờ.",
  });
}

// 🔹 Kiểm tra trùng hoặc overlap slot của chính user
const existingSlot = await Availability.findOne({
  matchId,
  userId,
  date: requestDate,
  from: { $lt: to },
  to: { $gt: from },
});

if (existingSlot) {
  return NextResponse.json({
    status: "duplicate",
    message: "Khung giờ này đã tồn tại hoặc bị trùng.",
  });
}
  await Availability.create({
    matchId,
    userId,
    date: requestDate,
    from,
    to,
  });

  // =====================================================
  // 3️⃣ Lấy tất cả slot của match
  // =====================================================

  const slots = await Availability.find({ matchId });

  const users = [...new Set(slots.map((s) => s.userId.toString()))];

  if (users.length < 2) {
    return NextResponse.json({ status: "waiting" });
  }

  const user1Slots = slots.filter(
    (s) => s.userId.toString() === users[0]
  );

  const user2Slots = slots.filter(
    (s) => s.userId.toString() === users[1]
  );

  // =====================================================
  // 4️⃣ Tìm overlap giữa 2 user
  // =====================================================

  for (let a of user1Slots) {
    for (let b of user2Slots) {
      const aDateStr = new Date(a.date)
        .toISOString()
        .split("T")[0];

      const bDateStr = new Date(b.date)
        .toISOString()
        .split("T")[0];

      const sameDate = aDateStr === bDateStr;

      const overlap =
        a.from < b.to &&
        b.from < a.to;

      if (sameDate && overlap) {
        const finalFrom = a.from > b.from ? a.from : b.from;
        const finalTo = a.to < b.to ? a.to : b.to;

        // =====================================================
        // 🔥 5️⃣ CHECK CONFLICT CHO CẢ 2 USER TRƯỚC KHI CONFIRM
        // =====================================================

        for (let userIdToCheck of users) {
          const confirmedMatches = await Match.find({
            status: "confirmed",
            users: userIdToCheck,
          });

          for (let m of confirmedMatches) {
            if (!m.dateConfirmed) continue;

            const confirmedDateStr = new Date(m.dateConfirmed.date)
              .toISOString()
              .split("T")[0];

            const sameDateCheck =
              confirmedDateStr === aDateStr;

            const overlapCheck =
              finalFrom < m.dateConfirmed.to &&
              m.dateConfirmed.from < finalTo;

            if (sameDateCheck && overlapCheck) {
              return NextResponse.json({
                status: "conflict",
                message:
                  "Một trong hai người đã có lịch trùng.",
              });
            }
          }
        }

        // =====================================================
        // 6️⃣ CONFIRM MATCH
        // =====================================================

        await Match.findByIdAndUpdate(matchId, {
          status: "confirmed",
          dateConfirmed: {
            date: requestDate,
            from: finalFrom,
            to: finalTo,
          },
        });

        return NextResponse.json({ status: "matched" });
      }
    }
  }

  return NextResponse.json({ status: "no-match" });
}