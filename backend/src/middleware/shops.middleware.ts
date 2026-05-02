import { z } from 'zod'

export const updateShopSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama toko minimal 2 karakter').max(255).optional(),
    description: z.union([z.string().max(5000), z.null()]).optional(),
    slug: z.string().trim().min(2, 'Slug minimal 2 karakter').max(255).optional(),
  })
  .refine((o) => o.name !== undefined || o.description !== undefined || o.slug !== undefined, {
    message: 'Minimal satu field yang diperbarui',
  })

export function parseUpdateShopBody(body: unknown) {
  return updateShopSchema.safeParse(body)
}
