import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { getProducts, getFeaturedProducts, isShopifyConfigured } from "@/lib/shopify"

const categories = [
  {
    name: "Men",
    href: "/catalog/men",
    image: "/images/hero-men.jpg",
    description: "Refined essentials"
  },
  {
    name: "Women",
    href: "/catalog/women",
    image: "/images/hero-women.jpg",
    description: "Timeless elegance"
  },
  {
    name: "Kids",
    href: "/catalog/kids",
    image: "/images/hero-kids.jpg",
    description: "Playful comfort"
  },
]

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let newArrivals: Awaited<ReturnType<typeof getProducts>> = []
  let isConfigured = false

  try {
    isConfigured = isShopifyConfigured()
    
    if (isConfigured) {
      // Fetch products from Shopify
      const allProducts = await getProducts(50)
      
      // Get featured products (first 4)
      featuredProducts = allProducts.slice(0, 4)
      
      // Get new arrivals (products created in last 30 days or tagged as 'new')
      newArrivals = allProducts
        .filter((p) => 
          p.tags.includes("new") || 
          new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        )
        .slice(0, 4)
      
      // If no "new" products, just show recent ones
      if (newArrivals.length === 0) {
        newArrivals = allProducts.slice(0, 4)
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="max-w-xl">
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  New Season
                </p>
                <h1 className="mt-4 font-serif text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
                  Discover timeless elegance
                </h1>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Curated collections designed for the modern individual. 
                  Experience fashion that transcends trends.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="group">
                    <Link href="/catalog/latest">
                      Shop New Arrivals
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/catalog/all">
                      View All
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative aspect-[4/5] lg:aspect-[3/4]">
                <Image
                  src="/images/hero-women.jpg"
                  alt="Featured collection"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-muted-foreground">
              Explore our curated collections for everyone
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    {category.description}
                  </p>
                  <h3 className="mt-2 text-2xl font-serif">{category.name}</h3>
                  <span className="mt-4 inline-flex items-center text-sm font-medium">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Shopify Connection Notice */}
        {!isConfigured && (
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <h3 className="text-lg font-medium text-foreground">Connect Your Shopify Store</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Add your Shopify Storefront API credentials to display products from your store.
                Set <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN</code> and{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> environment variables.
              </p>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                    Featured
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Handpicked pieces from our latest collection
                  </p>
                </div>
                <Link
                  href="/catalog/all"
                  className="hidden md:inline-flex items-center text-sm font-medium text-foreground hover:underline"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Button asChild variant="outline">
                  <Link href="/catalog/all">
                    View All Products
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                  New Arrivals
                </h2>
                <p className="mt-4 text-muted-foreground">
                  The latest additions to our collection
                </p>
              </div>
              <Link
                href="/catalog/latest"
                className="hidden md:inline-flex items-center text-sm font-medium text-foreground hover:underline"
              >
                Shop New
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Button asChild variant="outline">
                <Link href="/catalog/latest">
                  Shop New Arrivals
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Brand Story Banner */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
                Crafted with Purpose
              </h2>
              <p className="mt-6 text-lg text-background/70 leading-relaxed">
                At ADONIS, we believe in creating fashion that stands the test of time. 
                Each piece is thoughtfully designed with premium materials and meticulous 
                attention to detail, ensuring both style and sustainability.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-8 border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground">
                <Link href="/about">
                  Our Story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Join the ADONIS Community
            </h2>
            <p className="mt-4 text-muted-foreground">
              Subscribe to receive updates on new arrivals, exclusive offers, and style inspiration.
            </p>
            <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                required
              />
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
