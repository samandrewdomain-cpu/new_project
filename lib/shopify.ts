const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!

const endpoint = `https://${domain}/api/2024-01/graphql.json`

// Types for Shopify Storefront API responses
export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
  selectedOptions: {
    name: string
    value: string
  }[]
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  availableForSale: boolean
  createdAt: string
  updatedAt: string
  images: {
    edges: {
      node: ShopifyImage
    }[]
  }
  variants: {
    edges: {
      node: ShopifyProductVariant
    }[]
  }
  priceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
  compareAtPriceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
}

export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  products: {
    edges: {
      node: ShopifyProduct
    }[]
  }
}

// Normalized product type for the frontend
export interface Product {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  currencyCode: string
  images: string[]
  category: string
  tags: string[]
  sizes: string[]
  colors: string[]
  createdAt: string
  vendor: string
  availableForSale: boolean
}

// GraphQL query helper
async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  tags,
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
  tags?: string[]
}): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      ...(tags && { next: { tags } }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()

    if (json.errors) {
      console.error("Shopify GraphQL errors:", json.errors)
      throw new Error(json.errors[0]?.message || "Unknown Shopify error")
    }

    return json.data
  } catch (error) {
    console.error("Shopify fetch error:", error)
    throw error
  }
}

// Transform Shopify product to normalized Product type
function normalizeProduct(shopifyProduct: ShopifyProduct): Product {
  const images = shopifyProduct.images.edges.map((edge) => edge.node.url)
  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)
  const compareAtPrice = shopifyProduct.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(shopifyProduct.compareAtPriceRange.minVariantPrice.amount)
    : undefined

  // Extract sizes and colors from variants
  const sizes: string[] = []
  const colors: string[] = []

  shopifyProduct.variants.edges.forEach((edge) => {
    edge.node.selectedOptions.forEach((option) => {
      if (option.name.toLowerCase() === "size" && !sizes.includes(option.value)) {
        sizes.push(option.value)
      }
      if (option.name.toLowerCase() === "color" && !colors.includes(option.value)) {
        colors.push(option.value)
      }
    })
  })

  // Determine category from product type or tags
  let category = shopifyProduct.productType?.toLowerCase() || "all"
  const categoryTags = ["men", "women", "kids", "unisex"]
  const foundCategory = shopifyProduct.tags.find((tag) =>
    categoryTags.includes(tag.toLowerCase())
  )
  if (foundCategory) {
    category = foundCategory.toLowerCase()
  }

  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    description: shopifyProduct.description,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
    currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode,
    images,
    category,
    tags: shopifyProduct.tags.map((t) => t.toLowerCase()),
    sizes,
    colors,
    createdAt: shopifyProduct.createdAt,
    vendor: shopifyProduct.vendor,
    availableForSale: shopifyProduct.availableForSale,
  }
}

// Product fragment for reuse
const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    createdAt
    updatedAt
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`

// Get all products
export async function getProducts(limit: number = 50): Promise<Product[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query,
    variables: { first: limit },
    tags: ["products"],
  })

  return data.products.edges.map((edge) => normalizeProduct(edge.node))
}

// Get products by collection handle
export async function getProductsByCollection(
  collectionHandle: string,
  limit: number = 50
): Promise<Product[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductsByCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    collection: { products: { edges: { node: ShopifyProduct }[] } } | null
  }>({
    query,
    variables: { handle: collectionHandle, first: limit },
    tags: ["products", `collection-${collectionHandle}`],
  })

  if (!data.collection) {
    return []
  }

  return data.collection.products.edges.map((edge) => normalizeProduct(edge.node))
}

// Get products by tag (useful for categories like men, women, kids)
export async function getProductsByTag(
  tag: string,
  limit: number = 50
): Promise<Product[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductsByTag($query: String!, $first: Int!) {
      products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query,
    variables: { query: `tag:${tag}`, first: limit },
    tags: ["products", `tag-${tag}`],
  })

  return data.products.edges.map((edge) => normalizeProduct(edge.node))
}

// Get single product by handle
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
  `

  const data = await shopifyFetch<{
    product: ShopifyProduct | null
  }>({
    query,
    variables: { handle },
    tags: ["products", `product-${handle}`],
  })

  if (!data.product) {
    return null
  }

  return normalizeProduct(data.product)
}

