"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import MedusaRadio from "@modules/common/components/radio"

type SelectablePaymentMethod<TMethod extends string> = {
  id: TMethod
  label: string
  icons: React.ComponentType[]
}

interface CustomPaymentSelectorProps<TMethod extends string> {
  availableMethods: SelectablePaymentMethod<TMethod>[]
  selectedMethod: TMethod | null | undefined
  onMethodSelect: (method: TMethod) => void
  renderPaymentDetails: (method: TMethod) => React.ReactNode
}

const CustomPaymentSelector = <TMethod extends string>({
  availableMethods,
  selectedMethod,
  onMethodSelect,
  renderPaymentDetails,
}: CustomPaymentSelectorProps<TMethod>) => {
  return (
    <RadioGroup
      value={selectedMethod}
      onChange={onMethodSelect}
      className="space-y-0"
    >
      {availableMethods.map((method) => (
        <div key={method.id} className="flex flex-col">
          <Radio
            value={method.id}
            className={clx(
              "flex items-center justify-between gap-x-4 text-small-regular cursor-pointer py-3 transition-colors"
            )}
          >
            <div className="flex items-center gap-x-4 flex-1">
              <MedusaRadio checked={selectedMethod === method.id} />
              <span className="text-base-regular">{method.label}</span>
            </div>

            {/* Payment method icons on the right */}
            <div className="flex items-center gap-1.5">
              {method.icons.map((IconComponent, index) => (
                <div
                  key={index}
                  className={clx(
                    "flex items-center transition-all duration-200",
                    selectedMethod === method.id
                      ? "opacity-100"
                      : "opacity-50 grayscale"
                  )}
                >
                  <IconComponent />
                </div>
              ))}
            </div>
          </Radio>

          {/* Conditionally render payment details below the selected radio */}
          {selectedMethod === method.id && (
            <div className="ml-8 animate-fadeIn">
              {renderPaymentDetails(method.id)}
            </div>
          )}
        </div>
      ))}
    </RadioGroup>
  )
}

export default CustomPaymentSelector
