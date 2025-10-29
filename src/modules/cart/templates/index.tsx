import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col gap-y-6">
              <div className="bg-white py-6">
                <ItemsTemplate cart={cart} />
              </div>
              {!customer && (
                <>
                  <div className="lg:hidden bg-white py-6">
                    <SignInPrompt />
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-4 sticky top-12">
                {!customer && (
                  <>
                    <div className="hidden lg:block bg-white py-6">
                      <SignInPrompt />
                    </div>
                  </>
                )}
                {cart && cart.region && (
                  <>
                    <div className="bg-white py-6">
                      <Summary cart={cart as any} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
