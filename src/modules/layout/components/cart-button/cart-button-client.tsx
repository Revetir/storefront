"use client"

import { HttpTypes } from "@medusajs/types"
import CartDropdown from "../cart-dropdown"

interface CartButtonClientProps {
  cart?: HttpTypes.StoreCart | null
}

export default function CartButtonClient({ cart }: CartButtonClientProps) {
  return <CartDropdown cart={cart} />
}
