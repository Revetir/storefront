import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    const result = formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
    
    // Change "Completed" to "Confirmed" for order status
    if (result.toLowerCase() === "completed") {
      return "Confirmed"
    }
    
    // Change order status wording to better reflect industry standards
    if (result.toLowerCase() === "not fulfilled") {
      return "Received"
    }
    
    if (result.toLowerCase() === "fulfilled") {
      return "Processing"
    }
    
    if (result.toLowerCase() === "partially fulfilled") {
      return "Partially Processing"
    }
    
    return result
  }

  const formatOrderDateEST = (dateInput: string | Date | undefined) => {
    if (!dateInput) return ""
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    })
  }

  const orderId = order.display_id ?? order.id
  const orderDateLabel = formatOrderDateEST(order.created_at || new Date())

  return (
    <div>
      <Text>
        Order confirmation details have been sent to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>

      <div className="mt-4 space-y-1">
        <Text className="text-xs sm:text-sm text-black">
          <span className="font-semibold">Order </span>
          <span data-testid="order-id">{orderId}</span>
        </Text>
        <Text
          className="text-xs sm:text-sm text-black uppercase"
          data-testid="order-date"
        >
          {orderDateLabel} EST
        </Text>
      </div>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Order status:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Payment status:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
