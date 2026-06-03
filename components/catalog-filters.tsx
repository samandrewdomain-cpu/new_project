"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { FilterState, SortOption } from "@/lib/products"

interface CatalogFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  availableSizes: string[]
  availableColors: string[]
  productCount: number
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
]

const priceRanges = [
  { label: "All Prices", value: [0, 1000] as [number, number] },
  { label: "Under $50", value: [0, 50] as [number, number] },
  { label: "$50 - $100", value: [50, 100] as [number, number] },
  { label: "$100 - $200", value: [100, 200] as [number, number] },
  { label: "$200 - $500", value: [200, 500] as [number, number] },
  { label: "Over $500", value: [500, 1000] as [number, number] },
]

export function CatalogFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  availableSizes,
  availableColors,
  productCount,
}: CatalogFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeFiltersCount = 
    filters.sizes.length + 
    filters.colors.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0)

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    onFiltersChange({ ...filters, sizes: newSizes })
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onFiltersChange({ ...filters, colors: newColors })
  }

  const handlePriceChange = (range: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: range })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      sizes: [],
      colors: [],
      priceRange: [0, 1000],
      tags: [],
    })
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-border/50 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      {children}
    </div>
  )

  const FiltersContent = () => (
    <div className="space-y-0">
      {/* Price Filter */}
      <FilterSection title="Price">
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePriceChange(range.value)}
              className={cn(
                "block w-full text-left text-sm transition-colors py-1",
                filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={cn(
                "min-w-[40px] border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.sizes.includes(size)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color Filter */}
      <FilterSection title="Color">
        <div className="space-y-2">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={cn(
                "flex w-full items-center gap-2 text-sm transition-colors py-1",
                filters.colors.includes(color)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border",
                  filters.colors.includes(color) ? "ring-2 ring-foreground ring-offset-2" : ""
                )}
                style={{
                  backgroundColor: color.toLowerCase() === "white" ? "#fff" :
                    color.toLowerCase() === "black" ? "#000" :
                    color.toLowerCase() === "navy" ? "#1a365d" :
                    color.toLowerCase() === "burgundy" ? "#722F37" :
                    color.toLowerCase() === "camel" ? "#C19A6B" :
                    color.toLowerCase() === "grey" || color.toLowerCase() === "gray" ? "#6B7280" :
                    color.toLowerCase() === "beige" ? "#F5F5DC" :
                    color.toLowerCase() === "ivory" ? "#FFFFF0" :
                    color.toLowerCase() === "charcoal" ? "#36454F" :
                    color.toLowerCase() === "olive" ? "#808000" :
                    color.toLowerCase() === "forest green" ? "#228B22" :
                    color.toLowerCase() === "blush" ? "#DE5D83" :
                    color.toLowerCase() === "red" ? "#DC2626" :
                    color.toLowerCase() === "green" ? "#16A34A" :
                    color.toLowerCase() === "light blue" ? "#93C5FD" :
                    color.toLowerCase() === "light wash" ? "#BFDBFE" :
                    color.toLowerCase() === "dark wash" ? "#1E3A5F" :
                    "#D1D5DB"
                }}
              />
              {color}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <div className="mb-8">
      {/* Desktop Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Price Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Price
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {priceRanges.map((range) => (
                  <DropdownMenuItem
                    key={range.label}
                    onClick={() => handlePriceChange(range.value)}
                    className={cn(
                      filters.priceRange[0] === range.value[0] && 
                      filters.priceRange[1] === range.value[1] && "font-medium"
                    )}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Size
                  {filters.sizes.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                      {filters.sizes.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <div className="p-2 flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={cn(
                        "min-w-[40px] border px-3 py-1.5 text-xs font-medium transition-colors",
                        filters.sizes.includes(size)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:border-foreground"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Color Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Color
                  {filters.colors.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                      {filters.colors.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
                {availableColors.map((color) => (
                  <DropdownMenuItem
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={cn("gap-2", filters.colors.includes(color) && "font-medium")}
                  >
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor: color.toLowerCase() === "white" ? "#fff" :
                          color.toLowerCase() === "black" ? "#000" :
                          color.toLowerCase() === "navy" ? "#1a365d" :
                          color.toLowerCase() === "burgundy" ? "#722F37" :
                          color.toLowerCase() === "camel" ? "#C19A6B" :
                          color.toLowerCase() === "grey" || color.toLowerCase() === "gray" ? "#6B7280" :
                          color.toLowerCase() === "beige" ? "#F5F5DC" :
                          "#D1D5DB"
                      }}
                    />
                    {color}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={cn(sortBy === option.value && "font-medium")}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.sizes.map((size) => (
            <button
              key={`size-${size}`}
              onClick={() => handleSizeToggle(size)}
              className="flex items-center gap-1 bg-secondary px-3 py-1 text-xs font-medium"
            >
              Size: {size}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.colors.map((color) => (
            <button
              key={`color-${color}`}
              onClick={() => handleColorToggle(color)}
              className="flex items-center gap-1 bg-secondary px-3 py-1 text-xs font-medium"
            >
              {color}
              <X className="h-3 w-3" />
            </button>
          ))}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <button
              onClick={() => handlePriceChange([0, 1000])}
              className="flex items-center gap-1 bg-secondary px-3 py-1 text-xs font-medium"
            >
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Mobile Filters Panel */}
      {mobileFiltersOpen && (
        <div className="mt-4 border-t border-border/50 pt-4 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FiltersContent />
        </div>
      )}
    </div>
  )
}
