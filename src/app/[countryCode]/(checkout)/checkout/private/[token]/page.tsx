import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import PaymentCollectionCheckoutTemplate from "@modules/payment-collection/templates/checkout-template"
import { notFound, redirect } from "next/navigation"

type ResolvePrivateCheckoutResponse = {
  payment_collection_id: string
}

export default async function PrivateCheckoutPage({
  params,
}: {
  params: Promise<{ countryCode: string; token: string }>
}) {
  const { countryCode, token } = await params

  if (token.startsWith("pay_col_")) {
    return (
      <PaymentCollectionCheckoutTemplate
        countryCode={countryCode}
        paymentCollectionId={token}
      />
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const session = await sdk.client
    .fetch<ResolvePrivateCheckoutResponse>("/store/private-checkout-sessions/resolve", {
      method: "POST",
      body: { token },
      headers,
      cache: "no-store",
    })
    .catch(() => null)

  if (!session?.payment_collection_id) {
    return notFound()
  }

  redirect(`/${countryCode}/checkout/private/${session.payment_collection_id}`)
}

