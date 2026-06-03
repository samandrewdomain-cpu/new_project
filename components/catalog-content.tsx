"use client"

import { useMemo, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CatalogFilters } from "@/components/catalog-filters"
import {
  filterProducts,
  sortProducts,
  getUniqueValues,
  type FilterState,
  type SortOption,
  type Product,
} from "@/lib/products"

interface CatalogContentProps {
  initialProducts: Product[]
  category: string
}

export function CatalogContent({ initialProducts, category }: CatalogContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filters, setFilters] = useState<FilterState>({
    category: category,
    sizes: [],
    colors: [],
    priceRange: [0, 1000],
    tags: [],
  })

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(initialProducts, {
      ...filters,
      category: undefined, // Already filtered by category on server
    })
    return sortProducts(filtered, sortBy)
  }, [initialProducts, filters, sortBy])

  // Get available filter options from products
  const availableSizes = useMemo(
    () => getUniqueValues(initialProducts, "sizes"),
    [initialProducts]
  )
  const availableColors = useMemo(
    () => getUniqueValues(initialProducts, "colors"),
    [initialProducts]
  )

  return (
    <>
      <CatalogFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableSizes={availableSizes}
        availableColors={availableColors}
        productCount={filteredProducts.length}
      />

      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No products found matching your criteria.
          </p>
          <button
            onClick={() =>
              setFilters({
                category: filters.category,
                sizes: [],
                colors: [],
                priceRange: [0, 1000],
                tags: [],
              })
            }
            className="mt-4 text-sm font-medium text-foreground underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}
