"use client"

import { Heading, Text } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
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

  const maxIndex = steps.length - 1
  const stepCount = steps.length

  const getX = (index: number) => {
    return ((index * 2 + 1) / (stepCount * 2)) * 100
  }

  const startX = getX(0)
  const endX = getX(maxIndex)
  const progressRatio = lastCompletedIndex / maxIndex
  const activeX2 = startX + (endX - startX) * progressRatio

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full">
        <svg
          viewBox="0 0 100 20"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-10 text-ui-fg-base"
        >
          <line
            x1="0"
            y1="10"
            x2="100"
            y2="10"
            stroke="#E5E7EB"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
          <line
            x1={startX}
            y1="10"
            x2={activeX2}
            y2="10"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          {steps.map((step, index) => {
            const x = getX(index)
            const isComplete = step.isComplete

            return (
              <circle
                key={step.label}
                cx={x}
                cy={10}
                r={1.5}
                fill={isComplete ? "currentColor" : "#FFFFFF"}
                stroke={isComplete ? "currentColor" : "#D1D5DB"}
                strokeWidth={isComplete ? 0.4 : 0.6}
              />
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[11px] tracking-wide uppercase mt-1">
        {steps.map((step) => (
          <div
            key={step.label}
            className={
              step.isComplete
                ? "flex-1 text-ui-fg-base text-center"
                : "flex-1 text-ui-fg-subtle text-center"
            }
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

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl-semi">Track Your Order</h1>
        <Text className="text-ui-fg-subtle">
          Order #{data.order.display_id} placed on {formatDate(data.order.created_at)}
        </Text>
      </div>

      <div className="flex flex-col gap-6 bg-white p-6 rounded-lg">
        {/* Tracking Number Section */}
        <div>
          <Heading level="h2" className="text-3xl-regular mb-4">
            Tracking Information
          </Heading>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Text className="txt-medium-plus text-ui-fg-base">
                Tracking Number
              </Text>
              <Text className="txt-medium font-mono">{data.tracking_number}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text className="txt-medium-plus text-ui-fg-base">Carrier</Text>
              <Text className="txt-medium">{data.carrier}</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text className="txt-medium-plus text-ui-fg-base">Status</Text>
              <Text
                className={`txt-medium font-semibold ${getStatusColor(data.current_status)}`}
              >
                {getStatusDisplay(data.current_status)}
              </Text>
            </div>
            {data.estimated_delivery && (
              <div className="flex justify-between items-center">
                <Text className="txt-medium-plus text-ui-fg-base">
                  Estimated Delivery
                </Text>
                <Text className="txt-medium">
                  {formatDate(data.estimated_delivery)}
                </Text>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Tracking Timeline */}
        <div>
          <Heading level="h2" className="text-3xl-regular mb-4">
            Tracking History
          </Heading>
          <TrackingTimeline events={data.events} />
        </div>

        <Divider />

        {/* Travel History */}
        <div>
          <Heading
            level="h2"
            className="text-xl font-semibold tracking-[0.18em] mb-4 uppercase"
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
            className="text-xl font-semibold tracking-[0.18em] mb-4 uppercase"
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

        {/* Shipping Address */}
        <div>
          <Heading level="h2" className="text-3xl-regular mb-4">
            Shipping Address
          </Heading>
          <div className="flex flex-col gap-1">
            <Text className="txt-medium text-ui-fg-base">
              {data.order.shipping_address?.first_name}{" "}
              {data.order.shipping_address?.last_name}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {data.order.shipping_address?.address_1}
            </Text>
            {data.order.shipping_address?.address_2 && (
              <Text className="txt-medium text-ui-fg-subtle">
                {data.order.shipping_address.address_2}
              </Text>
            )}
            <Text className="txt-medium text-ui-fg-subtle">
              {data.order.shipping_address?.city},{" "}
              {data.order.shipping_address?.province}{" "}
              {data.order.shipping_address?.postal_code}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {data.order.shipping_address?.country_code?.toUpperCase()}
            </Text>
          </div>
        </div>

        <Divider />

        {/* Help Section */}
        <div className="bg-gray-50 p-4 rounded">
          <Text className="txt-medium-plus text-ui-fg-base mb-2">
            Need Help?
          </Text>
          <Text className="txt-small text-ui-fg-subtle">
            If you have any questions about your shipment, please{" "}
            <a
              href="/us/customer-care/contact-us"
              className="text-blue-600 hover:underline"
            >
              contact our Customer Care team
            </a>{" "}
            or email us at{" "}
            <a
              href="mailto:care@revetir.com"
              className="text-blue-600 hover:underline"
            >
              care@revetir.com
            </a>
            .
          </Text>
        </div>
      </div>
    </div>
  )
}

export default TrackingTemplate
