"use client"

import { Heading, Text } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Items from "@modules/order/components/items"
import Help from "@modules/order/components/help"
import TrackingTimeline from "@modules/tracking/components/tracking-timeline"
import React from "react"
import Image from "next/image"

type TrackingData = {
  order: {
    id: string
    display_id: number
    created_at: string
    currency_code?: string
    shipping_address: {
      first_name?: string
      last_name?: string
      address_1?: string
      address_2?: string
      city?: string
      province?: string
      postal_code?: string
      country_code?: string
    }
    shipping_methods?: Array<{
      id: string
      name: string
    }>
    items?: any[]
    fulfillments?: any[]
  }
  tracking_number: string
  carrier: string
  current_status: string
  estimated_delivery?: string
  events: Array<{
    timestamp: string
    status: string
    description: string
    location?: string
  }>
  weight_kg?: number
  weight_lb?: number
  dimensions_cm?: {
    length: number
    width: number
    height: number
  }
}

type TrackingTemplateProps = {
  data: TrackingData
}

const OrderStatusTimeline: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
  const normalizedStatus = currentStatus.toLowerCase()

  const isDelivered = normalizedStatus.includes("delivered")
  const isOutForDelivery =
    normalizedStatus.includes("outfordelivery") ||
    normalizedStatus.includes("out_for_delivery")

  const steps = [
    { label: "Processing", isComplete: true },
    { label: "Shipped", isComplete: true },
    { label: "Out For Delivery", isComplete: isDelivered || isOutForDelivery },
    { label: "Delivered", isComplete: isDelivered },
  ]

  let lastCompletedIndex = 1
  steps.forEach((step, index) => {
    if (step.isComplete) {
      lastCompletedIndex = index
    }
  })

  if (lastCompletedIndex < 1) {
    lastCompletedIndex = 1
  }

  // Calculate line positions based on circle centers
  // Each circle is in a flex-1 container, so centers are at 12.5%, 37.5%, 62.5%, 87.5%
  const stepCount = steps.length
  const firstCenter = 100 / (stepCount * 2) // 12.5% for 4 steps
  const lastCenter = 100 - firstCenter // 87.5% for 4 steps
  const totalLineWidth = lastCenter - firstCenter // 75% for 4 steps
  
  // Active line width: from first center to last completed center
  const activeLineWidth = lastCompletedIndex === 0 
    ? 0 
    : (lastCompletedIndex / (stepCount - 1)) * totalLineWidth

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Circles and connecting lines */}
      <div className="relative flex justify-between items-center">
        {/* Background line between first and last circle centers */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-[1px] bg-gray-200"
          style={{
            left: `${firstCenter}%`,
            right: `${firstCenter}%`,
          }}
        />
        {/* Active line from first center through last completed circle center */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-ui-fg-base"
          style={{
            left: `${firstCenter}%`,
            width: `${activeLineWidth}%`,
          }}
        />
        {/* Circles */}
        {steps.map((step, index) => {
          const isComplete = step.isComplete
          return (
            <div
              key={step.label}
              className="relative z-10 flex-1 flex justify-center"
            >
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isComplete
                    ? "bg-ui-fg-base border-ui-fg-base"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[11px] tracking-wide uppercase">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`flex-1 text-center ${
              step.isComplete ? "text-ui-fg-base" : "text-ui-fg-subtle"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const TrackingTemplate: React.FC<TrackingTemplateProps> = ({ data }) => {
  const [carrierName, setCarrierName] = React.useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
    // Convert status codes to human-readable format
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus.includes("delivered")) return "Delivered"
    if (normalizedStatus.includes("transit")) return "In Transit"
    if (normalizedStatus.includes("picked")) return "Picked Up"
    if (normalizedStatus.includes("registered")) return "Registered"
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
  }

  const formatEventDateTime = (timestamp: string) => {
    const date = new Date(timestamp)

    const dateLabel = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    const timeLabel = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    return { dateLabel, timeLabel }
  }

  React.useEffect(() => {
    let cancelled = false

    const loadCarrierName = async () => {
      try {
        const response = await fetch(
          "https://res.17track.net/asset/carrier/info/apicarrier.all.json"
        )
        if (!response.ok) {
          return
        }

        const carriers: Array<{ key: number; _name: string }> = await response.json()
        const mapped = carriers.find((c) => String(c.key) === String(data.carrier))
        if (!cancelled && mapped?._name) {
          setCarrierName(mapped._name)
        }
      } catch {
        // ignore mapping failures and fall back to raw carrier code
      }
    }

    loadCarrierName()

    return () => {
      cancelled = true
    }
  }, [data.carrier])

  const displayCarrier = carrierName || data.carrier

  // Derive items that belong to the fulfillment(s) associated with this tracking number.
  const deriveShipmentItems = () => {
    const order = data.order as any
    const orderItems: any[] = Array.isArray(order.items) ? order.items : []
    const fulfillments: any[] = Array.isArray(order.fulfillments)
      ? order.fulfillments
      : []

    if (!fulfillments.length || !orderItems.length) {
      return orderItems
    }

    // Find fulfillments whose tracking numbers match this tracking number.
    const matchingFulfillments = fulfillments.filter((f) => {
      const trackingNumbers: string[] = Array.isArray(f.tracking_numbers)
        ? f.tracking_numbers
        : []

      return trackingNumbers.some(
        (n) => String(n).trim() === String(data.tracking_number).trim()
      )
    })

    if (!matchingFulfillments.length) {
      return orderItems
    }

    const orderItemsById = new Map<string, any>()
    orderItems.forEach((item: any) => {
      if (item?.id) {
        orderItemsById.set(item.id, item)
      }
    })

    const shipmentItems: any[] = []

    matchingFulfillments.forEach((f) => {
      const fulfillmentItems: any[] = Array.isArray(f.items) ? f.items : []
      fulfillmentItems.forEach((fi) => {
        const lineItemId = fi?.line_item_id
        if (!lineItemId) return

        const lineItem = orderItemsById.get(lineItemId)
        if (lineItem && !shipmentItems.includes(lineItem)) {
          shipmentItems.push(lineItem)
        }
      })
    })

    return shipmentItems.length ? shipmentItems : orderItems
  }

  const shipmentItems = React.useMemo(deriveShipmentItems, [data])

  const shipmentThumbnails = React.useMemo(() => {
    const items = Array.isArray(shipmentItems) ? shipmentItems : []
    return {
      items,
      mobile: {
        visible: items.slice(0, 2),
        remainingCount: items.length > 2 ? items.length - 2 : 0,
      },
      desktop: {
        visible: items.slice(0, 3),
        remainingCount: items.length > 3 ? items.length - 3 : 0,
      },
    }
  }, [shipmentItems])

  const getItemThumbnailUrl = (item: any): string | null => {
    const variantThumb = item?.variant?.thumbnail
    const productThumb = item?.variant?.product?.thumbnail || item?.product?.thumbnail
    return variantThumb || productThumb || null
  }

  return (
    <div className="flex flex-col justify-center gap-y-4 max-w-4xl mx-auto py-8">
      <div className="w-full">
        <OrderStatusTimeline currentStatus={data.current_status} />
      </div>

      <div className="flex flex-col gap-6 bg-white p-6 rounded-lg">
        {/* Travel History TODO: collapsible events*/}
        <div>
          <Heading
            level="h2"
            className="text-md uppercase text-gray-800 mb-2"
          >
            Travel History
          </Heading>

          <div className="flex flex-col divide-y divide-gray-100">
            {data.events
              .filter((event) => {
                const status = (event.status || "").toLowerCase()
                return !status.includes("registered")
              })
              .map((event, index) => {
                const { dateLabel, timeLabel } = formatEventDateTime(event.timestamp)

                return (
                  <div
                    key={`${event.timestamp}-${index}`}
                    className="py-4 flex flex-row gap-6 text-xs md:text-sm"
                  >
                    <div className="w-40 shrink-0 text-xs md:text-sm text-ui-fg-subtle">
                      <div className="whitespace-nowrap">{dateLabel}</div>
                      <div className="whitespace-nowrap">{timeLabel}</div>
                    </div>

                    <div className="flex-1 text-xs md:text-sm">
                      <div className="text-xs md:text-sm text-ui-fg-base">
                        {event.description || getStatusDisplay(event.status)}
                      </div>
                      {event.location && (
                        <div className="mt-1 text-ui-fg-subtle text-xs md:text-sm">
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        <Divider />

        {/* Package Details */}
        <div>
          <Heading
            level="h2"
            className="text-md uppercase text-gray-700 mb-2"
          >
            Package Details
          </Heading>

          <div className="text-sm md:text-base leading-relaxed space-y-1">
            <Text className="text-md">
              Carrier: <span>{displayCarrier}</span>
            </Text>
            <Text className="text-md">
              Service: <span>International Air</span>
            </Text>
            <Text className="text-md">
              Tracking Number: <span>{data.tracking_number}</span>
            </Text>
            {typeof data.weight_lb === "number" || typeof data.weight_kg === "number" ? (
              <Text className="text-md">
                Weight:{" "}
                {typeof data.weight_lb === "number" && (
                  <span>
                    {data.weight_lb.toFixed(1)} lbs
                    {typeof data.weight_kg === "number" && " / "}
                  </span>
                )}
                {typeof data.weight_kg === "number" && (
                  <span>{data.weight_kg.toFixed(2)} kgs</span>
                )}
              </Text>
            ) : null}
            {data.dimensions_cm && (
              <Text className="text-md">
                Dimensions: {data.dimensions_cm.length} x {data.dimensions_cm.width} x{" "}
                {data.dimensions_cm.height} cm
              </Text>
            )}
          </div>
        </div>

        {/* Order Details – Shipping Address & Items */}
        <div className="flex flex-col gap-y-4 border-t border-gray-200 pt-4">
          {/* Mobile: 2-column layout with Shipping Address (left) and In This Shipment (right) */}
          <div className="mt-2 grid grid-cols-2 gap-6 text-xs sm:text-sm md:hidden">
            {/* Left column: Shipping Address */}
            <div className="space-y-1">
              <Heading level="h2" className="text-md uppercase text-gray-800 mb-2">
                Shipping Address
              </Heading>
              {data.order.shipping_address && (
                <div className="text-gray-900 space-y-0.5">
                  <p>
                    {data.order.shipping_address.first_name} {" "}
                    {data.order.shipping_address.last_name}
                  </p>
                  <p>{data.order.shipping_address.address_1}</p>
                  {data.order.shipping_address.address_2 && (
                    <p>{data.order.shipping_address.address_2}</p>
                  )}
                  <p>
                    {data.order.shipping_address.city}, {data.order.shipping_address.province} {" "}
                    {data.order.shipping_address.postal_code}
                  </p>
                  <p>{data.order.shipping_address.country_code?.toUpperCase()}</p>
                </div>
              )}
            </div>

            {/* Right column: In This Shipment thumbnails */}
            {shipmentThumbnails.mobile.visible.length > 0 && (
              <div className="space-y-1 flex flex-col">
                <Heading level="h2" className="text-md uppercase text-gray-800 mb-2">
                  In This Shipment
                </Heading>
                <div className="flex flex-row items-center gap-2">
                  {shipmentThumbnails.mobile.visible.map((item, idx) => {
                    const thumb = getItemThumbnailUrl(item)
                    if (!thumb) return null
                    return (
                      <div
                        key={idx}
                        className="w-16 aspect-square overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-2"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={thumb}
                            alt={item?.title || "Shipment item"}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )
                  })}
                  {shipmentThumbnails.mobile.remainingCount > 0 && (
                    <div className="text-xs sm:text-sm text-gray-700">
                      +{shipmentThumbnails.mobile.remainingCount}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop: 3-column layout (shipping method + address + shipment items) */}
          <div className="mt-2 hidden md:grid md:grid-cols-3 md:gap-8 text-xs sm:text-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <Heading level="h2" className="text-md uppercase text-gray-800 mb-2">
                  Shipping Method
                </Heading>
                {data.order.shipping_methods?.map((method) => (
                  <p key={method.id} className="text-gray-900">
                    {method.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Heading level="h2" className="text-md uppercase text-gray-800 mb-2">
                Shipping Address
              </Heading>
              {data.order.shipping_address && (
                <div className="text-gray-900 space-y-0.5">
                  <p>
                    {data.order.shipping_address.first_name} {" "}
                    {data.order.shipping_address.last_name}
                  </p>
                  <p>{data.order.shipping_address.address_1}</p>
                  {data.order.shipping_address.address_2 && (
                    <p>{data.order.shipping_address.address_2}</p>
                  )}
                  <p>
                    {data.order.shipping_address.city}, {data.order.shipping_address.province} {" "}
                    {data.order.shipping_address.postal_code}
                  </p>
                  <p>{data.order.shipping_address.country_code?.toUpperCase()}</p>
                </div>
              )}
            </div>

            {shipmentThumbnails.desktop.visible.length > 0 && (
              <div className="space-y-1">
                <Heading level="h2" className="text-md uppercase text-gray-800 mb-2">
                  In This Shipment
                </Heading>
                <div className="flex flex-row items-center gap-2">
                  {shipmentThumbnails.desktop.visible.map((item, idx) => {
                    const thumb = getItemThumbnailUrl(item)
                    if (!thumb) return null
                    return (
                      <div
                        key={idx}
                        className="w-16 aspect-square overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-2"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={thumb}
                            alt={item?.title || "Shipment item"}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )
                  })}
                  {shipmentThumbnails.desktop.remainingCount > 0 && (
                    <div className="text-xs sm:text-sm text-gray-700">
                      +{shipmentThumbnails.desktop.remainingCount}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Help />
      </div>
    </div>
  )
}

export default TrackingTemplate
