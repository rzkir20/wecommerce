import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Heart,
  Minus,
  PlayCircle,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react'
import { useState } from 'react'

import { ProductCard } from '../components/product-card'
import { useCart } from '../context/CartContext'
import dashboardData from '../data/data.json'

type ProductDetailsMap = Record<string, ProductDetail>
type GalleryImage = {
  type: 'image'
  src: string
  thumb: string
  alt: string
}
type GalleryVideo = { type: 'video'; alt: string }
type GalleryItem = GalleryImage | GalleryVideo

type ProductDetail = {
  meta: { title: string }
  id: string
  collection: string
  shortTitle: string
  titleLine2: string
  badge: string
  rating: number
  reviewCountLabel: string
  price: number
  priceFormatted: string
  compareAtPrice: number
  compareAtFormatted: string
  description: string
  specs: { label: string; value: string }[]
  strapColors: { id: string; swatch: string; selected: boolean }[]
  trustBadges: { label: string }[]
  gallery: GalleryItem[]
  reviews: {
    heading: string
    subheading: string
    viewAllHref: string
    summaryScore: string
    summaryTotalLabel: string
    summaryRating: number
    items: {
      author: string
      avatar: string
      relativeTime: string
      quote: string
    }[]
  }
  youMayAlsoLike: {
    name: string
    price: number
    priceFormatted: string
    image: string
    rating: number
    detailSlug: string | null
  }[]
}

const productDetails = dashboardData.productDetails as ProductDetailsMap | undefined

