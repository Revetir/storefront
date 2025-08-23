"use client"

import React, { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import { getSizingTemplate, SizingTemplate } from "@lib/data/sizing-templates"
import { getProductCategory, getBestSizingCategory, getProductTemplateCategory } from "@lib/util/sizing-utils"
import { TShirtDiagram, TrousersDiagram, NecklaceDiagram, GenericDiagram } from "@modules/common/icons/sizing-diagrams"

interface SizingModalProps {
  isOpen: boolean
  close: () => void
  product: HttpTypes.StoreProduct
}

const SizingModal: React.FC<SizingModalProps> = ({ isOpen, close, product }) => {
  // Get the product category and template category
  const productCategory = getProductCategory(product)
  const templateCategory = getProductTemplateCategory(product)
  
  // State for size and unit toggles
  const [selectedSize, setSelectedSize] = useState<string>("S")
  const [useInches, setUseInches] = useState<boolean>(false)
  
  // Get the sizing template for this category
  const sizingTemplate = useMemo(() => {
    return getSizingTemplate(templateCategory)
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
    if (!sizingTemplate) return <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">No diagram available</div>
    
    switch (sizingTemplate.diagram_component) {
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
      
      default:
        return <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">No diagram available</div>
    }
  }

  // Render measurement overlays
  const renderMeasurementOverlays = () => {
    if (!sizingTemplate) return null

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
          <h2 className="text-base uppercase">Product Measurements</h2>
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
            {productMeasurements && (
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
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SizingModal
