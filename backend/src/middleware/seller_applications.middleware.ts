import { z } from 'zod'

const digitsOnlyKtp = z
  .string()
  .transform((s) => s.replace(/\D/g, ''))
  .pipe(z.string().length(16, 'Nomor KTP harus 16 digit'))

export const createSellerApplicationSchema = z.object({
  store_name: z.string().trim().min(2, 'Nama toko minimal 2 karakter').max(255),
  ktp_number: digitsOnlyKtp,
  ktp_image: z.string().trim().min(1, 'URL atau path gambar KTP wajib').max(512),
  selfie_ktp: z.string().trim().min(1, 'URL atau path selfie KTP wajib').max(512),
})

export const rejectSellerApplicationSchema = z.object({
  rejection_reason: z.string().trim().min(1, 'Alasan penolakan wajib diisi').max(1000),
})

export function parseCreateSellerApplicationBody(body: unknown) {
  return createSellerApplicationSchema.safeParse(body)
}

export function parseRejectSellerApplicationBody(body: unknown) {
  return rejectSellerApplicationSchema.safeParse(body)
}
