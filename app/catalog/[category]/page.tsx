import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CatalogContent } from "@/components/catalog-content"
import { getProducts, getProductsByTag, isShopifyConfigured, type Product } from "@/lib/shopify"

interface CatalogPageProps {
  params: Promise<{
    category: string
  }>
}

const categoryTitles: Record<string, string> = {
  all: "All Products",
  latest: "New Arrivals",
  men: "Men",
  women: "Women",
  kids: "Kids",
}

const categoryDescriptions: Record<string, string> = {
  all: "Explore our complete collection of premium fashion",
  latest: "Discover the newest additions to our collection",
  men: "Sophisticated styles for the modern gentleman",
  women: "Elegant pieces for every occasion",
  kids: "Comfortable and stylish fashion for children",
}

async function getProductsForCategory(category: string): Promise<Product[]> {
  if (!isShopifyConfigured()) {
    return []
  }

  try {
    if (category === "all") {
      return await getProducts(100)
    }

    if (category === "latest") {
      const allProducts = await getProducts(100)
      // Filter products created in last 30 days or tagged as 'new'
      return allProducts.filter(
        (p) =>
          p.tags.includes("new") ||
          new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      )
    }

    // For men, women, kids - try to get by tag first
    const taggedProducts = await getProductsByTag(category, 100)
    if (taggedProducts.length > 0) {
      return taggedProducts
    }

    // Fallback: filter all products by category
    const allProducts = await getProducts(100)
    return allProducts.filter((p) => p.category === category)
  } catch (error) {
    console.error("Error fetching products for category:", category, error)
    return []
  }
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { category } = await params
  const products = await getProductsForCategory(category)
  const isConfigured = isShopifyConfigured()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border/50 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h1 className="font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {categoryTitles[category] || "Shop"}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              {categoryDescriptions[category] || "Explore our collection"}
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {!isConfigured ? (
            <div className="py-16 text-center">
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8">
                <h3 className="text-lg font-medium text-foreground">Connect Your Shopify Store</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Add your Shopify Storefront API credentials to display products.
                  Set <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN</code> and{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> environment variables.
                </p>
              </div>
            </div>
          ) : (
            <Suspense fallback={<CatalogSkeleton />}>
              <CatalogContent 
                initialProducts={products} 
                category={category}
              />
            </Suspense>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
