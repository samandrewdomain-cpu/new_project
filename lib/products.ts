import { type Product } from "@/lib/shopify"

export type { Product } from "@/lib/shopify"

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc"

export interface FilterState {
  category?: string
  sizes: string[]
  colors: string[]
  priceRange: [number, number]
  tags: string[]
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    // Category filter
    if (filters.category && filters.category !== "all" && filters.category !== "latest") {
      if (product.category !== filters.category) return false
    }

    // Size filter
    if (filters.sizes.length > 0) {
      if (!filters.sizes.some((size) => product.sizes.includes(size))) return false
    }

    // Color filter
    if (filters.colors.length > 0) {
      if (!filters.colors.some((color) => product.colors.includes(color))) return false
    }

    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false
    }

    // Tags filter
    if (filters.tags.length > 0) {
      if (!filters.tags.some((tag) => product.tags.includes(tag))) return false
    }

    return true
  })
}

export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products]
  
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price)
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price)
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case "name-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sorted
  }
}

// Utility to get unique values from products
export function getUniqueValues<K extends keyof Product>(
  products: Product[],
  key: K
): Product[K] extends (infer U)[] ? U[] : Product[K][] {
  const values = products.flatMap((p) => p[key])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [...new Set(values)] as any
}
