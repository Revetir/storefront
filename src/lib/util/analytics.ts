import { track } from '@vercel/analytics'

// Event data types
export interface ProductEventData {
  product_id: string
  product_name?: string
  brand?: string
  variant_id?: string
  variant_name?: string
  price?: number
  currency?: string
}

export interface CartEventData extends ProductEventData {
  quantity?: number
  cart_value?: number
  item_count?: number
}

export interface CheckoutEventData {
  step?: string
  cart_value?: number
  item_count?: number
  shipping_method?: string
  payment_provider?: string
  order_value?: number
  items?: Array<{
    product_id?: string
    product_name?: string
    brand?: string
    variant_id?: string
    quantity?: number
    price?: number
  }>
}

export interface DiscoveryEventData {
  sort_type?: string
  filter_type?: string
  filter_value?: string
}

export interface EngagementEventData {
  request_type?: string
  platform?: string
  success?: boolean
  discount_code?: string
}

// Cart & Product Events
export const trackAddToBag = (data: CartEventData) => {
  track('Add to Bag', data)
}

export const trackRemoveFromBag = (data: CartEventData) => {
  track('Remove from Bag', data)
}

export const trackQuantityChange = (data: CartEventData & { old_quantity: number; new_quantity: number }) => {
  track('Update Quantity', data)
}

export const trackVariantSelected = (data: ProductEventData & { option_type: string; option_value: string }) => {
  track('Variant Selected', data)
}

export const trackSizeGuideOpened = (data: ProductEventData) => {
  track('Size Guide Opened', data)
}

// Checkout Events
export const trackCheckoutInitiated = (data: CheckoutEventData) => {
  track('Checkout Initiated', data)
}

export const trackCheckoutStepCompleted = (data: CheckoutEventData) => {
  const stepName = data.step ? `Checkout ${data.step.charAt(0).toUpperCase() + data.step.slice(1)} Completed` : 'Checkout Step Completed'
  track(stepName, data)
}

export const trackOrderPlaced = (data: CheckoutEventData) => {
  track('Order Placed', data)
}

// Discovery Events
export const trackSortApplied = (data: DiscoveryEventData) => {
  track('Sort Applied', data)
}

export const trackFilterApplied = (data: DiscoveryEventData) => {
  track('Filter Applied', data)
}

// Engagement Events
export const trackContactFormSubmitted = (data: EngagementEventData) => {
  track('Contact Form Submitted', data)
}

export const trackDiscountApplied = (data: EngagementEventData) => {
  track('Discount Code Applied', data)
}

export const trackSocialClick = (data: EngagementEventData) => {
  track('Social Link Clicked', data)
}

export const trackEditAction = (data: { section: string; step?: string }) => {
  track('Edit Button Clicked', data)
}
