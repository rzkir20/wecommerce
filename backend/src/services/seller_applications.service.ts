import type { Prisma, SellerApplication } from '@prisma/client'

import { prisma } from '../lib/prisma.js'

export type CreateSellerApplicationInput = {
  store_name: string
  ktp_number: string
  ktp_image: string
  selfie_ktp: string
}

function slugifyStoreName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)

  return base.length > 0 ? base : 'toko'
}

async function allocateUniqueSlug(tx: Prisma.TransactionClient, base: string): Promise<string> {
  let slug = base.slice(0, 255)
  let n = 0

  while (
    await tx.shop.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    n += 1
    const suffix = `-${n}`
    slug = `${base.slice(0, Math.max(1, 255 - suffix.length))}${suffix}`
  }

  return slug
}

export async function createSellerApplication(
  userId: string,
  input: CreateSellerApplicationInput
): Promise<
  | { ok: true; application: SellerApplication }
  | { ok: false; error: string; status: 400 | 403 | 409 }
> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return { ok: false, error: 'User tidak ditemukan', status: 403 }
  }

  if (user.role === 'seller') {
    return { ok: false, error: 'Akun sudah terdaftar sebagai seller', status: 403 }
  }

  const pending = await prisma.sellerApplication.findFirst({
    where: { user_id: userId, status: 'pending' },
  })

  if (pending) {
    return { ok: false, error: 'Masih ada pengajuan yang menunggu persetujuan', status: 409 }
  }

  try {
    const application = await prisma.sellerApplication.create({
      data: {
        user_id: userId,
        store_name: input.store_name.trim(),
        ktp_number: input.ktp_number,
        ktp_image: input.ktp_image.trim(),
        selfie_ktp: input.selfie_ktp.trim(),
        status: 'pending',
      },
    })
    return { ok: true, application }
  } catch {
    return { ok: false, error: 'Gagal menyimpan pengajuan', status: 400 }
  }
}

export async function listMySellerApplications(userId: string) {
  return prisma.sellerApplication.findMany({
    where: { user_id: userId },
    orderBy: { id: 'desc' },
  })
}

export async function listPendingSellerApplications() {
  return prisma.sellerApplication.findMany({
    where: { status: 'pending' },
    orderBy: { id: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export async function approveSellerApplication(applicationId: string): Promise<
  | {
      ok: true
      application: SellerApplication
      shop: { id: string; slug: string; name: string }
    }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.sellerApplication.findUnique({
        where: { id: applicationId },
      })

      if (!application) {
        throw Object.assign(new Error('NOT_FOUND'), { code: 'NOT_FOUND' })
      }

      if (application.status !== 'pending') {
        throw Object.assign(new Error('INVALID_STATUS'), { code: 'INVALID_STATUS' })
      }

      const existingShop = await tx.shop.findUnique({
        where: { user_id: application.user_id },
      })

      if (existingShop) {
        throw Object.assign(new Error('SHOP_EXISTS'), { code: 'SHOP_EXISTS' })
      }

      const baseSlug = slugifyStoreName(application.store_name)
      const slug = await allocateUniqueSlug(tx, baseSlug)

      const shop = await tx.shop.create({
        data: {
          user_id: application.user_id,
          name: application.store_name.trim(),
          slug,
          description: null,
          status: 'active',
        },
      })

      await tx.user.update({
        where: { id: application.user_id },
        data: { role: 'seller' },
      })

      const updated = await tx.sellerApplication.update({
        where: { id: applicationId },
        data: { status: 'approved', rejection_reason: null },
      })

      return {
        application: updated,
        shop: { id: shop.id, slug: shop.slug, name: shop.name },
      }
    })

    return { ok: true, ...result }
  } catch (err) {
    const code = err instanceof Error && 'code' in err ? (err as Error & { code: string }).code : ''

    if (code === 'NOT_FOUND') {
      return { ok: false, error: 'Pengajuan tidak ditemukan', status: 404 }
    }
    if (code === 'INVALID_STATUS') {
      return { ok: false, error: 'Pengajuan tidak dalam status pending', status: 409 }
    }
    if (code === 'SHOP_EXISTS') {
      return { ok: false, error: 'User sudah memiliki toko', status: 409 }
    }

    return { ok: false, error: 'Gagal menyetujui pengajuan', status: 400 }
  }
}

export async function rejectSellerApplication(
  applicationId: string,
  rejectionReason: string
): Promise<{ ok: true; application: SellerApplication } | { ok: false; error: string; status: 400 | 404 | 409 }> {
  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) {
    return { ok: false, error: 'Pengajuan tidak ditemukan', status: 404 }
  }

  if (application.status !== 'pending') {
    return { ok: false, error: 'Pengajuan tidak dalam status pending', status: 409 }
  }

  const updated = await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: 'rejected',
      rejection_reason: rejectionReason.trim(),
    },
  })

  return { ok: true, application: updated }
}
