"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, LogIn, Venus, Mars } from "lucide-react";

interface UserType {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  email: string;
}

export default function Profiles() {
  const [users, setUsers] = useState<UserType[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/profiles");
    const data = await res.json();
    setUsers(data);
  };

  const handleSelectUser = (id: string) => {
    localStorage.setItem("currentUserId", id);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-linear-0-to-br from-pink-50 to-purple-100 py-10">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center gap-2">
          <User className="w-7 h-7 text-purple-500" />
          All Profiles
        </h1>

        <div className="grid gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-gray-800">
                {user.name}
              </h2>
              <p className="bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full">
                {user.age} years old
              </p>

                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  {user.gender.toLowerCase() === "female" ? (
                    <Venus className="w-4 h-4 text-pink-500" />
                  ) : (
                    <Mars className="w-4 h-4 text-blue-500" />
                  )}
                  {user.gender}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{user.bio}</p>

              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>

              <button
                onClick={() => handleSelectUser(user._id)}
                className="flex items-center justify-center gap-2 w-full 
                bg-linear-to-r from-purple-500 to-pink-500 
                text-white py-2 rounded-xl shadow-md 
                hover:scale-105 transition duration-200"
              >
                <LogIn className="w-4 h-4" />
                Login as this user
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}