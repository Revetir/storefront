"use client"

import React, { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import { getSizingTemplate, SizingTemplate } from "@lib/data/sizing-templates"
import { getProductCategory, getBestSizingCategory, getProductTemplateCategory } from "@lib/util/sizing-utils"
import { GenericDiagram } from "@modules/common/icons/sizing-diagrams"

interface SizingModalProps {
  isOpen: boolean
  close: () => void
  product: HttpTypes.StoreProduct
}

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
    if (!sizingTemplate) return <GenericDiagram className="w-64 h-auto" />

    switch (sizingTemplate.diagram_component) {
      case "Shoes":
        // Shoes use a conversion table only, no diagram
        return null
      case "TShirtDiagram":
        return (
          <img
            src="/images/shirts_sizing_diagram.png"
            alt="Shirts sizing diagram"
            className="w-64 h-auto"
          />
        )
      case "TrousersDiagram":
        return (
          <img
            src="/images/pants_sizing_diagram.png"
            alt="Pants sizing diagram"
            className="w-64 h-auto"
          />
        )
      case "SweatshirtsDiagram":
        return (
          <img
            src="/images/sweaters_sizing_diagram.png"
            alt="Sweaters sizing diagram"
            className="w-64 h-auto"
          />
        )
      case "GenericDiagram":
        return <GenericDiagram className="w-128 h-auto" />

      default:
        return <GenericDiagram className="w-128 h-auto" />
    }
  }

  // --- Shoes conversion data and rendering ---
  type ShoeRow = { eu: number, us: number, uk: number, jpCm: number }

  const SHOES_MEN: ShoeRow[] = [
    { eu: 39,   us: 6.0,  uk: 5.0,  jpCm: 24.0 },
    { eu: 39.5, us: 6.5,  uk: 5.5,  jpCm: 24.5 },
    { eu: 40,   us: 7.0,  uk: 6.0,  jpCm: 25.0 },
    { eu: 40.5, us: 7.5,  uk: 6.5,  jpCm: 25.5 },
    { eu: 41,   us: 8.0,  uk: 7.0,  jpCm: 26.0 },
    { eu: 41.5, us: 8.5,  uk: 7.5,  jpCm: 26.5 },
    { eu: 42,   us: 9.0,  uk: 8.0,  jpCm: 27.0 },
    { eu: 42.5, us: 9.5,  uk: 8.5,  jpCm: 27.5 },
    { eu: 43,   us: 10.0, uk: 9.0,  jpCm: 28.0 },
    { eu: 43.5, us: 10.5, uk: 9.5,  jpCm: 28.5 },
    { eu: 44,   us: 11.0, uk: 10.0, jpCm: 29.0 },
    { eu: 44.5, us: 11.5, uk: 10.5, jpCm: 29.5 },
    { eu: 45,   us: 12.0, uk: 11.0, jpCm: 30.0 },
    { eu: 45.5, us: 12.5, uk: 11.5, jpCm: 30.5 },
    { eu: 46,   us: 13.0, uk: 12.0, jpCm: 31.0 },
  ]

  // Women's mapping per requirement: 39 EU => US 4.5; include half sizes 35–42 EU
  const buildWomenRows = (): ShoeRow[] => {
    const rows: ShoeRow[] = []
    const jpBaseAt39 = 25.5 // cm around EU39 women's typical foot length; used for JP baseline
    for (let eu = 35; eu <= 42; eu++) {
      const delta = eu - 39
      const us = 4.5 + delta
      const uk = us - 2.5 // typical women's US-UK offset
      const jp = jpBaseAt39 + delta * 0.5 // 0.5 cm per EU step
      rows.push({ eu, us: Number(us.toFixed(1)), uk: Number(uk.toFixed(1)), jpCm: Number(jp.toFixed(1)) })
      if (eu !== 42) {
        const euHalf = eu + 0.5
        const usHalf = us + 0.5
        const ukHalf = uk + 0.5
        const jpHalf = jp + 0.25
        rows.push({ eu: Number(euHalf.toFixed(1)), us: Number(usHalf.toFixed(1)), uk: Number(ukHalf.toFixed(1)), jpCm: Number(jpHalf.toFixed(2)) })
      }
    }
    return rows
  }

  const SHOES_WOMEN: ShoeRow[] = buildWomenRows()

  const SHOES_UNISEX: ShoeRow[] = [
    ...SHOES_WOMEN,
    ...SHOES_MEN,
  ].filter((row, idx, arr) => arr.findIndex(r => r.eu === row.eu && r.us === row.us && r.uk === row.uk) === idx)
   .sort((a, b) => a.eu - b.eu)

  const isShoes = sizingTemplate?.diagram_component === "Shoes"

  const renderShoesTable = () => {
    if (!isShoes) return null
    const heading = templateCategory
    const rows = heading === "Shoes Men" ? SHOES_MEN : heading === "Shoes Women" ? SHOES_WOMEN : SHOES_UNISEX

    const formatJp = (cm: number) => {
      if (useInches) {
        const inches = Math.round((cm / 2.54) * 10) / 10
        return `${inches}\"`
      }
      return `${cm}cm`
    }

    return (
      <div className="mt-6 w-full">
        <h3 className="text-lg font-semibold mb-3">Shoe Size Conversion</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">EU</th>
                <th className="border border-gray-200 px-4 py-2 text-left">US</th>
                <th className="border border-gray-200 px-4 py-2 text-left">UK</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Japan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${heading}-${r.eu}-${r.us}`} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{r.eu}</td>
                  <td className="border border-gray-200 px-4 py-2">{r.us}</td>
                  <td className="border border-gray-200 px-4 py-2">{r.uk}</td>
                  <td className="border border-gray-200 px-4 py-2">{formatJp(r.jpCm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Render measurement overlays
  const renderMeasurementOverlays = () => {
    if (!sizingTemplate) return null

    // Shoes do not render measurement overlays on a diagram
    if (sizingTemplate.diagram_component === "Shoes") return null

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

  // Render size chart
  const renderSizeChart = () => {
    if (!sizingTemplate) return null

    // Shoes use a conversion table instead
    if (sizingTemplate.diagram_component === "Shoes") return null

    const sizes = Object.keys(sizingTemplate.size_chart)
    const measurements = Object.keys(sizingTemplate.size_chart[sizes[0]] || {})

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Size Chart</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Size</th>
                {measurements.map(measurement => (
                  <th key={measurement} className="border border-gray-200 px-4 py-2 text-left capitalize">
                    {measurement}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map(size => (
                <tr key={size} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{size}</td>
                  {measurements.map(measurement => (
                    <td key={measurement} className="border border-gray-200 px-4 py-2">
                      {sizingTemplate.size_chart[size][measurement]}{sizingTemplate.units}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} close={close} size="large">
      <Modal.Body>
        <div className="flex flex-col h-full min-h-[500px] p-12">
        {/* Header row - title on left, unit toggle on right */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          <h2 className="text-base uppercase">{isShoes ? "Shoe Sizes" : "Product Measurements"}</h2>
          <div className="flex sm:flex-row flex-col gap-0">
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

          {/* Main content - two column layout with increased spacing */}
          <div className="flex gap-24 flex-1 items-center justify-center pt-2">
            {/* Left side - Diagram with measurements */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {renderDiagram()}
                {renderMeasurementOverlays()}
              </div>
            </div>

            {/* Right side - Controls */}
            {!isShoes && productMeasurements && (
              <div className="flex-1 flex flex-col gap-8 max-w-sm">
                {/* Size selector */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs">Displaying measurements for size:</span>
                  <div className="flex gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
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
                
              </div>
            )}
          </div>

          {/* Shoes conversion table (full-width below) */}
          {isShoes && (
            <div className="mt-4">
              {renderShoesTable()}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SizingModal
