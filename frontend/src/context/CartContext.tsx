import { createContext, useContext, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  collection: string
  name: string
  image: string
  price: number
  quantity: number
}

export type CartData = {
  shipping: number
  taxRate?: number
  items: CartItem[]
}

type CartContextValue = {
  isCartOpen: boolean
  shipping: number
  taxRate: number
  items: CartItem[]
  itemCount: number
  subtotal: number
  total: number
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  incrementQty: (id: string) => void
  decrementQty: (id: string) => void
  removeItem: (id: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

type CartProviderProps = {
  children: React.ReactNode
  initialData: CartData
}

export function CartProvider({ children, initialData }: CartProviderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>(initialData.items)

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )
  const taxRate = initialData.taxRate ?? 0.09
  const tax = subtotal * taxRate
  const total = subtotal + initialData.shipping + tax

  const addItem: CartContextValue['addItem'] = (item) => {
    const qty = item.quantity ?? 1
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i,
        )
      }
      return [
        ...prev,
        {
          id: item.id,
          collection: item.collection,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: qty,
        },
      ]
    })
  }

  const value: CartContextValue = {
    isCartOpen,
    shipping: initialData.shipping,
    taxRate,
    items,
    itemCount,
    subtotal,
    total,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addItem,
    incrementQty: (id) =>
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
      ),
    decrementQty: (id) =>
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
        ),
      ),
    removeItem: (id) => setItems((prev) => prev.filter((item) => item.id !== id)),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
