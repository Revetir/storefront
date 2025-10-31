import { Label } from "@medusajs/ui"
import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        name={name}
        data-testid={dataTestId}
        className="relative flex h-4 w-4 items-center justify-center outline-none"
      >
        {/* Outer square border */}
        <div className="h-4 w-4 border-2 border-black bg-white rounded-sm flex items-center justify-center">
          {/* Inner square when checked */}
          {checked && (
            <div className="h-2 w-2 bg-black rounded-sm" />
          )}
        </div>
      </button>
      <Label
        htmlFor="checkbox"
        className="!transform-none !txt-medium cursor-pointer"
        size="large"
        onClick={onChange}
      >
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
