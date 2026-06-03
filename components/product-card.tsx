"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { Product } from "@/lib/shopify"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0

  // Format price with currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currencyCode || "USD",
    }).format(amount)
  }

  const isNew = product.tags.includes("new") || 
    (new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000)

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {imageError || !product.images[0] ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="text-center">
              <div className="text-4xl font-serif text-muted-foreground/30">
                {product.title.charAt(0)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Image coming soon</p>
            </div>
          </div>
        ) : (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-foreground px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-background">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-brand-red px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
              -{discountPercentage}%
            </span>
          )}
          {!product.availableForSale && (
            <span className="bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick add - appears on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-foreground/90 p-3 text-center transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <span className="text-xs font-medium uppercase tracking-wider text-background">
            Quick View
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:underline line-clamp-1">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
