"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"

const categories = [
  { name: "Latest", href: "/catalog/latest" },
  { name: "Men", href: "/catalog/men" },
  { name: "Women", href: "/catalog/women" },
  { name: "Kids", href: "/catalog/kids" },
  { name: "All", href: "/catalog/all" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cart, redirectToCheckout } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Top bar - Auth links */}
      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-end gap-6">
            <Link 
              href="/about" 
              className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link 
              href="/signin" 
              className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between relative">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt="ADONIS Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground relative group"
                >
                  {category.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-foreground transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right side - Search, Cart, Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => cart?.totalQuantity && redirectToCheckout()}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {(cart?.totalQuantity ?? 0) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                    {cart?.totalQuantity}
                  </span>
                )}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <nav className="border-t border-border/50 bg-background px-4 py-4">
            <div className="flex flex-col gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium tracking-wide text-foreground/80 transition-colors hover:text-foreground py-2"
                >
                  {category.name}
                </Link>
              ))}
              <div className="border-t border-border/50 pt-4 mt-2">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
