"use client"

import { Suspense, useState } from "react"
import { StoreRegion, HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButtonClient from "@modules/layout/components/cart-button/cart-button-client"
import SearchModal from "@modules/search/components/modal"
import Menu from "@modules/common/icons/menu"
import User from "@modules/common/icons/user"
import MobileSidePanel from "@modules/layout/components/mobile-side-panel"
import { Category } from "@lib/data/categories"
import Image from "next/image"

interface NavClientProps {
  regions: StoreRegion[]
  customer: any
  categories: Category[]
  cart?: HttpTypes.StoreCart | null
}

export default function NavClient({ regions, customer, categories, cart }: NavClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-transparent">
        <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16 w-full relative">
          {/* Left Section - Mobile Menu Button */}
          <div className="flex items-center gap-x-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            <SearchModal />
          </div>

          {/* Left Section - Desktop Navigation */}
          <div className="hidden md:flex items-center gap-x-8 text-xs uppercase text-gray-700">
            <LocalizedClientLink href="/men" className="hover:text-black">
              Menswear
            </LocalizedClientLink>
            <LocalizedClientLink href="/women" className="hover:text-black">
              Womenswear
            </LocalizedClientLink>
            
            <SearchModal />
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <LocalizedClientLink href="/" className="block">
              <Image
                src="/images/logo.svg"
                alt="REVETIR"
                width={120}
                height={24}
                className="h-6 w-auto"
                priority
              />
            </LocalizedClientLink>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-x-8 text-xs uppercase text-gray-700">
            <div className="relative group">
              <button className="hover:text-black cursor-pointer">ENGLISH</button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-26 bg-white border border-gray-200 !rounded-none shadow-lg z-50 flex flex-col items-center text-xs text-gray-400 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-200">
                <span className="py-2 px-4 text-center cursor-not-allowed select-none w-full">Français</span>
                <span className="py-2 px-4 text-center cursor-not-allowed select-none w-full">中文</span>
              </div>
            </div>

            <LocalizedClientLink href="/account" className="hover:text-black">
              {customer ? "Account" : "Login"}
            </LocalizedClientLink>

            <CartButtonClient cart={cart} />
          </div>

          {/* Right Section - Mobile Icons */}
          <div className="flex md:hidden items-center gap-x-4">
            <LocalizedClientLink href="/account" className="p-2 hover:bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-700" />
            </LocalizedClientLink>

            <CartButtonClient cart={cart} />
          </div>
        </nav>
      </header>

      {/* Mobile Side Panel */}
      <MobileSidePanel
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />
    </>
  )
}
