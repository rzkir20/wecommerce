import type { Shop } from '@prisma/client'

import { prisma } from '../lib/prisma.js'

export type UpdateShopInput = {
  name?: string
  description?: string | null
  slug?: string
}

function slugifySlug(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)

  return base.length > 0 ? base : 'toko'
}

async function assertSlugFreeForShop(excludeShopId: string, candidate: string): Promise<
  | { ok: true; slug: string }
  | { ok: false; error: string }
> {
  const slug = candidate.slice(0, 255)
  const row = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (row && row.id !== excludeShopId) {
    return { ok: false, error: 'Slug sudah dipakai toko lain' }
  }

  return { ok: true, slug }
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  return prisma.shop.findUnique({
    where: { slug },
  })
}

export async function getShopForUser(userId: string): Promise<Shop | null> {
  return prisma.shop.findUnique({
    where: { user_id: userId },
  })
}

export async function updateShopForUser(
  userId: string,
  input: UpdateShopInput
): Promise<
  | { ok: true; shop: Shop }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const shop = await prisma.shop.findUnique({
    where: { user_id: userId },
  })

  if (!shop) {
    return { ok: false, error: 'Toko tidak ditemukan', status: 404 }
  }

  if (shop.status === 'suspended') {
    return { ok: false, error: 'Toko ditangguhkan', status: 403 }
  }

  let nextSlug = shop.slug

  if (input.slug !== undefined) {
    const normalized = slugifySlug(input.slug)
    const alloc = await assertSlugFreeForShop(shop.id, normalized)
    if (!alloc.ok) {
      return { ok: false, error: alloc.error, status: 409 }
    }
    nextSlug = alloc.slug
  }

  const name = input.name !== undefined ? input.name.trim() : shop.name

  if (name.length < 2) {
    return { ok: false, error: 'Nama toko minimal 2 karakter', status: 400 }
  }

  try {
    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name,
        slug: nextSlug,
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
    })
    return { ok: true, shop: updated }
  } catch {
    return { ok: false, error: 'Gagal memperbarui toko', status: 400 }
  }
}
