import { createFileRoute } from '@tanstack/react-router'

import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react'

import { ProductCard } from '#/components/product-card'

import { Card, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'

import dashboardData from '#/data/data.json'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const data = dashboardData

  return (
    <>
      <main className="space-y-8 container mx-auto overflow-y-auto px-4 md:px-8 pt-32 md:pt-48">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="gap-0 rounded-[2rem] p-10 lg:col-span-2">
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <div className="w-full md:w-1/2">
                <div className="flex flex-col items-center">
                  <img
                    src={data.hero.image}
                    alt="Featured product"
                    className="h-auto w-full max-w-[300px] object-contain"
                  />
                  <div className="mt-6 flex gap-3">
                    {data.hero.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="stat-badge min-w-[100px] rounded-xl p-3 text-center"
                      >
                        <p className="mb-1 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                          {stat.label}
                        </p>
                        <p className="text-xs font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col justify-center md:w-1/2">
                <h1 className="mb-4 text-3xl leading-tight font-black tracking-tight uppercase md:text-4xl">
                  {data.hero.title}
                </h1>
                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                  {data.hero.description}
                </p>
                <div className="flex items-center gap-8">
                  <button className="rounded-xl bg-[#d4ff3f] px-6 py-3 text-sm font-black text-black transition-all hover:bg-[#c2f02b]">
                    {data.hero.buttonText}
                  </button>
                  <span className="text-2xl font-black">{data.hero.price}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="gap-0 rounded-[2rem] p-8">
            <CardHeader className="mb-6 flex flex-row items-start justify-between gap-4 border-0 p-0">
              <CardTitle className="text-lg font-bold">
                Customer Review
              </CardTitle>
              <div className="relative">
                <select className="appearance-none rounded-lg border border-border bg-background px-2 py-1 pr-6 text-[10px] font-bold text-muted-foreground">
                  <option>{data.review.period}</option>
                </select>
              </div>
            </CardHeader>

            <div className="mb-8 flex items-center gap-6">
              <span className="text-5xl font-black">{data.review.score}</span>
              <div>
                <div className="mb-1 flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-[#d4ff3f] text-[#d4ff3f]"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.review.basedOn}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {data.review.breakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-8 text-[10px] text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="w-6 text-[10px] text-muted-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>

            <CardFooter className="mt-8 justify-between border-t border-border px-0 pt-6 pb-0">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                {data.review.total}
              </p>
              <a
                href="#"
                className="text-xs font-bold text-muted-foreground underline hover:text-foreground"
              >
                See All
              </a>
            </CardFooter>
          </Card>
        </div>

        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Popular Product
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted transition-colors hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff3f] text-black transition-colors hover:bg-[#c2f02b]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {data.popularProducts.map((product) => (
              <ProductCard
                key={product.name}
                name={product.name}
                price={product.price}
                image={product.image}
                imageHover={product.imageHover}
                rating={product.rating}
                badge={product.isNew ? 'New' : undefined}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Most Selling Model
            </h2>
            <div className="relative">
              <select className="appearance-none rounded-lg border border-border bg-transparent px-3 py-1.5 pr-8 text-[10px] font-bold text-muted-foreground">
                <option>{data.topSelling.period}</option>
              </select>
            </div>
          </div>

          <Card className="mb-12 flex flex-col items-center gap-10 rounded-[2rem] p-10 lg:flex-row">
            <div className="flex-1">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4ff3f]">
                <Award className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-4 text-3xl font-black uppercase">
                {data.topSelling.title}
              </h3>
              <p className="mb-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {data.topSelling.description}
              </p>
              <button className="flex items-center gap-2 text-sm font-black tracking-widest text-[#d4ff3f] uppercase">
                {data.topSelling.buttonText}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 justify-center">
              <img
                src={data.topSelling.image}
                alt={data.topSelling.title}
                className="h-auto w-full max-w-[400px] rounded-3xl object-cover"
              />
            </div>
          </Card>
        </section>
      </main>
    </>
  )
}
