import { Text } from "@medusajs/ui"
import React from "react"

type TrackingEvent = {
  timestamp: string
  status: string
  description: string
  location?: string
}

type TrackingTimelineProps = {
  events: TrackingEvent[]
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus.includes("delivered")) {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )
    }

    if (
      normalizedStatus.includes("transit") ||
      normalizedStatus.includes("picked")
    ) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
    }

    if (
      normalizedStatus.includes("exception") ||
      normalizedStatus.includes("failed")
    ) {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )
    }

    // Default icon for registered/other statuses
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <Text className="txt-medium text-ui-fg-subtle">
          No tracking events available yet. Check back soon for updates.
        </Text>
      </div>
    )
  }

  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4 pb-8 last:pb-0 relative">
          {/* Vertical line connecting events */}
          {index < events.length - 1 && (
            <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200" />
          )}

          {/* Status icon */}
          <div className="flex-shrink-0 z-10">{getStatusIcon(event.status)}</div>

          {/* Event details */}
          <div className="flex-1 pt-1">
            <div className="flex flex-col gap-1">
              <Text className="txt-medium-plus text-ui-fg-base">
                {event.description}
              </Text>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Text className="txt-small text-ui-fg-subtle">
                  {formatDateTime(event.timestamp)}
                </Text>
                {event.location && (
                  <Text className="txt-small text-ui-fg-subtle">
                    📍 {event.location}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrackingTimeline
