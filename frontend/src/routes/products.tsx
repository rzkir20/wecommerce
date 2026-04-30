import { Link, createFileRoute } from '@tanstack/react-router'

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
} from 'lucide-react'

import { ProductCard } from '../components/product-card'

import { Card, CardContent } from '../components/ui/card'

import dashboardData from '../data/data.json'

export const Route = createFileRoute('/products')({ component: ProductsPage })

function ProductsPage() {
  const data = dashboardData
  const page = data.productsPage

  return (
    <>
      <main className="overflow-y-auto px-10 pt-32 pb-12 md:pt-40 container mx-auto">
        <div className="mb-10">
          <nav className="mb-4 flex gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            <a href="/" className="transition-colors hover:text-foreground">
              {page.breadcrumb[0]}
            </a>
            <span>/</span>
            <span className="text-muted-foreground">{page.breadcrumb[1]}</span>
          </nav>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h1 className="text-4xl leading-none font-black tracking-tight uppercase md:text-5xl">
              Luxury Watches <br />
              Collection
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none rounded-xl border border-border bg-[#121214] px-4 py-3 pr-10 text-xs font-bold text-muted-foreground focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none">
                  {page.sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="flex overflow-hidden rounded-xl border border-border">
                <button className="bg-[#121214] p-3 text-[#d4ff3f]">
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button className="bg-muted p-3 text-muted-foreground transition-colors hover:text-foreground">
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="w-72 shrink-0 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest text-foreground uppercase">
                Categories
              </h3>
              <div className="flex flex-col gap-2">
                {page.categories.map((category) => (
                  <a
                    key={category.name}
                    href="#"
                    className={[
                      'flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                      category.active
                        ? 'border border-[#d4ff3f]/10 bg-[#d4ff3f]/5 text-[#d4ff3f]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    <span>{category.name}</span>
                    <span className="text-[10px] opacity-60">
                      {category.count}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Card className="rounded-3xl p-6">
              <h3 className="text-xs font-black tracking-widest text-foreground uppercase">
                Price Range
              </h3>
              <CardContent className="space-y-4 px-0 pb-0">
                <div className="relative h-1 w-full rounded-full bg-zinc-800">
                  <div className="absolute inset-y-0 left-0 right-1/4 rounded-full bg-[#d4ff3f]" />
                  <div className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-black bg-white" />
                  <div className="absolute top-1/2 right-1/4 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-black bg-white" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground">
                    {page.priceRange.min}
                  </div>
                  <div className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground">
                    {page.priceRange.max}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest text-foreground uppercase">
                Case Material
              </h3>
              <div className="space-y-3">
                {page.materials.map((material) => (
                  <label
                    key={material.name}
                    className="group flex cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={material.checked}
                      className="peer hidden"
                    />
                    <div className="flex h-5 w-5 items-center justify-center rounded border border-border transition-all group-hover:border-[#d4ff3f]/50 peer-checked:border-[#d4ff3f] peer-checked:bg-[#d4ff3f]">
                      <Check className="h-3 w-3 text-black" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      {material.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black tracking-widest text-foreground uppercase">
                Premium Brands
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {page.brands.map((brand) => (
                  <button
                    key={brand}
                    className="rounded-xl border border-border bg-muted px-3 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:border-[#d4ff3f]/20 hover:text-[#d4ff3f]"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {page.products.map((product) => {
                const hasSlug =
                  'slug' in product && typeof product.slug === 'string'
                const card = (
                  <ProductCard
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    imageHover={
                      'imageHover' in product &&
                      typeof product.imageHover === 'string'
                        ? product.imageHover
                        : undefined
                    }
                    rating={product.rating}
                    collection={product.collection}
                    badge={'badge' in product ? product.badge : undefined}
                  />
                )

                if (hasSlug) {
                  return (
                    <Link
                      key={product.name}
                      to="/$slug"
                      params={{ slug: product.slug }}
                      className="block cursor-pointer"
                    >
                      {card}
                    </Link>
                  )
                }

                return (
                  <article key={product.name} className="cursor-pointer">
                    {card}
                  </article>
                )
              })}
            </div>

            <div className="mt-20 flex items-center justify-center gap-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                <button className="h-12 w-12 rounded-xl bg-[#d4ff3f] text-sm font-black text-black">
                  1
                </button>
                <button className="h-12 w-12 rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
                  2
                </button>
                <button className="h-12 w-12 rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
                  3
                </button>
                <span className="flex items-center px-2 text-muted-foreground">
                  ...
                </span>
                <button className="h-12 w-12 rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
                  24
                </button>
              </div>
              <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-colors hover:text-foreground">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
