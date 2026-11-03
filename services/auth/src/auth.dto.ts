import { z } from "zod";

export const signupDtoSchema = z
  .object({
    fullname: z.string().min(1, "Fullname is required"),
    email: z.email("Enter a valid Email"),
    mobile: z.string().min(10, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Atleast 8 Characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
  })
  .strict();

export const loginDtoSchema = z
  .object({
    email: z.email("Enter a valid Email"),
    password: z
      .string()
      .min(8, "Atleast 8 Characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
  })
  .strict();

export type signupDto = z.infer<typeof signupDtoSchema>;
export type loginDto = z.infer<typeof loginDtoSchema>;
