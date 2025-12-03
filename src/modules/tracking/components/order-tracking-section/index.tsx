import { Heading, Text } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import TrackingTimeline from "@modules/tracking/components/tracking-timeline"
import React from "react"

type OrderTrackingSectionProps = {
  orderId: string
}

/**
 * Tracking section for authenticated order details page
 * Fetches tracking data by order ID (no token needed - user is authenticated)
 *
 * Future implementation: Add this component to order-details-template.tsx
 * after the ShippingDetails component
 */
const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = async ({
  orderId,
}) => {
  // TODO: Future implementation - create authenticated endpoint
  // GET /store/orders/{id}/tracking (requires customer auth)
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  let trackingData
  try {
    const response = await fetch(`${backendUrl}/store/orders/${orderId}/tracking`, {
      cache: "no-store",
      credentials: "include", // Send cookies for auth
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // No tracking available for this order
      return null
    }

    trackingData = await response.json()
  } catch (error) {
    // Silently fail - don't show tracking if unavailable
    return null
  }

  if (!trackingData || !trackingData.tracking_number) {
    return null
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus.includes("delivered")) return "text-green-600"
    if (normalizedStatus.includes("transit") || normalizedStatus.includes("picked"))
      return "text-blue-600"
    if (normalizedStatus.includes("exception") || normalizedStatus.includes("failed"))
      return "text-red-600"
    return "text-gray-600"
  }

  const getStatusDisplay = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus.includes("delivered")) return "Delivered"
    if (normalizedStatus.includes("transit")) return "In Transit"
    if (normalizedStatus.includes("picked")) return "Picked Up"
    if (normalizedStatus.includes("registered")) return "Registered"
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
  }

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Tracking
      </Heading>
      <div className="flex flex-col gap-4">
        {/* Tracking Summary */}
        <div className="flex items-start gap-x-8">
          <div className="flex flex-col w-1/3">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Tracking Number
            </Text>
            <Text className="txt-medium text-ui-fg-subtle font-mono">
              {trackingData.tracking_number}
            </Text>
          </div>

          <div className="flex flex-col w-1/3">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">Carrier</Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {trackingData.carrier}
            </Text>
          </div>

          <div className="flex flex-col w-1/3">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">Status</Text>
            <Text
              className={`txt-medium font-semibold ${getStatusColor(trackingData.current_status)}`}
            >
              {getStatusDisplay(trackingData.current_status)}
            </Text>
          </div>
        </div>

        {/* Tracking Events */}
        {trackingData.events && trackingData.events.length > 0 && (
          <div className="mt-4">
            <Text className="txt-medium-plus text-ui-fg-base mb-3">
              Recent Updates
            </Text>
            <TrackingTimeline events={trackingData.events.slice(0, 3)} />
            {trackingData.events.length > 3 && (
              <Text className="txt-small text-ui-fg-subtle mt-2">
                Showing 3 most recent events
              </Text>
            )}
          </div>
        )}
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default OrderTrackingSection
