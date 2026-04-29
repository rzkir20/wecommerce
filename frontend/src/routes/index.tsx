import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Award, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import { Header } from '../components/layout/header'
import { Sidebar } from '../components/layout/sidebar'
import dashboardData from '../data/data.json'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const data = dashboardData

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Sidebar items={data.sidebar.items} activeItem={data.sidebar.activeItem} />
      <div className="min-w-0 flex-1">
        <Header {...data.header} />

        <main className="ml-[250px] space-y-8 overflow-y-auto p-10 pt-28">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="glass-panel rounded-[2rem] p-10 lg:col-span-2">
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
                        <div key={stat.label} className="stat-badge min-w-[100px] rounded-xl p-3 text-center">
                          <p className="mb-1 text-[9px] font-black tracking-widest text-zinc-500 uppercase">
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
                  <p className="mb-8 text-sm leading-relaxed text-zinc-400">{data.hero.description}</p>
                  <div className="flex items-center gap-8">
                    <button className="rounded-xl bg-[#d4ff3f] px-6 py-3 text-sm font-black text-black transition-all hover:bg-[#c2f02b]">
                      {data.hero.buttonText}
                    </button>
                    <span className="text-2xl font-black">{data.hero.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-8">
              <div className="mb-6 flex items-start justify-between">
                <h3 className="text-lg font-bold">Customer Review</h3>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-white/10 bg-[#09090b] px-2 py-1 pr-6 text-[10px] font-bold text-zinc-400">
                    <option>{data.review.period}</option>
                  </select>
                </div>
              </div>

              <div className="mb-8 flex items-center gap-6">
                <span className="text-5xl font-black">{data.review.score}</span>
                <div>
                  <div className="mb-1 flex gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-[#d4ff3f] text-[#d4ff3f]" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">{data.review.basedOn}</p>
                </div>
              </div>

              <div className="space-y-3">
                {data.review.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-8 text-[10px] text-zinc-400">{item.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full bg-indigo-500" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="w-6 text-[10px] text-zinc-400">{item.value}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <p className="text-xs font-bold text-zinc-400 uppercase">{data.review.total}</p>
                <a href="#" className="text-xs font-bold text-zinc-400 underline hover:text-white">
                  See All
                </a>
              </div>
            </div>
          </div>

          <section>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight uppercase">Popular Product</h2>
              <div className="flex items-center gap-2 text-zinc-500">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 transition-colors hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff3f] text-black transition-colors hover:bg-[#c2f02b]">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {data.popularProducts.map((product) => (
                <article
                  key={product.name}
                  className="glass-panel group cursor-pointer rounded-[1.5rem] p-6 transition-all hover:border-zinc-700"
                >
                  <div className="relative mb-4 flex aspect-square items-center justify-center rounded-[1rem] bg-[#09090b] p-6">
                    {product.isNew ? (
                      <span className="absolute top-3 left-3 rounded bg-red-500/80 px-2 py-0.5 text-[8px] font-black text-white">
                        New
                      </span>
                    ) : null}
                    <button className="absolute top-3 right-3 text-zinc-500 transition-colors hover:text-red-400">
                      <Heart className="h-4 w-4" />
                    </button>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-zinc-400">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black">{product.price}</span>
                    <div className="flex gap-0.5">
                      {[...Array(product.rating)].map((_, idx) => (
                        <Star key={idx} className="h-3 w-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight uppercase">Most Selling Model</h2>
              <div className="relative">
                <select className="appearance-none rounded-lg border border-white/10 bg-transparent px-3 py-1.5 pr-8 text-[10px] font-bold text-zinc-400">
                  <option>{data.topSelling.period}</option>
                </select>
              </div>
            </div>

            <div className="glass-panel mb-12 flex flex-col items-center gap-10 rounded-[2rem] p-10 lg:flex-row">
              <div className="flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4ff3f]">
                  <Award className="h-8 w-8 text-black" />
                </div>
                <h3 className="mb-4 text-3xl font-black uppercase">{data.topSelling.title}</h3>
                <p className="mb-8 max-w-lg text-sm leading-relaxed text-zinc-500">{data.topSelling.description}</p>
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
            </div>
          </section>
        </main>
      </div>

      <footer className="ml-[250px] border-t border-white/5 bg-zinc-950 px-8 pt-20 pb-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff3f] text-sm font-black text-black">
                  L
                </div>
                <span className="text-xl font-extrabold tracking-tighter uppercase">LUXE</span>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-500">{data.footer.description}</p>
            </div>

            <div>
              <h4 className="mb-6 text-sm font-bold tracking-widest uppercase">Collections</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                {data.footer.collections.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition-colors hover:text-[#d4ff3f]">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-sm font-bold tracking-widest uppercase">Company</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                {data.footer.company.map((item) => (
                  <li key={item}>
                    <a href="#" className="transition-colors hover:text-[#d4ff3f]">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-sm font-bold tracking-widest uppercase">Newsletter</h4>
              <p className="mb-4 text-sm text-zinc-500">Subscribe to get early access.</p>
              <form className="relative">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold text-[#d4ff3f] uppercase"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 md:flex-row">
            <p className="text-xs text-zinc-600">{data.footer.copyright}</p>
            <div className="flex gap-8">
              {data.footer.legal.map((item) => (
                <a key={item} href="#" className="text-xs text-zinc-600 hover:text-zinc-400">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
