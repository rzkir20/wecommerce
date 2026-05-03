import { Link } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  Watch,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import dashboardData from '../../data/data.json'

import { ModeToggle } from '../ui/mode-toggle'

import { ProfileMenu } from './profile-menu'

type MegaLink = { label: string; href: string }
type MegaColumn = { heading: string; links: MegaLink[] }
type MegaPromo = {
  title: string
  subtitle: string
  href: string
  image: string
}
type MegaNavItem = {
  key: string
  label: string
  href: string
  promo?: MegaPromo
  columns: MegaColumn[]
}

const megaNav = (dashboardData as { megaNav?: MegaNavItem[] }).megaNav ?? []

type HeaderProps = {
  activeItem: string
  cartCount: number
  isAuthReady: boolean
  isLoggedIn: boolean
  userName: string
  userAvatar: string
  onCartClick?: () => void
  onLogout?: () => void
}

export function Header({
  activeItem,
  cartCount,
  isAuthReady,
  isLoggedIn,
  userName,
  userAvatar,
  onCartClick,
  onLogout,
}: HeaderProps) {
  const [megaOpenKey, setMegaOpenKey] = useState<string | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const openMegaItem = useMemo(
    () => megaNav.find((i) => i.key === megaOpenKey) ?? null,
    [megaOpenKey],
  )

  const closeMega = useCallback(() => setMegaOpenKey(null), [])

  const isProducts = activeItem === 'products'
  const isCart = activeItem === 'orders'

  const navTriggerClass = (isOpen: boolean) =>
    [
      'flex items-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold tracking-wide uppercase transition-colors lg:px-3 lg:text-xs',
      isOpen
        ? 'text-[#d4ff3f]'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
    ].join(' ')

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-background/95 backdrop-blur-md">
      <div className="relative w-full">
        {/* Row 1 — Zalora-style: logo | search | account / wishlist / bag */}
        <div className="container mx-auto flex items-center gap-2 px-4 py-3 sm:gap-5 sm:px-8 sm:py-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e11d48] shadow-lg shadow-red-500/20 sm:h-10 sm:w-10">
              <Watch className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <span className="hidden text-sm font-black tracking-tight text-foreground uppercase sm:inline md:text-base">
              LUXE WATCH
            </span>
          </Link>

          <div className="relative min-w-0 flex-1 sm:max-w-none lg:mx-4">
            <input
              type="search"
              placeholder="Cari produk, tren, dan merek."
              className="w-full rounded-full border border-border bg-muted/50 py-2.5 pr-14 pl-4 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#d4ff3f]/40 focus:outline-none sm:py-3 sm:pr-16 sm:pl-5 sm:text-sm"
              aria-label="Cari produk"
            />
            <button
              type="button"
              className="absolute top-1/2 right-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-sm transition-opacity hover:opacity-90 sm:right-1.5 sm:h-9 sm:w-9"
              aria-label="Cari"
            >
              <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden"
              aria-expanded={mobileDrawerOpen}
              aria-label={mobileDrawerOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setMobileDrawerOpen((o) => !o)}
            >
              {mobileDrawerOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {!isAuthReady ? (
              <div className="hidden md:inline-flex h-10 w-10 animate-pulse rounded-lg border border-border bg-muted/50 lg:h-11 lg:w-28" />
            ) : isLoggedIn ? (
              <ProfileMenu
                userName={userName}
                userAvatar={userAvatar}
                onLogout={onLogout}
              />
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/90 transition-colors hover:bg-muted/50 hover:text-foreground md:inline-flex"
              >
                <User
                  className="h-5 w-5 shrink-0 sm:h-[22px] sm:w-[22px]"
                  aria-hidden
                />
                <span className="hidden text-xs font-bold whitespace-nowrap lg:inline">
                  Masuk / Daftar
                </span>
              </Link>
            )}

            <Link
              to="/products"
              className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
            </Link>

            <div className="flex shrink-0 items-center [&_button]:shrink-0">
              <ModeToggle />
            </div>

            <button
              type="button"
              onClick={onCartClick}
              aria-label="Keranjang"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ShoppingBag className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
              <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4ff3f] px-0.5 text-[10px] font-bold text-black">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Nav row + mega panel share one hover zone: leaving this block (e.g. to search row) closes the dropdown */}
        <div
          className="relative"
          onMouseLeave={() => {
            if (
              typeof window !== 'undefined' &&
              window.matchMedia('(min-width: 1024px)').matches
            ) {
              closeMega()
            }
          }}
        >
          {/* Row 2 — main category nav (desktop / tablet), separator like Zalora */}
          <div className="hidden md:block pb-4">
            <div className="container mx-auto px-4 sm:px-8">
              <nav
                className="flex justify-between gap-0.5 lg:gap-1"
                aria-label="Kategori"
              >
                <div className="flex flex-wrap items-center gap-0.5 lg:gap-1">
                  {megaNav.map((item) => (
                    <div
                      key={item.key}
                      className="relative shrink-0"
                      onMouseEnter={() => {
                        if (
                          typeof window !== 'undefined' &&
                          window.matchMedia('(min-width: 1024px)').matches
                        ) {
                          setMegaOpenKey(item.key)
                        }
                      }}
                    >
                      <Link
                        to={item.href}
                        className={navTriggerClass(megaOpenKey === item.key)}
                        onFocus={() => setMegaOpenKey(item.key)}
                        onClick={() => {
                          if (
                            typeof window !== 'undefined' &&
                            !window.matchMedia('(min-width: 1024px)').matches
                          ) {
                            closeMega()
                          }
                        }}
                      >
                        {item.label}
                        <ChevronDown className="hidden h-3.5 w-3.5 opacity-70 lg:inline" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/products"
                    className="shrink-0 rounded-md px-2 py-2.5 text-[11px] font-bold uppercase lg:px-3 lg:text-xs"
                  >
                    Explore Products
                    <ChevronRight className="h-3.5 w-3.5 opacity-70 lg:inline" />
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Full-width mega dropdown — aligned like Zalora (below main bar) */}
          {megaOpenKey && openMegaItem ? (
            <div className="absolute top-full right-0 left-0 z-100 hidden lg:block">
              <div className="border-t border-border bg-card shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <div className="container mx-auto grid gap-10 px-8 py-10 lg:grid-cols-[1fr_1fr_1fr_minmax(200px,280px)]">
                  {openMegaItem.columns.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-4 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                        {col.heading}
                      </p>
                      <ul className="space-y-2.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              to={link.href}
                              className="group flex items-center gap-1 text-sm text-foreground/90 transition-colors hover:text-[#d4ff3f]"
                              onClick={closeMega}
                            >
                              <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {openMegaItem.promo ? (
                    <Link
                      to={openMegaItem.promo.href}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
                      onClick={closeMega}
                    >
                      <img
                        src={openMegaItem.promo.image}
                        alt=""
                        className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute right-0 bottom-0 left-0 p-5">
                        <p className="text-[10px] font-black tracking-widest text-[#d4ff3f] uppercase">
                          Featured
                        </p>
                        <p className="mt-1 font-black text-foreground">
                          {openMegaItem.promo.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {openMegaItem.promo.subtitle}
                        </p>
                      </div>
                    </Link>
                  ) : null}

                  <div className="flex flex-col justify-center border-t border-border pt-6 lg:col-span-full lg:flex-row lg:items-center lg:justify-between lg:border-t lg:pt-6">
                    <p className="text-xs text-muted-foreground">
                      {isProducts
                        ? 'You are browsing watches.'
                        : 'Explore the full catalogue.'}
                    </p>
                    <Link
                      to={openMegaItem.href}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-black tracking-widest text-[#d4ff3f] uppercase lg:mt-0"
                      onClick={closeMega}
                    >
                      Shop all in this category
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile / tablet drawer */}
        {mobileDrawerOpen ? (
          <div className="border-t border-border bg-card lg:hidden">
            <nav className="container mx-auto max-h-[min(70vh,calc(100dvh-5rem))] space-y-1 overflow-y-auto px-4 py-4">
              {!isAuthReady ? (
                <div className="mb-3 h-17 animate-pulse rounded-xl border border-border bg-muted/50" />
              ) : isLoggedIn ? (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <img
                    src={userAvatar}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg border border-border bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground">Halo</p>
                    <p className="truncate text-sm font-bold text-foreground">
                      {userName}
                    </p>
                    <Link
                      to="/forget-password"
                      className="mt-1 inline-block text-xs font-semibold text-[#d4ff3f]"
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      Ubah kata sandi
                    </Link>
                    {onLogout ? (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-red-400 hover:underline"
                        onClick={() => {
                          onLogout()
                          setMobileDrawerOpen(false)
                        }}
                      >
                        Keluar
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <User
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  Masuk / Daftar
                </Link>
              )}
              <Link
                to="/"
                className="block rounded-xl px-4 py-3 text-sm font-bold text-foreground hover:bg-muted"
                onClick={() => setMobileDrawerOpen(false)}
              >
                Home
              </Link>
              {megaNav.map((item) => (
                <details
                  key={item.key}
                  className="group rounded-xl border border-border bg-muted/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border px-4 pb-4 pt-2">
                    <Link
                      to={item.href}
                      className="mb-3 inline-flex items-center gap-1 text-xs font-black tracking-widest text-[#d4ff3f] uppercase"
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      View all
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                    {item.columns.map((col) => (
                      <div key={col.heading} className="mb-4 last:mb-0">
                        <p className="mb-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          {col.heading}
                        </p>
                        <ul className="space-y-1">
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                to={link.href}
                                className="block rounded-lg py-2 text-sm text-foreground/90 hover:bg-muted hover:text-[#d4ff3f]"
                                onClick={() => setMobileDrawerOpen(false)}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              <Link
                to="/cart"
                className={[
                  'block rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted',
                  isCart ? 'text-[#d4ff3f]' : 'text-foreground',
                ].join(' ')}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Cart
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  )
}
