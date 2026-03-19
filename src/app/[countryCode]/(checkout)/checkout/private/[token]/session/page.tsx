import { redirect } from "next/navigation"

export default async function LegacyPrivateCheckoutSessionPage({
  params,
}: {
  params: Promise<{ countryCode: string; token: string }>
}) {
  const { countryCode, token } = await params
  redirect(`/${countryCode}/checkout/private/${token}`)
}

