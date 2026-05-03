import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter'),
    email: z
      .string()
      .trim()
      .email('Format email tidak valid'),
    phone: z
      .string()
      .trim()
      .max(32, 'Nomor telepon maksimal 32 karakter')
      .default('')
      .refine(
        (s) => {
          if (s.length === 0) return true
          const digits = s.replace(/\D/g, '')
          return digits.length >= 8 && digits.length <= 15
        },
        {
          message:
            'Nomor telepon berisi 8–15 digit (kosongkan jika tidak diisi)',
        },
      ),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi tidak cocok',
  })

export type RegisterSchemaInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi'),
})

export type LoginSchemaInput = z.infer<typeof loginSchema>

export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Format email tidak valid'),
})

export type ForgotPasswordEmailInput = z.infer<typeof forgotPasswordEmailSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi tidak cocok',
  })

export type ResetPasswordSchemaInput = z.infer<typeof resetPasswordSchema>
