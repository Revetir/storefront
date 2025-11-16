import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  // Universal sort function that handles predefined sizes and numeric/alphanumeric values
  const sizeOrder = [
    "xxxs", "xxs", "xs", "s", "sm", "small", 
    "m", "med", "medium", "l", "large", 
    "xl", "xxl", "xxxl", "xxxxl"
  ]

  const universalSort = (a: string, b: string) => {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()

    const aIndex = sizeOrder.indexOf(aLower)
    const bIndex = sizeOrder.indexOf(bLower)

    if (aIndex !== -1 && bIndex !== -1) {
      // Both are in the sizeOrder list
      return aIndex - bIndex
    } else if (aIndex !== -1) {
      // Only a is in the list -> a comes first
      return -1
    } else if (bIndex !== -1) {
      // Only b is in the list -> b comes first
      return 1
    }

    // Fallback: numeric/alphanumeric natural sort
    return a.localeCompare(b, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    })
  }

  const sortedOptions = (option.values ?? [])
    .map((v) => v.value)
    .sort(universalSort)

  return (
    <div className="flex flex-col gap-y-3">
      {/* <span className="text-sm">{title}</span> */}
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {sortedOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 p-2 flex-1 ",
                {
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
