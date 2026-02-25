import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  age: z.coerce
    .number()
    .min(18, "Age must be >= 18")
    .max(60, "Age must be <= 60"),

  gender: z
    .string()
    .refine((val) => val === "male" || val === "female", {
      message: "Please select gender",
    }),

  bio: z.string().max(200).optional(),

  email: z.string().email("Invalid email"),
});