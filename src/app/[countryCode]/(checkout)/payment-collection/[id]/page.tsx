import { Metadata } from "next"
import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ countryCode: string; id: string }>
}

export const metadata: Metadata = {
  title: "Private Checkout",
}

export default async function PaymentCollectionRedirectPage({ params }: PageProps) {
  const { countryCode, id } = await params
  redirect(`/${countryCode}/checkout/private/${id}`)
}
