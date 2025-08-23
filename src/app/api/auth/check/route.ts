import { retrieveCustomer } from "@lib/data/customer"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const customer = await retrieveCustomer()
    return NextResponse.json({ 
      isAuthenticated: !!customer,
      customer: customer ? { id: customer.id, email: customer.email } : null
    })
  } catch (error) {
    return NextResponse.json({ 
      isAuthenticated: false,
      customer: null
    })
  }
} 