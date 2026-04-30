import { Heart, Star } from 'lucide-react'

import { Card, CardContent } from '#/components/ui/card'

import { cn } from '#/lib/utils'

export type ProductCardProps = {
  name: string
  price: string
  image: string
  imageHover?: string
  rating: number
  collection?: string
  badge?: string
  className?: string
}

function ProductCard({
  name,
  price,
  image,
  imageHover,
  rating,
  collection,
  badge,
  className,
}: ProductCardProps) {
  const hasHoverSwap = Boolean(imageHover && imageHover !== image)

  return (
    <Card
      surface="none"
      className={cn(
        'group cursor-pointer gap-0 border-0 bg-transparent p-0 shadow-none',
        className,
      )}
    >
      <div className="glass-panel relative mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] p-8 transition-all group-hover:border-[#d4ff3f]/20">
        {badge ? (
          <span
            className={cn(
              'absolute top-6 left-6 z-10 rounded px-2.5 py-1 text-[8px] font-black tracking-widest uppercase',
              badge === 'Exclusive'
                ? 'bg-[#e11d48] text-white'
                : 'bg-[#d4ff3f] text-black',
            )}
          >
            {badge}
          </span>
        ) : null}

        <button
          type="button"
          className="absolute top-6 right-6 z-10 text-muted-foreground transition-colors hover:text-[#e11d48]"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-6 w-6" />
        </button>

        {hasHoverSwap ? (
          <div className="relative h-3/4 w-3/4">
            <img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-contain transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:opacity-0"
            />
            <img
              src={imageHover}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:opacity-100"
            />
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            className="h-3/4 w-3/4 object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
          />
        )}

        <div className="absolute inset-0 z-1 flex translate-y-4 items-center justify-center bg-black/40 p-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="w-full rounded-2xl bg-white py-4 text-center text-xs font-black tracking-widest text-black uppercase shadow-[0_0_15px_rgba(212,255,63,0.2)] transition-all group-hover:bg-[#d4ff3f]">
            Quick Add to Bag
          </span>
        </div>
      </div>

      <CardContent className="px-0 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            {collection ? (
              <p className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                {collection}
              </p>
            ) : null}
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  className={cn(
                    'h-3 w-3',
                    idx < rating
                      ? 'fill-[#d4ff3f] text-[#d4ff3f]'
                      : 'text-muted-foreground/90',
                  )}
                />
              ))}
            </div>
          </div>
          <p className="shrink-0 text-2xl font-black text-[#d4ff3f]">{price}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { ProductCard }
