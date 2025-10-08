"use client"

import React, { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import { getSizingTemplate, SizingTemplate } from "@lib/data/sizing-templates"
import { getProductCategory, getBestSizingCategory, getProductTemplateCategory } from "@lib/util/sizing-utils"
import { SizingMissingDiagram } from "@modules/common/icons/sizing-diagrams"
import X from "@modules/common/icons/x"

interface SizingModalProps {
  isOpen: boolean
  close: () => void
  product: HttpTypes.StoreProduct
}

type PageType = "PM" | "SCC"

const SizingModal: React.FC<SizingModalProps> = ({ isOpen, close, product }) => {
  // Get the product category and template category
  const productCategory = getProductCategory(product)
  const templateCategory = getProductTemplateCategory(product)

  console.log('🔍 SIZING MODAL DEBUG:')
  console.log('  Product:', product.title)
  console.log('  Product categories:', product.categories)
  console.log('  Product category (first):', productCategory)
  console.log('  Template category:', templateCategory)

  // State for size and unit toggles
  const [selectedSize, setSelectedSize] = useState<string>("S")
  const [useInches, setUseInches] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<PageType>("PM")

  // Get the sizing template for this category
  const sizingTemplate = useMemo(() => {
    const template = getSizingTemplate(templateCategory)
    console.log('  Sizing template found:', template?.category, '(diagram:', template?.diagram_component, ')')
    return template
  }, [templateCategory])

  // Get product measurements from metadata
  const productMeasurements = useMemo(() => {
    console.log('🔍 Sizing Debug - Product metadata:', product.metadata)
    if (!product.metadata?.sizing) {
      console.log('❌ No sizing metadata found')
      return null
    }
    console.log('✅ Sizing metadata found:', product.metadata.sizing)

    // Handle case where sizing metadata is a JSON string
    let sizingData = product.metadata.sizing
    if (typeof sizingData === 'string') {
      try {
        sizingData = JSON.parse(sizingData)
        console.log('🔄 Parsed JSON string to object:', sizingData)
      } catch (error) {
        console.error('❌ Failed to parse sizing JSON string:', error)
        return null
      }
    }

    return sizingData as any
  }, [product.metadata])

  // Check if shoes category
  const isShoes = sizingTemplate?.diagram_component === "ShoesMen" ||
                  sizingTemplate?.diagram_component === "ShoesWomen" ||
                  sizingTemplate?.diagram_component === "ShoesUnisex"

  // Page visibility logic
  const showPMPage = useMemo(() => {
    // PM page requires BOTH measurements AND template
    return !!(productMeasurements?.measurements && sizingTemplate && !isShoes)
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

  // Get available sizes from product measurements
  const availableSizes = useMemo(() => {
    if (!productMeasurements?.measurements) return ["S", "M", "L", "XL"]
    const firstMeasurement = Object.values(productMeasurements.measurements)[0] as Record<string, number>
    return Object.keys(firstMeasurement)
  }, [productMeasurements])

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
      case "TShirtDiagram":
        return (
          <img
            src="/images/shirts_sizing_diagram.png"
            alt="Shirts sizing diagram"
            className="w-full h-auto max-w-md"
          />
        )
      case "TrousersDiagram":
        return (
          <img
            src="/images/pants_sizing_diagram.png"
            alt="Pants sizing diagram"
            className="w-full h-auto max-w-md"
          />
        )
      case "SweatshirtsDiagram":
        return (
          <img
            src="/images/sweaters_sizing_diagram.png"
            alt="Sweaters sizing diagram"
            className="w-full h-auto max-w-md"
          />
        )
      default:
        return null
    }
  }

  // --- Shoes conversion data ---
  type ShoeRow = { eu: number, usMen: number | null, usWomen: number | null, uk: number, jpCm: number }

  const SHOES_DATA: ShoeRow[] = [
    { eu: 35,   usMen: null, usWomen: 4.5,  uk: 2,  jpCm: 21.5},
    { eu: 36,   usMen: null,  usWomen: 5.5,  uk: 3,  jpCm: 22.5 },
    { eu: 37,   usMen: null,  usWomen: 6.5,  uk: 4,  jpCm: 23 },
    { eu: 38,   usMen: null,  usWomen: 7.5,  uk: 4.5,  jpCm: 24 },
    { eu: 39,   usMen: 6,  usWomen: 8.5,  uk: 5.5,    jpCm: 24.5 },
    { eu: 40,   usMen: 7,    usWomen: 9.5,    uk: 6.5,  jpCm: 25 },
    { eu: 41,   usMen: 8,    usWomen: 10.5,   uk: 7.5,  jpCm: 26 },
    { eu: 42,   usMen: 9,  usWomen: 11.5, uk: 8,    jpCm: 27 },
    { eu: 43,   usMen: 10,  usWomen: null, uk: 9,    jpCm: 28 },
    { eu: 44,   usMen: 11,   usWomen: null,   uk: 10,  jpCm: 29 },
    { eu: 45,   usMen: 12,   usWomen: null,   uk: 11, jpCm: 30 },
    { eu: 46,   usMen: 13,   usWomen: null,   uk: 12, jpCm: 31 },
  ]

  const SHOES_MEN = SHOES_DATA.filter(row => row.usMen !== null && row.eu >= 39 && row.eu <= 46.5)
  const SHOES_WOMEN = SHOES_DATA.filter(row => row.usWomen !== null && row.eu >= 35 && row.eu <= 42)
  const SHOES_UNISEX = SHOES_DATA.filter(row => row.eu >= 35 && row.eu <= 46.5)

  const formatJp = (cm: number) => {
    if (useInches) {
      const inches = Math.round((cm / 2.54) * 10) / 10
      return `${inches}"`
    }
    return `${cm}cm`
  }

  // Render measurement overlays
  const renderMeasurementOverlays = () => {
    if (!sizingTemplate) return null
    if (isShoes) return null

    console.log('🎯 Rendering overlays for template:', templateCategory)
    console.log('📏 Template measurement points:', Object.keys(sizingTemplate.measurement_points))
    console.log('👕 Product measurements available:', productMeasurements?.measurements ? Object.keys(productMeasurements.measurements) : 'None')
    console.log('📐 Selected size:', selectedSize)

    return Object.entries(sizingTemplate.measurement_points).map(([key, point]) => {
      let measurementValue: number | string = "-"
      let source = "none"

      // Priority 1: Use product metadata measurements if available
      if (productMeasurements?.measurements?.[key]?.[selectedSize]) {
        measurementValue = productMeasurements.measurements[key][selectedSize]
        source = "product metadata"
      }
      // Priority 2: Fall back to template size chart only if no product metadata
      else if (!productMeasurements?.measurements && sizingTemplate.size_chart[selectedSize]?.[key]) {
        measurementValue = sizingTemplate.size_chart[selectedSize][key]
        source = "template default"
      }

      console.log(`📊 ${key} (${selectedSize}): ${measurementValue} (from ${source})`)

      const x = `${point.x_percent}%`
      const y = `${point.y_percent}%`
      const transform = `translate(${point.offset_x}px, ${point.offset_y}px)`

      return (
        <div
          key={key}
          className="absolute bg-white/80 text-black text-xs whitespace-nowrap"
          style={{
            left: x,
            top: y,
            transform: transform,
          }}
        >
          {typeof measurementValue === 'number' ? formatMeasurementValue(measurementValue) : measurementValue}
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
        <div className="hidden small:flex gap-8 items-center justify-center h-full w-full">
          {/* Left side - Diagram with measurements */}
          <div className="flex justify-center items-center flex-1">
            <div className="relative w-full flex justify-center">
              {renderDiagram()}
              {renderMeasurementOverlays()}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex flex-col gap-6 w-64 flex-shrink-0">
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
        <div className="flex small:hidden flex-col gap-6 w-full">
          {/* Diagram */}
          <div className="relative w-full flex justify-center">
            {renderDiagram()}
            {renderMeasurementOverlays()}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full">
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

    const heading = templateCategory
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
        <div className="hidden small:flex small:flex-col w-full h-full pt-4">
          <table className="w-full table-fixed">
            <tbody>
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>EU</th>
                {rows.map((r) => (
                  <td key={`eu-${r.eu}`} className={`${cellPadding} text-center`}>{r.eu}</td>
                ))}
              </tr>
              {isUnisex ? (
                <>
                  <tr>
                    <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US Men&apos;s</th>
                    {rows.map((r) => (
                      <td key={`usmen-${r.eu}`} className={`${cellPadding} text-center`}>{r.usMen ?? '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US Women&apos;s</th>
                    {rows.map((r) => (
                      <td key={`uswomen-${r.eu}`} className={`${cellPadding} text-center`}>{r.usWomen ?? '-'}</td>
                    ))}
                  </tr>
                </>
              ) : (
                <tr>
                  <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>US</th>
                  {rows.map((r) => (
                    <td key={`us-${r.eu}`} className={`${cellPadding} text-center`}>
                      {heading === "Shoes Men" ? r.usMen : r.usWomen}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>UK</th>
                {rows.map((r) => (
                  <td key={`uk-${r.eu}`} className={`${cellPadding} text-center`}>{r.uk}</td>
                ))}
              </tr>
              <tr>
                <th className={`${cellPadding} text-center font-medium border-r border-gray-200 w-24`}>Japan</th>
                {rows.map((r) => (
                  <td key={`jp-${r.eu}`} className={`${cellPadding} text-center`}>{formatJp(r.jpCm)}</td>
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
        <div className="block small:hidden w-full overflow-x-auto">
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
                  <td className={`${cellPadding} text-center`}>{formatJp(r.jpCm)}</td>
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
        <div className="flex flex-col h-full relative">
          {/* Desktop/Laptop Layout */}
          <div className="hidden small:flex small:flex-col small:h-full small:px-4 small:py-3">
            {hasNoPages ? (
              /* Sizing Missing Layout - Use absolute positioning to fill parent modal */
              <>
                {/* X close button - positioned in the top-right corner of the modal */}
                <button
                  onClick={close}
                  className="absolute top-3 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors -mt-1"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>

                {/* Centered content container */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
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
              </>
            ) : (
              /* SCC/PM Layout - Unchanged */
              <>
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
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors -mt-1"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Main content */}
                <div className={`flex-1 flex flex-col overflow-y-auto ${currentPage === "SCC" ? "mr-8" : ""}`}>
                  {currentPage === "PM" && renderPMPage()}
                  {currentPage === "SCC" && renderSCCPage()}
                </div>
              </>
            )}
          </div>

          {/* Tablet/Phone Layout */}
          <div className="flex small:hidden flex-col h-screen">
            {/* Header - title at top, only if pages exist */}
            {!hasNoPages && (
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
            )}

            {/* Main content - scrollable with padding for fixed button */}
            <div className="flex-1 overflow-y-auto px-6 pb-20">
              {hasNoPages ? (
                /* Fallback - centered text */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-base text-gray-700 mb-2">Measurements for this product will be available soon</p>
                    <p className="text-sm text-gray-500">
                      If you&apos;re not sure about your size, please contact us{' '}
                      <a href="https://revetir.com/us/customer-care/contact-us" className="underline hover:text-gray-800">
                        here
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {currentPage === "PM" && renderPMPage()}
                  {currentPage === "SCC" && renderSCCPage()}
                </>
              )}
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
      </Modal.Body>
    </Modal>
  )
}

export default SizingModal
