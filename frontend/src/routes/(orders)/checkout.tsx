import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useState } from 'react'

import { useCart } from '../../context/CartContext'

import dashboardData from '../../data/data.json'

export const Route = createFileRoute('/(orders)/checkout')({
  head: () => ({
    meta: [{ title: 'Checkout | LUXE Premium' }],
  }),
  component: CheckoutPage,
})

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const checkoutConfig = dashboardData.checkout

function CheckoutPage() {
  const { items, subtotal, shipping, taxRate, total } = useCart()
  const tax = subtotal * taxRate
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)

  if (items.length === 0) {
    return (
      <>
        <main className="custom-scrollbar px-10 pt-32 pb-20 md:pt-40">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="mb-4 text-2xl font-black tracking-tight uppercase">
              Your bag is empty
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
              Add items before completing secure checkout.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/cart"
                className="rounded-2xl border border-border px-6 py-3 text-sm font-bold transition-colors hover:bg-muted"
              >
                Back to cart
              </Link>
              <Link
                to="/products"
                className="rounded-2xl bg-[#d4ff3f] px-6 py-3 text-sm font-black text-black transition-colors hover:bg-[#c2f02b]"
              >
                Browse products
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="custom-scrollbar px-10 pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <Link
              to="/cart"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Back to cart"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              Secure Checkout
            </h1>
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <div className="glass-panel rounded-[2rem] p-8">
                <h2 className="mb-8 text-lg font-bold tracking-tight uppercase">
                  Order Summary
                </h2>

                <div className="mb-10 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <h3 className="text-sm font-bold">{item.name}</h3>
                          <span className="shrink-0 text-sm font-bold">
                            {money.format(item.price * item.quantity)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.collection}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {money.format(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {money.format(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="font-medium">{money.format(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-4 text-lg font-black text-[#d4ff3f]">
                    <span>Total</span>
                    <span>{money.format(total)}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel flex items-center gap-4 rounded-2xl p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-[#d4ff3f]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-widest uppercase">
                    {checkoutConfig.securePurchase.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {checkoutConfig.securePurchase.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 lg:col-span-3">
              <div className="glass-panel rounded-[2rem] p-8">
                <h2 className="mb-8 flex items-center gap-3 text-lg font-bold tracking-tight uppercase">
                  <Truck className="h-5 w-5 text-[#d4ff3f]" />
                  Shipping Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your name"
                      className="input-premium"
                      autoComplete="name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      className="input-premium"
                      autoComplete="email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Luxury Ave"
                      className="input-premium"
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Seoul"
                      className="input-premium"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        placeholder="Gangnam"
                        className="input-premium"
                        autoComplete="address-level1"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        placeholder="06000"
                        className="input-premium"
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        className="input-premium appearance-none pr-10"
                        defaultValue={checkoutConfig.countries[0]}
                      >
                        {checkoutConfig.countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <form
                className="glass-panel rounded-[2rem] p-8"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <h2 className="mb-8 flex items-center gap-3 text-lg font-bold tracking-tight uppercase">
                  <CreditCard className="h-5 w-5 text-[#d4ff3f]" />
                  Payment Method
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-xl border border-[#d4ff3f]/30 bg-muted/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-6 w-10 items-center justify-center rounded bg-white">
                        <span className="text-[10px] font-black tracking-tighter text-blue-800">
                          VISA
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        Credit or Debit Card
                      </span>
                    </div>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#d4ff3f]">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#d4ff3f]" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          className="input-premium pl-12"
                          autoComplete="cc-number"
                        />
                        <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM / YY"
                          className="input-premium"
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          CVV
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="***"
                          className="input-premium"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="group mt-6 flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) =>
                        setBillingSameAsShipping(e.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span
                      className={[
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all',
                        billingSameAsShipping
                          ? 'border-[#d4ff3f] bg-muted'
                          : 'border-border bg-muted group-hover:border-[#d4ff3f]/50',
                      ].join(' ')}
                    >
                      {billingSameAsShipping ? (
                        <Check
                          className="h-3 w-3 text-[#d4ff3f]"
                          strokeWidth={3}
                        />
                      ) : null}
                    </span>
                    <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                      Billing address is the same as shipping
                    </span>
                  </label>

                  <div className="pt-10">
                    <button
                      type="submit"
                      className="checkout-btn w-full rounded-2xl py-5 text-center text-lg font-black tracking-widest text-black uppercase"
                    >
                      Place Order & Pay {money.format(total)}
                    </button>
                    <p className="mt-4 text-center text-[10px] text-muted-foreground">
                      By clicking &quot;Place Order&quot;, you agree to our
                      Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
