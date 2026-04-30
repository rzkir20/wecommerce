import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useCart } from '../../context/CartContext'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const shippingCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function CartModal() {
  const navigate = useNavigate()
  const {
    isCartOpen,
    closeCart,
    items,
    subtotal,
    shipping,
    taxRate,
    total,
    incrementQty,
    decrementQty,
    removeItem,
  } = useCart()

  const estimatedTax = subtotal * taxRate

  useEffect(() => {
    if (!isCartOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-70 flex justify-end bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close cart sheet"
        onClick={closeCart}
        className="h-full flex-1 cursor-default"
      />
      <div className="cart-modal-panel animate-cart-sheet-in flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
              Shopping Bag
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black text-muted-foreground">
              {items.length} ITEMS
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-8 py-4">
          {items.map((item) => (
            <article key={item.id} className="group flex gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                      {item.collection}
                    </p>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center overflow-hidden rounded-lg border border-border bg-muted">
                    <button
                      type="button"
                      onClick={() => decrementQty(item.id)}
                      className="h-8 w-8 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{String(item.quantity).padStart(2, '0')}</span>
                    <button
                      type="button"
                      onClick={() => incrementQty(item.id)}
                      className="h-8 w-8 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-lg font-black text-[#d4ff3f]">
                    {currency.format(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-6 border-t border-border bg-muted/30 p-8">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span>Subtotal</span>
              <span className="text-foreground">{currency.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span>Shipping</span>
              <span className="text-white">{shippingCurrency.format(shipping)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span>Est. Tax</span>
              <span className="text-foreground">{shippingCurrency.format(estimatedTax)}</span>
            </div>
            <div className="flex items-end justify-between border-t border-border pt-4">
              <span className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
                Total Amount
              </span>
              <span className="text-3xl font-black text-[#d4ff3f]">{shippingCurrency.format(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                closeCart()
                void navigate({ to: '/cart' })
              }}
              className="w-full rounded-2xl bg-primary py-5 text-xs font-black tracking-widest text-primary-foreground uppercase transition-all duration-300 hover:bg-[#d4ff3f] hover:text-black hover:shadow-[0_0_20px_rgba(212,255,63,0.3)]"
            >
              <span className="inline-flex items-center gap-2">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={closeCart}
              className="w-full rounded-2xl border border-border bg-muted py-5 text-xs font-black tracking-widest text-foreground uppercase transition-colors hover:bg-muted/80"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
