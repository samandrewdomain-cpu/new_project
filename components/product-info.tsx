"use client"

import { useState, useMemo } from "react"
import { Loader2, ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import type { Product, ShopifyProductVariant } from "@/lib/shopify"

interface ProductInfoProps {
  product: Product
  variants: ShopifyProductVariant[]
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const { addToCart, isAddingToCart, redirectToCheckout } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [justAdded, setJustAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Extract unique option types and their values
  const optionTypes = useMemo(() => {
    const options: Record<string, Set<string>> = {}
    
    variants.forEach((variant) => {
      variant.selectedOptions.forEach((opt) => {
        if (!options[opt.name]) {
          options[opt.name] = new Set()
        }
        options[opt.name].add(opt.value)
      })
    })

    return Object.entries(options).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))
  }, [variants])

  // Find selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (Object.keys(selectedOptions).length !== optionTypes.length) {
      return null
    }

    return variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [variants, selectedOptions, optionTypes.length])

  // Check if a specific option value is available (has at least one variant in stock)
  const isOptionAvailable = (optionName: string, optionValue: string) => {
    return variants.some((variant) => {
      const hasOption = variant.selectedOptions.some(
        (opt) => opt.name === optionName && opt.value === optionValue
      )
      if (!hasOption) return false

      // Check if other selected options are compatible
      const otherSelectedOptions = Object.entries(selectedOptions).filter(
        ([name]) => name !== optionName
      )
      
      if (otherSelectedOptions.length === 0) {
        return variant.availableForSale
      }

      return (
        variant.availableForSale &&
        otherSelectedOptions.every(([name, value]) =>
          variant.selectedOptions.some(
            (opt) => opt.name === name && opt.value === value
          )
        )
      )
    })
  }

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return

    try {
      await addToCart(selectedVariant.id, quantity)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) return

    try {
      await addToCart(selectedVariant.id, quantity)
      redirectToCheckout()
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  // Determine the displayed price
  const displayPrice = selectedVariant
    ? parseFloat(selectedVariant.price.amount)
    : product.price

  const displayComparePrice = selectedVariant?.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice.amount)
    : product.compareAtPrice

  const hasDiscount = displayComparePrice && displayComparePrice > displayPrice
  const discountPercentage = hasDiscount
    ? Math.round((1 - displayPrice / displayComparePrice!) * 100)
    : 0

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currencyCode || "USD",
    }).format(amount)
  }

  const isOutOfStock = selectedVariant && !selectedVariant.availableForSale
  const canAddToCart = selectedVariant && selectedVariant.availableForSale

  return (
    <div className="flex flex-col">
      {/* Product Title & Price */}
      <div>
        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
        <h1 className="mt-2 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl text-balance">
          {product.title}
        </h1>
        
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-medium text-foreground">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(displayComparePrice!)}
              </span>
              <span className="bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-6 text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Variant Options */}
      {optionTypes.map((option) => (
        <div key={option.name} className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="ml-2 font-normal text-muted-foreground">
                  : {selectedOptions[option.name]}
                </span>
              )}
            </h3>
            {option.name.toLowerCase() === "size" && (
              <button className="text-xs text-muted-foreground underline hover:text-foreground transition-colors">
                Size Guide
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value
              const isAvailable = isOptionAvailable(option.name, value)
              const isColor = option.name.toLowerCase() === "color"

              return (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(option.name, value)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative min-w-[48px] border px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : isAvailable
                      ? "border-border bg-background text-foreground hover:border-foreground"
                      : "border-border bg-background text-muted-foreground/50 cursor-not-allowed",
                    !isAvailable && "after:absolute after:inset-0 after:bg-background/50"
                  )}
                >
                  {isColor && (
                    <span
                      className={cn(
                        "mr-2 inline-block h-3 w-3 rounded-full border",
                        isSelected ? "border-background" : "border-border"
                      )}
                      style={{ backgroundColor: getColorHex(value) }}
                    />
                  )}
                  {value}
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-px w-full rotate-[-20deg] bg-muted-foreground/30" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Quantity Selector */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-foreground">Quantity</h3>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center border border-border text-foreground hover:border-foreground transition-colors"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center border border-border text-foreground hover:border-foreground transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-3">
        {!selectedVariant && optionTypes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Please select {optionTypes.map((o) => o.name.toLowerCase()).join(" and ")}
          </p>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAddingToCart}
          size="lg"
          variant="outline"
          className="w-full"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : justAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added to Cart
            </>
          ) : isOutOfStock ? (
            "Sold Out"
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={!canAddToCart || isAddingToCart}
          size="lg"
          className="w-full"
        >
          Buy Now
        </Button>
        
        {isOutOfStock && (
          <p className="text-center text-sm text-muted-foreground">
            This variant is currently out of stock
          </p>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-8 border-t border-border pt-8">
        <h3 className="text-sm font-medium text-foreground">Details</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Vendor: {product.vendor}</li>
          {product.tags.length > 0 && (
            <li>
              Tags:{" "}
              {product.tags.slice(0, 5).map((tag, i) => (
                <span key={tag}>
                  {tag}
                  {i < Math.min(product.tags.length, 5) - 1 && ", "}
                </span>
              ))}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    white: "#FFFFFF",
    black: "#000000",
    navy: "#1a365d",
    burgundy: "#722F37",
    camel: "#C19A6B",
    grey: "#6B7280",
    gray: "#6B7280",
    beige: "#F5F5DC",
    ivory: "#FFFFF0",
    charcoal: "#36454F",
    olive: "#808000",
    "forest green": "#228B22",
    blush: "#DE5D83",
    red: "#DC2626",
    green: "#16A34A",
    blue: "#2563EB",
    pink: "#EC4899",
    yellow: "#EAB308",
    orange: "#F97316",
    purple: "#9333EA",
    brown: "#78350F",
    cream: "#FFFDD0",
    tan: "#D2B48C",
    "light blue": "#93C5FD",
    "light wash": "#BFDBFE",
    "dark wash": "#1E3A5F",
  }

  return colorMap[color.toLowerCase()] || "#D1D5DB"
}
