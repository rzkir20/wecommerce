import { createFileRoute } from '@tanstack/react-router'

import {
  ArrowLeft,
  HelpCircle,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

import { useCart } from '../../context/CartContext'

export const Route = createFileRoute('/(orders)/cart')({
  component: CartPage,
})

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function CartPage() {
  const { items, shipping, subtotal, taxRate, total, incrementQty, decrementQty, removeItem } =
    useCart()
  const tax = subtotal * taxRate

  return (
    <>
      <main className="custom-scrollbar space-y-8 overflow-y-auto p-10 pt-32 md:pt-40">
        <div className="flex flex-col gap-10 lg:flex-row">
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight uppercase">
                Your Shopping Bag
              </h1>
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {items.length} Items
              </span>
            </div>

            {items.map((item) => (
              <article
                key={item.id}
                className="glass-panel group flex flex-col items-center gap-6 rounded-[2rem] p-6 transition-all hover:border-foreground/15 sm:flex-row"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-muted p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-xs tracking-widest text-muted-foreground uppercase">
                        {item.collection}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-1">
                      <button
                        type="button"
                        onClick={() => decrementQty(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementQty(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#d4ff3f] transition-colors hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Subtotal
                      </p>
                      <span className="text-lg font-black">
                        {money.format(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="pt-4">
              <a
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-[#d4ff3f]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </a>
            </div>
          </section>

          <aside className="w-full lg:w-[400px]">
            <div className="glass-panel sticky top-32 rounded-[2.5rem] p-8 md:top-28">
              <h2 className="mb-8 text-xl font-black tracking-tight uppercase">
                Order Summary
              </h2>

              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{money.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shipping</span>
                  <div className="text-right">
                    <span className="block font-bold">
                      {money.format(shipping)}
                    </span>
                    <span className="text-[10px] font-bold tracking-tighter text-[#d4ff3f] uppercase">
                      Priority Express
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Tax</span>
                  <span className="font-bold">{money.format(tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-lg font-black uppercase">Total</span>
                  <span className="text-2xl font-black text-[#d4ff3f]">
                    {money.format(total)}
                  </span>
                </div>
              </div>

              <div className="relative mb-10">
                <input
                  type="text"
                  placeholder="Promo Code"
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-4 pr-16 text-sm focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-black text-[#d4ff3f] uppercase transition-colors hover:text-foreground"
                >
                  Apply
                </button>
              </div>

              <a
                href="/checkout"
                className="neon-glow flex w-full items-center justify-center gap-3 rounded-2xl bg-[#d4ff3f] py-4 font-black text-black transition-all hover:scale-[1.02] hover:bg-[#c2f02b] active:scale-[0.98]"
              >
                <span>Checkout Now</span>
                <ShieldCheck className="h-5 w-5" />
              </a>

              <p className="mt-6 text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Secure SSL Encrypted Checkout
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#d4ff3f]/10 bg-[#d4ff3f]/5 p-6">
              <HelpCircle className="h-6 w-6 text-[#d4ff3f]" />
              <div>
                <p className="text-sm font-bold">Need Assistance?</p>
                <p className="text-xs text-muted-foreground">
                  Speak with our luxury concierge 24/7.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
