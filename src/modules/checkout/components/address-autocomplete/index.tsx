"use client"

import React, { useEffect, useRef, useState } from "react"
import Radar from "radar-sdk-js"
import "radar-sdk-js/dist/radar.css"

// Types for Radar address response
interface RadarAddress {
  addressLabel?: string
  formattedAddress?: string
  number?: string
  street?: string
  unit?: string
  city?: string
  borough?: string
  state?: string
  stateCode?: string
  county?: string
  country?: string
  countryCode?: string
  postalCode?: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  layer?: string
  confidence?: string
}

interface AddressAutocompleteProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddressSelect: (address: RadarAddress) => void
  label: string
  required?: boolean
  countryCodes?: string[]
  autoComplete?: string
  "data-testid"?: string
}

const AddressAutocomplete = React.forwardRef<
  HTMLInputElement,
  AddressAutocompleteProps
>(
  (
    {
      name,
      value,
      onChange,
      onAddressSelect,
      label,
      required = false,
      countryCodes,
      autoComplete,
      "data-testid": dataTestId,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const autocompleteRef = useRef<any>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
      const publishableKey = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY

      if (!publishableKey) {
        console.error("NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY is not set")
        return
      }

      // Initialize Radar SDK
      if (!isInitialized) {
        Radar.initialize(publishableKey)
        setIsInitialized(true)
      }

      // Create autocomplete instance
      if (containerRef.current && isInitialized) {
        autocompleteRef.current = Radar.ui.autocomplete({
          container: containerRef.current,
          responsive: true,
          width: "100%",
          countryCodes: countryCodes,
          onSelection: (address: RadarAddress) => {
            // Call parent callback to populate all address fields
            onAddressSelect(address)

            // Also update the input value
            const syntheticEvent = {
              target: {
                name,
                value: `${address.number || ""} ${address.street || ""}${
                  address.unit ? " " + address.unit : ""
                }`.trim(),
              },
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          },
        })
      }

      // Cleanup
      return () => {
        if (autocompleteRef.current && autocompleteRef.current.remove) {
          autocompleteRef.current.remove()
        }
      }
    }, [isInitialized, countryCodes, name, onChange, onAddressSelect])

    // Sync the input value with the parent's value
    useEffect(() => {
      if (containerRef.current) {
        const input = containerRef.current.querySelector("input")
        if (input && input.value !== value) {
          input.value = value
        }
      }
    }, [value])

    return (
      <div className="flex flex-col w-full">
        <div className="flex relative z-0 w-full txt-compact-medium address-autocomplete-wrapper">
          <div
            ref={containerRef}
            className="w-full"
            data-testid={dataTestId}
            style={{
              position: "relative",
            }}
          />
          <label
            htmlFor={name}
            className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-3 -z-1 origin-0 text-ui-fg-subtle pointer-events-none"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
        <style jsx global>{`
          .address-autocomplete-wrapper .radar-autocomplete-input {
            padding-top: 1rem !important;
            padding-bottom: 0.25rem !important;
            display: block !important;
            width: 100% !important;
            height: 2.75rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            margin-top: 0 !important;
            background-color: var(--ui-bg-field) !important;
            border: 1px solid var(--ui-border-base) !important;
            border-radius: 0.375rem !important;
            appearance: none !important;
            box-sizing: border-box !important;
          }

          .address-autocomplete-wrapper .radar-autocomplete-input:focus {
            outline: none !important;
            ring: 0 !important;
            box-shadow: 0 0 0 2px var(
                --ui-border-interactive
              ) !important;
          }

          .address-autocomplete-wrapper .radar-autocomplete-input:hover {
            background-color: var(--ui-bg-field-hover) !important;
          }

          .address-autocomplete-wrapper .radar-autocomplete-results {
            position: absolute !important;
            z-index: 50 !important;
            width: 100% !important;
            margin-top: 0.25rem !important;
            background-color: white !important;
            border: 1px solid var(--ui-border-base) !important;
            border-radius: 0.375rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          }

          .address-autocomplete-wrapper .radar-autocomplete-result {
            padding: 0.75rem 1rem !important;
            cursor: pointer !important;
            transition: background-color 0.15s ease !important;
          }

          .address-autocomplete-wrapper .radar-autocomplete-result:hover,
          .address-autocomplete-wrapper .radar-autocomplete-result-active {
            background-color: var(--ui-bg-subtle) !important;
          }

          .address-autocomplete-wrapper
            .radar-autocomplete-result-formatted-address {
            font-size: 0.875rem !important;
            color: var(--ui-fg-base) !important;
          }
        `}</style>
      </div>
    )
  }
)

AddressAutocomplete.displayName = "AddressAutocomplete"

export default AddressAutocomplete
export type { RadarAddress }
