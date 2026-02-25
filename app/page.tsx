"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, Users, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleNavigate = (path: string, type: string) => {
    setLoading(type);

    setTimeout(() => {
      router.push(path);
    }, 300); // delay nhẹ cho mượt
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-pink-50 to-purple-100 flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">

        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Mini Dating App
        </h1>

        <div className="space-y-4">

          {/* Create Profile */}
          <button
            disabled={loading !== null}
            onClick={() => handleNavigate("/create-profile", "create")}
            className="
              w-full flex items-center justify-center gap-2
              bg-linear-to-r from-purple-500 to-pink-500
              hover:from-purple-600 hover:to-pink-600
              text-white py-3 rounded-xl
              shadow-md hover:scale-105
              transition-all duration-200
              disabled:opacity-60
            "
          >
            {loading === "create" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Profile
              </>
            )}
          </button>

          {/* View Profiles */}
          <button
            disabled={loading !== null}
            onClick={() => handleNavigate("/profiles", "profiles")}
            className="
              w-full flex items-center justify-center gap-2
              border border-purple-400
              text-purple-600
              py-3 rounded-xl
              hover:bg-purple-50
              transition-all duration-200
              disabled:opacity-60
            "
          >
            {loading === "profiles" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                View Profiles
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}