import { Metadata } from "next"
import { notFound } from "next/navigation"
import TrackingTemplate from "@modules/tracking/templates/tracking-template"
import { getAuthHeaders } from "@lib/data/cookies"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tracking_number?: string }>
}

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your REVETIR shipment",
}

export default async function AccountOrderTrackingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  const orderId = params.id
  const trackingNumber = searchParams.tracking_number

  if (!orderId || !trackingNumber) {
    return notFound()
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
    ...(await getAuthHeaders()),
  }

  let trackingData: any

  try {
    const response = await fetch(
      `${backendUrl}/store/orders/${orderId}/tracking?tracking_number=${encodeURIComponent(
        trackingNumber
      )}`,
      {
        cache: "no-store",
        headers,
      }
    )

    if (!response.ok) {
      return notFound()
    }

    trackingData = await response.json()
  } catch (error) {
    return notFound()
  }

  return <TrackingTemplate data={trackingData} />
}