// Get featured/new products
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetFeaturedProducts($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query,
    variables: { first: limit },
    tags: ["products", "featured"],
  })

  return data.products.edges.map((edge) => normalizeProduct(edge.node))
}

// Search products
export async function searchProducts(
  searchTerm: string,
  limit: number = 20
): Promise<Product[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query,
    variables: { query: searchTerm, first: limit },
    cache: "no-store",
  })

  return data.products.edges.map((edge) => normalizeProduct(edge.node))
}

// Get all collections
export async function getCollections(): Promise<
  { handle: string; title: string; description: string }[]
> {
  const query = `
    query GetCollections {
      collections(first: 20) {
        edges {
          node {
            id
            handle
            title
            description
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    collections: {
      edges: { node: { handle: string; title: string; description: string } }[]
    }
  }>({
    query,
    tags: ["collections"],
  })

  return data.collections.edges.map((edge) => edge.node)
}

// Utility: check if Shopify is configured
export function isShopifyConfigured(): boolean {
  return Boolean(domain && storefrontAccessToken)
}

// ============================================
// CART & CHECKOUT FUNCTIONS
// ============================================

export interface CartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      title: string
      handle: string
    }
    image: ShopifyImage | null
    price: ShopifyPrice
    selectedOptions: {
      name: string
      value: string
    }[]
  }
}

export interface Cart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: ShopifyPrice
    subtotalAmount: ShopifyPrice
  }
  lines: {
    edges: {
      node: CartLine
    }[]
  }
}

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
              }
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`

// Create a new cart
export async function createCart(): Promise<Cart> {
  const query = `
    ${CART_FRAGMENT}
    mutation CreateCart {
      cartCreate {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartCreate: {
      cart: Cart
      userErrors: { field: string; message: string }[]
    }
  }>({
    query,
    cache: "no-store",
  })

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message)
  }

  return data.cartCreate.cart
}

// Add item to cart
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<Cart> {
  const query = `
    ${CART_FRAGMENT}
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: Cart
      userErrors: { field: string; message: string }[]
    }
  }>({
    query,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
    cache: "no-store",
  })

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message)
  }

  return data.cartLinesAdd.cart
}

// Get cart by ID
export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFragment
      }
    }
  `

  const data = await shopifyFetch<{
    cart: Cart | null
  }>({
    query,
    variables: { cartId },
    cache: "no-store",
  })

  return data.cart
}

// Update cart line quantity
export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const query = `
    ${CART_FRAGMENT}
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesUpdate: {
      cart: Cart
      userErrors: { field: string; message: string }[]
    }
  }>({
    query,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
    cache: "no-store",
  })

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message)
  }

  return data.cartLinesUpdate.cart
}

// Remove item from cart
export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<Cart> {
  const query = `
    ${CART_FRAGMENT}
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesRemove: {
      cart: Cart
      userErrors: { field: string; message: string }[]
    }
  }>({
    query,
    variables: {
      cartId,
      lineIds: [lineId],
    },
    cache: "no-store",
  })

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message)
  }

  return data.cartLinesRemove.cart
}

// Get product with full variant details (for product page)
export async function getProductWithVariants(handle: string): Promise<{
  product: Product
  variants: ShopifyProductVariant[]
} | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductWithVariants($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
  `

  const data = await shopifyFetch<{
    product: ShopifyProduct | null
  }>({
    query,
    variables: { handle },
    tags: ["products", `product-${handle}`],
  })

  if (!data.product) {
    return null
  }

  return {
    product: normalizeProduct(data.product),
    variants: data.product.variants.edges.map((e) => e.node),
  }
}
