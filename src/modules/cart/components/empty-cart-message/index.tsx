import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        Shopping Bag
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        Your bag is empty, but it doesn't have to be.
      </Text>
      <div className="flex gap-4">
        <LocalizedClientLink href="/men">
          <button className="px-8 py-3 border border-gray-900 text-gray-900 text-sm font-medium tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
            SHOP MENSWEAR
          </button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/women">
          <button className="px-8 py-3 border border-gray-900 text-gray-900 text-sm font-medium tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
            SHOP WOMENSWEAR
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
