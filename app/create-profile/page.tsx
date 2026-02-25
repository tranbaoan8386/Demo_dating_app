"use client";

import { User, Mail, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/validations/user.schema";
import { z } from "zod";

type FormData = z.input<typeof createUserSchema>;

export default function CreateProfile() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      localStorage.setItem("currentUserId", result._id);
      window.location.href = "/dashboard";
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-pink-50 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Profile
        </h1>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Name */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                placeholder="Name"
                {...register("name")}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none
                ${errors.name ? "border-red-500" : "focus:ring-2 focus:ring-purple-400"}`}
              />
            </div>

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <input
              type="number"
              placeholder="Age"
              {...register("age", { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-xl outline-none
              ${errors.age ? "border-red-500" : "focus:ring-2 focus:ring-purple-400"}`}
            />

            {errors.age && (
              <p className="text-red-500 text-sm mt-1">
                {errors.age.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <select
              {...register("gender")}
              className={`w-full px-4 py-2 border rounded-xl outline-none
              ${errors.gender ? "border-red-500" : "focus:ring-2 focus:ring-purple-400"}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male ♂</option>
              <option value="female">Female ♀</option>
            </select>

            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                rows={3}
                placeholder="Bio"
                {...register("bio")}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none resize-none
                ${errors.bio ? "border-red-500" : "focus:ring-2 focus:ring-purple-400"}`}
              />
            </div>

            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none
                ${errors.email ? "border-red-500" : "focus:ring-2 focus:ring-purple-400"}`}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="
            w-full 
            bg-linear-to-r from-purple-500 to-pink-500
            hover:from-purple-600 hover:to-pink-600
            text-white py-2 rounded-xl shadow-md 
            hover:scale-105 transition duration-200
            disabled:opacity-50
            "
          >
            {isSubmitting ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}