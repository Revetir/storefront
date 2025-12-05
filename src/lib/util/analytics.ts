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
  // Flattened item information for analytics tools that surface top-level scalars more easily
  item_titles?: string[]
  item_ids?: string[]
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
  track('Add to Bag', data as any)
}

export const trackRemoveFromBag = (data: CartEventData) => {
  track('Remove from Bag', data as any)
}

export const trackQuantityChange = (data: CartEventData & { old_quantity: number; new_quantity: number }) => {
  track('Update Quantity', data as any)
}

export const trackVariantSelected = (data: ProductEventData & { option_type: string; option_value: string }) => {
  track('Variant Selected', data as any)
}

export const trackSizeGuideOpened = (data: ProductEventData) => {
  track('Size Guide Opened', data as any)
}

// Checkout Events
export const trackCheckoutInitiated = (data: CheckoutEventData) => {
  track('Checkout Initiated', data as any)
}

export const trackCheckoutStepCompleted = (data: CheckoutEventData) => {
  const stepName = data.step ? `Checkout ${data.step.charAt(0).toUpperCase() + data.step.slice(1)} Completed` : 'Checkout Step Completed'
  track(stepName, data as any)
}

export const trackOrderPlaced = (data: CheckoutEventData) => {
  track('Order Placed', data as any)
}

// Discovery Events
export const trackSortApplied = (data: DiscoveryEventData) => {
  track('Sort Applied', data as any)
}

export const trackFilterApplied = (data: DiscoveryEventData) => {
  track('Filter Applied', data as any)
}

// Engagement Events
export const trackContactFormSubmitted = (data: EngagementEventData) => {
  track('Contact Form Submitted', data as any)
}

export const trackDiscountApplied = (data: EngagementEventData) => {
  track('Discount Code Applied', data as any)
}

export const trackSocialClick = (data: EngagementEventData) => {
  track('Social Link Clicked', data as any)
}

export const trackEditAction = (data: { section: string; step?: string }) => {
  track('Edit Button Clicked', data as any)
}