export const Route = createFileRoute('/$slug')({
  head: ({ params }) => {
    const p = productDetails?.[params.slug]
    return {
      meta: [{ title: p?.meta.title ?? 'LUXE' }],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const product = productDetails?.[slug]

  if (!product) {
    return <Navigate to="/products" />
  }

  return <ProductDetailPage product={product} />
}

function ProductDetailPage({ product }: { product: ProductDetail }) {
  const { addItem, openCart } = useCart()
  const [mainSrc, setMainSrc] = useState(
    () => product.gallery.find((g): g is GalleryImage => g.type === 'image')?.src ?? '',
  )
  const [strapId, setStrapId] = useState(
    () =>
      (product.strapColors.find((s) => s.selected) ?? product.strapColors[0]).id,
  )
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  const fullName = `${product.shortTitle} ${product.titleLine2}`

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      collection: product.collection,
      name: fullName,
      image: mainSrc,
      price: product.price,
      quantity: qty,
    })
    openCart()
  }

  return (
    <>
      <main className="custom-scrollbar flex-1 space-y-12 overflow-y-auto p-10 pt-32 md:pt-40">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="glass-panel relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] p-12">
              <img
                src={mainSrc}
                alt={fullName}
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#d4ff3f]/10 blur-[100px]" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.gallery.map((item, idx) =>
                item.type === 'image' ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainSrc(item.src)}
                    className={[
                      'glass-panel rounded-2xl p-4 transition-colors',
                      mainSrc === item.src
                        ? 'border-[#d4ff3f]/50 bg-[#d4ff3f]/5'
                        : 'hover:bg-muted',
                    ].join(' ')}
                  >
                    <img src={item.thumb} alt={item.alt} className="h-auto w-full" />
                  </button>
                ) : (
                  <button
                    key={idx}
                    type="button"
                    className="glass-panel flex items-center justify-center rounded-2xl p-4 transition-colors hover:bg-muted"
                    aria-label="Play product video"
                  >
                    <PlayCircle className="h-9 w-9 text-muted-foreground" />
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#d4ff3f]/10 px-2 py-1 text-[10px] font-black tracking-widest text-[#d4ff3f] uppercase">
                  {product.badge}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={[
                        'h-3.5 w-3.5',
                        i < product.rating ? 'fill-[#d4ff3f] text-[#d4ff3f]' : 'text-muted-foreground/80',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{product.reviewCountLabel}</span>
              </div>
              <h1 className="text-4xl leading-none font-black tracking-tighter uppercase md:text-5xl">
                {product.shortTitle} <br />
                {product.titleLine2}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-[#d4ff3f]">
                {product.priceFormatted}
              </span>
              <span className="text-lg font-bold text-muted-foreground line-through">
                {product.compareAtFormatted}
              </span>
            </div>

            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="grid grid-cols-2 gap-4">
              {product.specs.map((spec) => (
                <div key={spec.label} className="stat-badge rounded-2xl p-4">
                  <p className="mb-1 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                    {spec.label}
                  </p>
                  <p className="text-sm font-bold">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-black tracking-widest uppercase">Select Strap Color</p>
                <div className="flex gap-3">
                  {product.strapColors.map((strap) => (
                    <button
                      key={strap.id}
                      type="button"
                      onClick={() => setStrapId(strap.id)}
                      aria-label={`Strap ${strap.id}`}
                      className={[
                        'h-10 w-10 rounded-full bg-muted p-0.5',
                        strapId === strap.id
                          ? 'border-2 border-[#d4ff3f]'
                          : 'border-2 border-transparent hover:border-foreground/20',
                      ].join(' ')}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{ backgroundColor: strap.swatch }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-black tracking-widest uppercase">Quantity</p>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-[#18181b] px-4 py-2">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-4 text-center font-bold">{qty}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setQty((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="neon-glow flex-1 rounded-2xl bg-[#d4ff3f] py-4 text-center font-black tracking-widest text-black uppercase transition-all hover:bg-[#c2f02b]"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => setWishlisted((w) => !w)}
                aria-pressed={wishlisted}
                className={[
                  'flex items-center justify-center rounded-2xl border px-6 py-4 transition-colors',
                  wishlisted
                    ? 'border-[#d4ff3f]/50 bg-[#d4ff3f]/10 text-[#d4ff3f]'
                    : 'border-border hover:bg-muted',
                ].join(' ')}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              {product.trustBadges.map((t, i) => (
                <div
                  key={`${t.label}-${i}`}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground"
                >
                  {i === 0 ? (
                    <Truck className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 border-t border-border pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {product.reviews.heading}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.reviews.subheading}</p>
            </div>
            <Link
              to={product.reviews.viewAllHref}
              className="flex items-center gap-2 text-sm font-black tracking-widest text-[#d4ff3f] uppercase"
            >
              View All Reviews
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="glass-panel rounded-3xl p-8">
              <div className="space-y-2 text-center">
                <div className="text-6xl font-black">{product.reviews.summaryScore}</div>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={[
                        'h-5 w-5',
                        i < product.reviews.summaryRating
                          ? 'fill-[#d4ff3f] text-[#d4ff3f]'
                          : 'text-muted-foreground/80',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-muted-foreground">
                  {product.reviews.summaryTotalLabel}
                </p>
              </div>
            </div>

            {product.reviews.items.map((rev) => (
              <div key={rev.author} className="glass-panel space-y-4 rounded-3xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full bg-muted"
                    />
                    <span className="text-sm font-bold">{rev.author}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {rev.relativeTime}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground italic">&ldquo;{rev.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 pt-12 pb-12">
          <h2 className="text-xl font-bold tracking-tight uppercase">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.youMayAlsoLike.map((rec) => {
              const card = (
                <ProductCard
                  name={rec.name}
                  price={rec.priceFormatted}
                  image={rec.image}
                  rating={rec.rating}
                  className="h-full border-transparent hover:border-[#d4ff3f]/30"
                />
              )
              if (rec.detailSlug) {
                return (
                  <Link
                    key={rec.name}
                    to="/$slug"
                    params={{ slug: rec.detailSlug }}
                    className="block h-full"
                  >
                    {card}
                  </Link>
                )
              }
              return (
                <Link key={rec.name} to="/products" className="block h-full">
                  {card}
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
