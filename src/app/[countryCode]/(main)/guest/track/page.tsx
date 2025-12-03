import { Metadata } from "next"
import { notFound } from "next/navigation"
import TrackingTemplate from "@modules/tracking/templates/tracking-template"

type Props = {
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your REVETIR shipment",
}

/**
 * Customer tracking page
 * Token-based authentication via URL query parameter
 *
 * URL: /us/track?token={jwt}
 */
export default async function TrackingPage(props: Props) {
  const searchParams = await props.searchParams
  const token = searchParams.token

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Missing Tracking Token</h1>
          <p className="text-gray-600">
            No tracking token was provided. Please check your shipment
            confirmation email for a valid tracking link.
          </p>
        </div>
      </div>
    )
  }

  // Fetch tracking data from backend API
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  let trackingData
  try {
    const response = await fetch(
      `${backendUrl}/store/track?token=${token}`,
      {
        cache: "no-store", // Always fetch fresh tracking data
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      // If HTML error page returned, show it
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("text/html")) {
        const html = await response.text()
        return <div dangerouslySetInnerHTML={{ __html: html }} />
      }

      return notFound()
    }

    trackingData = await response.json()
  } catch (error) {
    console.error("Error fetching tracking data:", error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Error Loading Tracking</h1>
          <p className="text-gray-600">
            An error occurred while loading tracking information. Please try
            again later or contact us at care@revetir.com.
          </p>
        </div>
      </div>
    )
  }

  return <TrackingTemplate data={trackingData} />
}
