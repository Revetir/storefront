import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default function OverviewTemplate() {
  // Redirect the legacy /account overview route to the orders page
  redirect("/account/orders")
}
