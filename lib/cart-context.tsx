"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  createCart,
  addToCart as addToCartAPI,
  getCart,
  updateCartLine,
  removeFromCart as removeFromCartAPI,
  type Cart,
} from "./shopify"

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  isAddingToCart: boolean
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeFromCart: (lineId: string) => Promise<void>
  redirectToCheckout: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_ID_KEY = "adonis-cart-id"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Initialize cart on mount
  useEffect(() => {
    async function initCart() {
      try {
        const storedCartId = localStorage.getItem(CART_ID_KEY)

        if (storedCartId) {
          const existingCart = await getCart(storedCartId)
          if (existingCart) {
            setCart(existingCart)
            setIsLoading(false)
            return
          }
        }

        // Create new cart if none exists
        const newCart = await createCart()
        localStorage.setItem(CART_ID_KEY, newCart.id)
        setCart(newCart)
      } catch (error) {
        console.error("Failed to initialize cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initCart()
  }, [])

  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1) => {
      if (!cart) return

      setIsAddingToCart(true)
      try {
        const updatedCart = await addToCartAPI(cart.id, variantId, quantity)
        setCart(updatedCart)
      } catch (error) {
        console.error("Failed to add to cart:", error)
        throw error
      } finally {
        setIsAddingToCart(false)
      }
    },
    [cart]
  )

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return

      try {
        const updatedCart = await updateCartLine(cart.id, lineId, quantity)
        setCart(updatedCart)
      } catch (error) {
        console.error("Failed to update cart:", error)
        throw error
      }
    },
    [cart]
  )

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cart) return

      try {
        const updatedCart = await removeFromCartAPI(cart.id, lineId)
        setCart(updatedCart)
      } catch (error) {
        console.error("Failed to remove from cart:", error)
        throw error
      }
    },
    [cart]
  )

  const redirectToCheckout = useCallback(() => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl
    }
  }, [cart])

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isAddingToCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        redirectToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
