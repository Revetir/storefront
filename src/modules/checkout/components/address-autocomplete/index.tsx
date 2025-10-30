"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
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
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    // Memoize the selection handler to prevent recreation on every render
    const handleSelection = useCallback(
      (address: RadarAddress) => {
        console.log("Radar address selected:", address)

        // Update the parent's form state with all address fields
        onAddressSelect(address)

        // Mark that we have a value for the floating label
        setHasValue(true)

        // Create synthetic event for the address field itself
        const addressString = `${address.number || ""} ${address.street || ""}${
          address.unit ? " " + address.unit : ""
        }`.trim()

        const syntheticEvent = {
          target: {
            name,
            value: addressString,
          },
        } as React.ChangeEvent<HTMLInputElement>

        onChange(syntheticEvent)
      },
      [name, onChange, onAddressSelect]
    )

    // Initialize Radar SDK once
    useEffect(() => {
      const publishableKey = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY

      if (!publishableKey) {
        console.error("NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY is not set")
        return
      }

      if (!isInitialized) {
        try {
          Radar.initialize(publishableKey)
          setIsInitialized(true)
          console.log("Radar SDK initialized")
        } catch (error) {
          console.error("Failed to initialize Radar SDK:", error)
        }
      }
    }, [isInitialized])

    // Create autocomplete instance (only when initialized or countryCodes change)
    useEffect(() => {
      if (!containerRef.current || !isInitialized) {
        return
      }

      console.log("Creating Radar autocomplete with countries:", countryCodes)

      try {
        // Remove existing instance if present
        if (autocompleteRef.current?.remove) {
          autocompleteRef.current.remove()
        }

        // Create new autocomplete instance
        autocompleteRef.current = Radar.ui.autocomplete({
          container: containerRef.current,
          responsive: true,
          width: "100%",
          countryCodes: countryCodes,
          onSelection: handleSelection,
        })

        console.log("Radar autocomplete created successfully")

        // Get the input element and attach focus/blur listeners for label animation
        const input = containerRef.current.querySelector(
          ".radar-autocomplete-input"
        ) as HTMLInputElement

        if (input) {
          const handleFocus = () => setIsFocused(true)
          const handleBlur = () => {
            setIsFocused(false)
            setHasValue(!!input.value)
          }
          const handleInput = () => {
            setHasValue(!!input.value)
          }

          input.addEventListener("focus", handleFocus)
          input.addEventListener("blur", handleBlur)
          input.addEventListener("input", handleInput)

          // Set initial value if provided
          if (value) {
            input.value = value
            setHasValue(true)
          }

          // Cleanup listeners
          return () => {
            input.removeEventListener("focus", handleFocus)
            input.removeEventListener("blur", handleBlur)
            input.removeEventListener("input", handleInput)

            if (autocompleteRef.current?.remove) {
              autocompleteRef.current.remove()
            }
          }
        }
      } catch (error) {
        console.error("Failed to create Radar autocomplete:", error)
      }

      // Cleanup autocomplete on unmount or dependencies change
      return () => {
        if (autocompleteRef.current?.remove) {
          autocompleteRef.current.remove()
        }
      }
    }, [isInitialized, countryCodes, handleSelection, value])

    // Determine if label should be floating
    const labelFloating = isFocused || hasValue

    return (
      <div className="flex flex-col w-full">
        <div className="flex relative w-full txt-compact-medium address-autocomplete-container">
          <div
            ref={containerRef}
            className="w-full"
            data-testid={dataTestId}
            style={{
              position: "relative",
            }}
          />
          <label
            className={`absolute transition-all duration-300 pointer-events-none ${
              labelFloating
                ? "top-1 left-4 text-xs text-ui-fg-subtle"
                : "top-3 left-10 text-ui-fg-subtle"
            }`}
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        </div>
        <style jsx global>{`
          /* Hide Radar's default placeholder */
          .address-autocomplete-container .radar-autocomplete-input::placeholder {
            opacity: 0 !important;
          }

          /* Style Radar input to match Medusa Input component */
          .address-autocomplete-container .radar-autocomplete-input {
            padding-top: 1rem !important;
            padding-bottom: 0.25rem !important;
            padding-left: 2.5rem !important;
            padding-right: 1rem !important;
            display: block !important;
            width: 100% !important;
            height: 2.75rem !important;
            margin-top: 0 !important;
            background-color: var(--ui-bg-field) !important;
            border: 1px solid var(--ui-border-base) !important;
            border-radius: 0.375rem !important;
            appearance: none !important;
            box-sizing: border-box !important;
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
            color: var(--ui-fg-base) !important;
            transition: all 0.2s ease !important;
          }

          .address-autocomplete-container .radar-autocomplete-input:focus {
            outline: none !important;
            ring: 0 !important;
            box-shadow: 0 0 0 2px var(--ui-border-interactive) !important;
            border-color: var(--ui-border-interactive) !important;
          }

          .address-autocomplete-container .radar-autocomplete-input:hover {
            background-color: var(--ui-bg-field-hover) !important;
          }

          /* Position search icon */
          .address-autocomplete-container .radar-autocomplete-search-icon {
            left: 1rem !important;
            top: 0.75rem !important;
            z-index: 1 !important;
          }

          /* Style the results dropdown */
          .address-autocomplete-container .radar-autocomplete-results-list {
            position: absolute !important;
            z-index: 50 !important;
            width: 100% !important;
            margin-top: 0.25rem !important;
            background-color: white !important;
            border: 1px solid var(--ui-border-base) !important;
            border-radius: 0.375rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            padding: 0.25rem 0 !important;
            max-height: 300px !important;
            overflow-y: auto !important;
          }

          /* Style individual result items */
          .address-autocomplete-container .radar-autocomplete-results-item {
            padding: 0.75rem 1rem !important;
            cursor: pointer !important;
            transition: background-color 0.15s ease !important;
            font-size: 0.875rem !important;
            color: var(--ui-fg-base) !important;
            white-space: normal !important;
            word-wrap: break-word !important;
          }

          .address-autocomplete-container .radar-autocomplete-results-item:hover,
          .address-autocomplete-container
            .radar-autocomplete-results-item-selected,
          .address-autocomplete-container
            .radar-autocomplete-results-item[aria-selected="true"] {
            background-color: var(--ui-bg-subtle) !important;
          }

          .address-autocomplete-container .radar-autocomplete-results-item b {
            color: var(--ui-fg-base) !important;
            font-weight: 600 !important;
          }

          /* Hide the powered by Radar footer */
          .address-autocomplete-container .radar-powered {
            display: none !important;
          }

          /* Ensure wrapper has proper z-index */
          .address-autocomplete-container {
            position: relative !important;
            z-index: 10 !important;
          }
        `}</style>
      </div>
    )
  }
)

AddressAutocomplete.displayName = "AddressAutocomplete"

export default AddressAutocomplete
export type { RadarAddress }
