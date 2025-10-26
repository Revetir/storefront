"use client"

import React, { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import { getSizingTemplate, SizingTemplate } from "@lib/data/sizing-templates"
import { SizingMissingDiagram, PantsDiagram, TShirtsDiagram, SweatersDiagram } from "@modules/common/icons/sizing-diagrams"
import X from "@modules/common/icons/x"

interface SizingModalProps {
  isOpen: boolean
  close: () => void
  product: HttpTypes.StoreProduct
}

type PageType = "PM" | "SCC"

const SizingModal: React.FC<SizingModalProps> = ({ isOpen, close, product }) => {
  // State for size and unit toggles
  const [selectedSize, setSelectedSize] = useState<string>("S")
  const [useInches, setUseInches] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<PageType>("PM")

  // Fetch product measurements from API
  const [productMeasurements, setProductMeasurements] = useState<any>(null)
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false)

  // Get the sizing template from backend data
  const sizingTemplate = useMemo(() => {
    if (!productMeasurements?.template) return null
    return getSizingTemplate(productMeasurements.template)
  }, [productMeasurements?.template])

  React.useEffect(() => {
    if (!isOpen) return

    const fetchMeasurements = async () => {
      setIsLoadingMeasurements(true)
      try {
        const baseUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
        const url = `${baseUrl}/store/products/${product.id}/measurements`

        console.log("[SIZING MODAL] Fetching measurements from:", url)
        console.log("[SIZING MODAL] Product ID:", product.id)
        console.log("[SIZING MODAL] Backend URL:", baseUrl)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "x-publishable-api-key": publishableKey ?? ""
          }
        });

        console.log("[SIZING MODAL] Response status:", response.status)
        console.log("[SIZING MODAL] Response ok:", response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log("[SIZING MODAL] Measurements data:", data)
          console.log("[SIZING MODAL] Template from backend:", data.template)
          console.log("[SIZING MODAL] measurements_by_variant keys:", data.measurements_by_variant ? Object.keys(data.measurements_by_variant) : null)
          setProductMeasurements(data)
        } else {
          console.log("[SIZING MODAL] Failed response:", await response.text())
          setProductMeasurements(null)
        }
      } catch (error) {
        console.error("[SIZING MODAL] Failed to fetch measurements:", error)
        console.error("[SIZING MODAL] Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : 'No stack'
        })
        setProductMeasurements(null)
      } finally {
        setIsLoadingMeasurements(false)
      }
    }

    fetchMeasurements()
  }, [isOpen, product.id])

  // Check if shoes category
  const isShoes = sizingTemplate?.diagram_component === "ShoesMen" ||
                  sizingTemplate?.diagram_component === "ShoesWomen" ||
                  sizingTemplate?.diagram_component === "ShoesUnisex"

  // Create variant mapping (variant title -> variant id)
  const variantMap = useMemo(() => {
    const map = new Map<string, string>()
    if (product.variants) {
      for (const variant of product.variants) {
        map.set(variant.title || "", variant.id)
      }
    }
    return map
  }, [product.variants])

  // Get variant ID for selected size
  const selectedVariantId = useMemo(() => {
    return variantMap.get(selectedSize) || null
  }, [selectedSize, variantMap])

  // Get measurements for selected variant
  const selectedVariantMeasurements = useMemo(() => {
    if (!selectedVariantId || !productMeasurements?.measurements_by_variant) {
      return null
    }
    return productMeasurements.measurements_by_variant[selectedVariantId]
  }, [selectedVariantId, productMeasurements])

  // Page visibility logic
  const showPMPage = useMemo(() => {
    // PM page requires measurements data, template, and not shoes
    return !!(productMeasurements?.measurements_by_variant && Object.keys(productMeasurements.measurements_by_variant).length > 0 && sizingTemplate && !isShoes)
  }, [productMeasurements, sizingTemplate, isShoes])

  const showSCCPage = useMemo(() => {
    // SCC only for shoes
    return isShoes
  }, [isShoes])

  // Determine which pages are available
  const hasMultiplePages = showPMPage && showSCCPage
  const hasSinglePage = (showPMPage && !showSCCPage) || (!showPMPage && showSCCPage)
  const hasNoPages = !showPMPage && !showSCCPage

  // Set default page
  React.useEffect(() => {
    if (showPMPage) {
      setCurrentPage("PM")
    } else if (showSCCPage) {
      setCurrentPage("SCC")
    }
  }, [showPMPage, showSCCPage])

  // Get available sizes from product variants
  const availableSizes = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return []

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

    return product.variants
      .map(v => v.title || "")
      .filter(Boolean)
      .sort(universalSort)
  }, [product.variants])

  // Set default selected size to first available size
  React.useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, selectedSize])

  // Convert cm to inches
  const convertToInches = (cmValue: number): number => {
    return Math.round((cmValue / 2.54) * 10) / 10
  }

  // Format measurement value with unit conversion
  const formatMeasurementValue = (value: number): string => {
    if (useInches) {
      return `${convertToInches(value)}"`;
    }
    return `${value}cm`;
  }

  // Render the appropriate diagram component
  const renderDiagram = () => {
    if (!sizingTemplate) return null

    switch (sizingTemplate.diagram_component) {
      case "ShoesMen":
      case "ShoesWomen":
      case "ShoesUnisex":
        // Shoes use a conversion table only, no diagram
        return null

      case "PantsDiagram":
        return <PantsDiagram className="w-full h-auto max-w-md" />

      case "TShirtsDiagram":
        return <TShirtsDiagram className="w-full h-auto max-w-md" />

      case "SweatersDiagram":
        return <SweatersDiagram className="w-full h-auto max-w-md" />

      // TODO: Add more diagram rendering cases here when templates are implemented
      // Example:
      // case "ShirtsDiagram":
      //   return (
      //     <img
      //       src="/images/shirts_sizing_diagram.png"
      //       alt="Shirts sizing diagram"
      //       className="w-full h-auto max-w-md"
      //     />
      //   )

      default:
        return null
    }
  }

  // --- Shoes conversion data ---
  type ShoeRow = { eu: number, usMen: number | null, usWomen: number | null, uk: number, jp: number }

  const SHOES_DATA: ShoeRow[] = [
    { eu: 35,   usMen: null, usWomen: 4.5,  uk: 2,  jp: 22.5 },
    { eu: 36,   usMen: null,  usWomen: 5.5,  uk: 3,  jp: 23 },
    { eu: 37,   usMen: null,  usWomen: 6.5,  uk: 4,  jp: 23.5 },
    { eu: 38,   usMen: null,  usWomen: 7.5,  uk: 4.5,  jp: 24 },
    { eu: 39,   usMen: 6,  usWomen: 8.5,  uk: 5.5,    jp: 24.5 },
    { eu: 40,   usMen: 7,    usWomen: 9.5,    uk: 6.5,  jp: 25 },
    { eu: 41,   usMen: 8,    usWomen: 10.5,   uk: 7.5,  jp: 26 },
    { eu: 42,   usMen: 9,  usWomen: 11.5, uk: 8,    jp: 27 },
    { eu: 43,   usMen: 10,  usWomen: null, uk: 9,    jp: 28 },
    { eu: 44,   usMen: 11,   usWomen: null,   uk: 10,  jp: 29 },
    { eu: 45,   usMen: 12,   usWomen: null,   uk: 11, jp: 30 },
    { eu: 46,   usMen: 13,   usWomen: null,   uk: 12, jp: 31 },
  ]

  const SHOES_MEN = SHOES_DATA.filter(row => row.usMen !== null && row.eu >= 39 && row.eu <= 46.5)
  const SHOES_WOMEN = SHOES_DATA.filter(row => row.usWomen !== null && row.eu >= 35 && row.eu <= 42)
  const SHOES_UNISEX = SHOES_DATA.filter(row => row.eu >= 35 && row.eu <= 46.5)

  // Render measurement overlays
  const renderMeasurementOverlays = () => {
    if (!sizingTemplate) return null
    if (isShoes) return null
    if (!selectedVariantMeasurements) return null

    return Object.entries(sizingTemplate.measurement_points).map(([key, point]) => {
      const measurement = selectedVariantMeasurements[key]

      if (!measurement) return null

      const measurementValue = measurement.value
      const unit = measurement.unit

      // Format value with unit (handle conversion if needed)
      let displayValue = measurementValue
      if (useInches && unit === "cm") {
        displayValue = convertToInches(measurementValue)
      } else if (!useInches && unit === "inches") {
        // Convert inches to cm
        displayValue = Math.round(measurementValue * 2.54 * 10) / 10
      }

      const formattedValue = useInches ? `${displayValue}"` : `${displayValue}cm`

      return (
        <div
          key={key}
          className="absolute text-black text-[10px] sm:text-xs whitespace-nowrap pointer-events-none"
          style={{
            left: `${point.x_percent}%`,
            top: `${point.y_percent}%`,
          }}
        >
          {formattedValue}
        </div>
      )
    })
  }

  // Render Product Measurements page
  const renderPMPage = () => {
    if (!showPMPage) return null

    return (
      <>
        {/* Desktop/Laptop: Horizontal layout */}
        <div className="hidden lg:flex gap-8 items-center justify-center h-full w-full">
          {/* Left side - Diagram with measurements */}
          <div className="flex justify-start items-center flex-1 pr-8">
            <div className="relative w-full flex justify-start items-center">
              {renderDiagram() ?? (
                <div className="w-full flex items-center justify-start text-sm text-gray-500">
                  Diagram unavailable
                </div>
              )}
              {renderMeasurementOverlays()}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex flex-col gap-4 w-80 flex-shrink-0">
            {/* Size selector */}
            <div className="flex flex-col gap-3">
              <span className="text-xs">Displaying measurements for size:</span>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit toggle - horizontal, left-aligned */}
            <div className="flex gap-0">
              <button
                onClick={() => setUseInches(false)}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  !useInches
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => setUseInches(true)}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  useInches
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        {/* Tablet/Phone: Vertically stacked */}
        <div className="flex lg:hidden flex-col gap-6 w-full">
          {/* Diagram */}
            <div className="relative w-full flex justify-center items-center">
              {renderDiagram() ?? (
                <div className="w-full flex items-center justify-center text-sm text-gray-500">
                  Diagram unavailable
                </div>
              )}
              {renderMeasurementOverlays()}
            </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full items-center">
            <div className="flex flex-col gap-3">
              <span className="text-xs">Displaying measurements for size:</span>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit toggle */}
            <div className="flex gap-0">
              <button
                onClick={() => setUseInches(false)}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  !useInches
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => setUseInches(true)}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  useInches
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Render Size Conversion Chart page
  const renderSCCPage = () => {
    if (!showSCCPage) return null

    const heading = sizingTemplate?.category || ""
    const rows = heading === "Shoes Men" ? SHOES_MEN : heading === "Shoes Women" ? SHOES_WOMEN : SHOES_UNISEX
    const isUnisex = heading === "Shoes Unisex"

    // Calculate responsive padding based on number of columns (sizes)
    // Dynamic spacing: more sizes = tighter spacing, fewer sizes = looser spacing (capped)
    const numSizes = rows.length
    let cellPaddingX = 'px-6' // default/max
    let cellPaddingY = 'py-3'

    if (numSizes > 10) {
      cellPaddingX = 'px-2'
      cellPaddingY = 'py-2'
    } else if (numSizes > 8) {
      cellPaddingX = 'px-3'
      cellPaddingY = 'py-2'
    } else if (numSizes > 6) {
      cellPaddingX = 'px-4'
      cellPaddingY = 'py-3'
    }

    const cellPadding = `${cellPaddingX} ${cellPaddingY}`

    return (
      <div className="flex flex-col gap-6 w-full h-full">
        {/* Desktop/Laptop: VERTICAL table - EU/US/UK/JP as ROW headers, sizes as COLUMNS */}
        <div className="hidden lg:flex lg:flex-col w-full h-full pt-4">
          <table className="w-full table-fixed">
            <tbody>
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>EU</th>
                {rows.map((r, idx) => (
                  <td key={`eu-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>{r.eu}</td>
                ))}
              </tr>
              {isUnisex ? (
                <>
                  <tr>
                    <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US Men</th>
                    {rows.map((r, idx) => (
                      <td key={`usmen-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>{r.usMen ?? '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US Women</th>
                    {rows.map((r, idx) => (
                      <td key={`uswomen-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>{r.usWomen ?? '-'}</td>
                    ))}
                  </tr>
                </>
              ) : (
                <tr>
                  <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US</th>
                  {rows.map((r, idx) => (
                    <td key={`us-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>
                      {heading === "Shoes Men" ? r.usMen : r.usWomen}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>UK</th>
                {rows.map((r, idx) => (
                  <td key={`uk-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>{r.uk}</td>
                ))}
              </tr>
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>Japan</th>
                {rows.map((r, idx) => (
                  <td key={`jp-${r.eu}`} className={`${cellPadding} text-center ${idx !== rows.length - 1 ? 'border-r border-gray-200' : ''}`}>{r.jp}</td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 mt-6 text-left">
            Size conversions vary per brand and may deviate from the conversions shown above. For dedicated assistance with sizing, please contact us{' '}
            <a href="https://revetir.com/us/customer-care/contact-us" className="underline hover:text-gray-800">
              here
            </a>
            .
          </p>
        </div>

        {/* Tablet/Phone: HORIZONTAL table - EU/US/UK/JP as COLUMN headers, sizes as ROWS */}
        <div className="block lg:hidden w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className={`${cellPadding} text-center font-medium`}>EU</th>
                {isUnisex ? (
                  <>
                    <th className={`${cellPadding} text-center font-medium`}>US Men&apos;s</th>
                    <th className={`${cellPadding} text-center font-medium`}>US Women&apos;s</th>
                  </>
                ) : (
                  <th className={`${cellPadding} text-center font-medium`}>US</th>
                )}
                <th className={`${cellPadding} text-center font-medium`}>UK</th>
                <th className={`${cellPadding} text-center font-medium`}>Japan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={`${heading}-${r.eu}`} className={idx !== rows.length - 1 ? 'border-b border-gray-200' : ''}>
                  <td className={`${cellPadding} text-center`}>{r.eu}</td>
                  {isUnisex ? (
                    <>
                      <td className={`${cellPadding} text-center`}>{r.usMen ?? '-'}</td>
                      <td className={`${cellPadding} text-center`}>{r.usWomen ?? '-'}</td>
                    </>
                  ) : (
                    <td className={`${cellPadding} text-center`}>
                      {heading === "Shoes Men" ? r.usMen : r.usWomen}
                    </td>
                  )}
                  <td className={`${cellPadding} text-center`}>{r.uk}</td>
                  <td className={`${cellPadding} text-center`}>{r.jp}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 mt-6 text-left">
            Size conversions vary per brand and may deviate from the conversions shown above. For dedicated assistance with sizing, please contact us{' '}
            <a href="https://revetir.com/us/customer-care/contact-us" className="underline hover:text-gray-800">
              here
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} close={close} size="large">
      <Modal.Body>
        {hasNoPages ? (
          /* Sizing Missing - Complete custom layout at Modal.Body level */
          <>
            {/* Desktop: Full height centered layout with X button */}
            <div className="hidden lg:block lg:h-full lg:w-full lg:relative">
              {/* X close button */}
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1 text-gray-700 hover:text-black transition-colors -mt-1 z-10"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Centered content */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <img
                    src="/images/sizing_information_missing.svg"
                    alt="Sizing information notice"
                    className="w-auto h-auto max-w-md mx-auto mb-6"
                    loading="eager"
                  />
                  <p className="text-base text-gray-700 mb-2">
                    Measurements for this product will be available soon
                  </p>
                  <p className="text-sm text-gray-500">
                    For dedicated assistance with sizing, please contact us{' '}
                    <a
                      href="https://revetir.com/us/customer-care/contact-us"
                      className="underline hover:text-gray-800"
                    >
                      here
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: Full height centered layout with close button */}
            <div className="flex lg:hidden flex-col h-[100dvh]">
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                  <img
                    src="/images/sizing_information_missing.svg"
                    alt="Sizing information notice"
                    className="w-auto h-auto max-w-xs mx-auto mb-6"
                    loading="eager"
                  />
                  <p className="text-base text-gray-700 mb-2">
                    Measurements for this product will be available soon
                  </p>
                  <p className="text-sm text-gray-500">
                    For dedicated assistance with sizing, please contact us{' '}
                    <a
                      href="https://revetir.com/us/customer-care/contact-us"
                      className="underline hover:text-gray-800"
                    >
                      here
                    </a>
                  </p>
                </div>
              </div>

              {/* Close button - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-white">
                <button
                  onClick={close}
                  className="w-[90%] py-3 bg-black text-white text-sm font-medium uppercase hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full relative">
            {/* Desktop/Laptop Layout */}
            <div className="hidden lg:flex lg:flex-col lg:h-full lg:px-4 lg:py-3">
              {/* Header - title and X button in top corners */}
              <div className="flex justify-between items-start mb-4">
                {/* Page titles/toggle */}
                <div className="flex gap-6">
                  {showPMPage && (
                    <button
                      onClick={() => setCurrentPage("PM")}
                      className={`text-sm uppercase font-medium pb-1 transition-all ${
                        currentPage === "PM"
                          ? 'border-b-2 border-black'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Product Measurements
                    </button>
                  )}
                  {showSCCPage && (
                    <button
                      onClick={() => setCurrentPage("SCC")}
                      className={`text-sm uppercase font-medium pb-1 transition-all ${
                        currentPage === "SCC"
                          ? 'border-b-2 border-black'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Size Conversion Chart
                    </button>
                  )}
                </div>

                {/* X close button */}
                <button
                  onClick={close}
                  className="p-1 text-gray-700 hover:text-black transition-colors -mt-1"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main content */}
              <div className={`flex-1 flex flex-col overflow-hidden ${currentPage === "SCC" ? "mr-8" : ""}`}>
                {currentPage === "PM" && renderPMPage()}
                {currentPage === "SCC" && renderSCCPage()}
              </div>
            </div>

            {/* Tablet/Phone Layout */}
            <div className="flex lg:hidden flex-col h-[100dvh]">
              {/* Header - title at top, only if pages exist */}
              <div className="px-6 py-4 flex-shrink-0 text-center">
                {/* Show dropdown only if both pages exist */}
                {hasMultiplePages ? (
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(e.target.value as PageType)}
                    className="w-full px-4 py-2 border border-gray-300 text-sm uppercase font-medium text-center"
                  >
                    {showPMPage && <option value="PM">Product Measurements</option>}
                    {showSCCPage && <option value="SCC">Size Conversion Chart</option>}
                  </select>
                ) : (
                  /* Show underlined text if only one page exists */
                  <div className="text-sm uppercase font-medium border-b-2 border-black pb-1 inline-block">
                    {showPMPage ? "Product Measurements" : "Size Conversion Chart"}
                  </div>
                )}
              </div>

              {/* Main content - scrollable with padding for fixed button */}
              <div className="flex-1 overflow-hidden px-6 pb-20">
                {currentPage === "PM" && renderPMPage()}
                {currentPage === "SCC" && renderSCCPage()}
              </div>

              {/* Close button - Fixed at bottom of modal */}
              <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-white">
                <button
                  onClick={close}
                  className="w-[90%] py-3 bg-black text-white text-sm font-medium uppercase hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default SizingModal
