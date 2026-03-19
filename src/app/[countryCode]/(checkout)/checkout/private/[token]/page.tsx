import { activatePrivateCheckoutSessionCart, resolvePrivateCheckoutSession } from "@lib/data/private-checkout"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{
    countryCode: string
    token: string
  }>
}

export default async function PrivateCheckoutEntryPage(props: Props) {
  const { countryCode, token } = await props.params

  const session = await resolvePrivateCheckoutSession(token)
  if (!session?.cart_id) {
    return notFound()
  }

  await activatePrivateCheckoutSessionCart({
    token,
    cartId: session.cart_id,
  })

  redirect(`/${countryCode}/checkout`)
}
