"use client"

import { Heading, Text } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Items from "@modules/order/components/items"
import Help from "@modules/order/components/help"
import TrackingTimeline from "@modules/tracking/components/tracking-timeline"
import React from "react"

type TrackingData = {
  order: {
    id: string
    display_id: number
    created_at: string
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

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Circles and connecting lines */}
      <div className="relative flex justify-between items-center">
        {/* Background line spanning full width */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-200" />
        {/* Active line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-ui-fg-base"
          style={{
            width: `${(lastCompletedIndex / (steps.length - 1)) * 100}%`,
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

  return (
    <div className="flex flex-col justify-center gap-y-4 max-w-4xl mx-auto py-8">
      <div className="w-full">
        <OrderStatusTimeline currentStatus={data.current_status} />
      </div>

      <div className="flex flex-col gap-6 bg-white p-6 rounded-lg">
        {/* Travel History */}
        <div>
          <Heading
            level="h2"
            className="text-md uppercase text-gray-800 mb-4"
          >
            Travel History
          </Heading>

          <div className="flex flex-col divide-y divide-gray-100">
            {data.events.map((event, index) => {
              const { dateLabel, timeLabel } = formatEventDateTime(event.timestamp)

              return (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="py-4 flex flex-row gap-6 text-sm md:text-base"
                >
                  <div className="w-40 shrink-0 text-xs md:text-sm text-ui-fg-subtle">
                    <div className="whitespace-nowrap">{dateLabel}</div>
                    <div className="whitespace-nowrap">{timeLabel}</div>
                  </div>

                  <div className="flex-1 text-sm md:text-base leading-relaxed">
                    <div className="text-md font-medium text-ui-fg-base">
                      {event.description || getStatusDisplay(event.status)}
                    </div>
                    {event.location && (
                      <div className="mt-1 text-ui-fg-subtle text-sm md:text-base uppercase tracking-wide">
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
            className="text-md uppercase text-gray-700 mb-4"
          >
            Package Details
          </Heading>

          <div className="text-sm md:text-base leading-relaxed space-y-1">
            <Text className="text-md">
              Tracking Number: <span className="font-mono">{data.tracking_number}</span>
            </Text>
            <Text className="text-md">
              Carrier: <span className="uppercase">{data.carrier}</span>
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

        {/* Order Details – Shipping Method, Shipping Address, Items */}
        <div className="flex flex-col gap-y-4 border-t border-gray-200 pt-4">
          {/* Shipping meta */}
          <div className="mt-2 grid grid-cols-2 gap-6 text-xs sm:text-sm md:hidden">
            <div className="space-y-1">
              <p className="uppercase text-gray-700">Shipping Method</p>
              {data.order.shipping_methods?.map((method) => (
                <p key={method.id} className="text-gray-900">
                  {method.name}
                </p>
              ))}
            </div>

            <div className="space-y-1">
              <p className="uppercase text-gray-700">Shipping Address</p>
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
          </div>

          {/* Desktop: 2-column layout (shipping method + address) */}
          <div className="mt-2 hidden md:grid md:grid-cols-3 md:gap-8 text-xs sm:text-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="uppercase text-gray-700">Shipping Method</p>
                {data.order.shipping_methods?.map((method) => (
                  <p key={method.id} className="text-gray-900">
                    {method.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <p className="uppercase text-gray-700">Shipping Address</p>
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
          </div>

          {/* Items – use existing Items component styling */}
          {data.order.items && data.order.items.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <Items order={data.order as any} />
            </div>
          )}
        </div>

        <Help />
      </div>
    </div>
  )
}

export default TrackingTemplate
