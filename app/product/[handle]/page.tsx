import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { getProductWithVariants, getProducts, isShopifyConfigured } from "@/lib/shopify"
import { ProductGallery } from "@/components/product-gallery"
import { ProductInfo } from "@/components/product-info"

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params
  
  if (!isShopifyConfigured()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-serif">Product Not Available</h1>
            <p className="mt-2 text-muted-foreground">
              Connect your Shopify store to view products.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const data = await getProductWithVariants(handle)

  if (!data) {
    notFound()
  }

  const { product, variants } = data

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/catalog/all"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Product Images */}
            <ProductGallery images={product.images} title={product.title} />

            {/* Product Info */}
            <ProductInfo product={product} variants={variants} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Generate static params for known products
export async function generateStaticParams() {
  if (!isShopifyConfigured()) {
    return []
  }

  try {
    const products = await getProducts(100)
    return products.map((product) => ({
      handle: product.handle,
    }))
  } catch {
    return []
  }
}
