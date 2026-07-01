import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ message: "Geçerli bir e-posta adresi gir." }),
  password: z.string().min(1, { message: "Şifre gerekli." }),
})

export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "İsim en az 2 karakter olmalı." })
    .max(80, { message: "İsim en fazla 80 karakter olabilir." }),
  email: z.email({ message: "Geçerli bir e-posta adresi gir." }),
  password: z.string().min(8, { message: "Şifre en az 8 karakter olmalı." }),
})

export type SignupValues = z.infer<typeof signupSchema>
