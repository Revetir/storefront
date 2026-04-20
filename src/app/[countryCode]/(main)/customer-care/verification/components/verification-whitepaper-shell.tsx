"use client"

import Image from "next/image"
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react"

type GraphicSlot = {
  id: string
  label: string
  size: "wide" | "square" | "portrait" | "strip"
}

type DossierSection = {
  id: string
  tabLabel: string
  mobileTabLabel?: string
  heading: string
  bodyToken: string
  slots: GraphicSlot[]
}

type Point = {
  x: number
  y: number
}

type AnalysisCheckpoint = {
  id: string
  anchor: Point
  bend: Point
  end: Point
  panelSide: "left" | "right"
  title: string
  methodsUsed: string
}

type AnalysisGraphicBounds = {
  width: number
  height: number
  viewBoxMinX: number
}

type AnalysisPage = {
  id: string
  label: string
  enabled: boolean
  bounds: AnalysisGraphicBounds
  checkpoints: AnalysisCheckpoint[]
  mobileLeftShiftCheckpointIds?: Set<string>
  panelVerticalTranslateByCheckpointId?: Record<string, string>
  renderGraphic: () => ReactNode
}

type ReconciliationChecklistSection = {
  title: string
  checks: string[]
}

type AssuranceStampItem = {
  id: string
  label: string
  excerpt: string
}

type ViewMode = "dossier" | "whitepaper"

const COVER_DISMISSED_SESSION_KEY = "verification-dossier-cover-dismissed"
const WHITEPAPER_VIEW_ENABLED = false
const INTAKE_INTRO_TEXT =
  "Intake is the initial filtering stage where every item is evaluated for general eligibility to be sold on our platform. At this stage, seller qualification, product metadata, and listing integrity are reviewed together to ensure the submitted listing is complete, consistent, and supported by sufficient detail."
const ANALYSIS_INTRO_TEXT =
  "Analysis is the granular item-level review stage where each submitted listing is evaluated against known brand and model characteristics. At this stage, shape, materials, construction details, and identity markers are digitally examined in context to assess whether the product is consistent with expected design standards and free from well-known counterfeit patterns."
const ASSURANCE_LOOP_ROTATION_SECONDS = 8.4
const MOBILE_ASSURANCE_HOLD_DELAY_MS = 180
const ASSURANCE_HINT_DISMISS_HOLD_MS = 320
const MOBILE_ASSURANCE_MOVE_TOLERANCE_PX = 8
const MOBILE_ASSURANCE_SCROLL_CANCEL_PX = 10
const ASSURANCE_STAMP_ITEMS: AssuranceStampItem[] = [
  {
    id: "customer-feedback",
    label: "CUSTOMER FEEDBACK",
    excerpt:
      "Customer feedback is vital to maintaining and improving the accuracy of our verification system. We invite customers to share post-delivery experiences—positive and negative—through public reviews and direct support channels, and manually evaluate all feedback case-by-case. These inputs are not only used to resolve issues, but also to identify broader sentiment patterns, proactively strengthen our review standards, and improve the trustworthiness of future listings across the platform.",
  },
  {
    id: "issue-resolution",
    label: "ISSUE RESOLUTION",
    excerpt:
      "Issue resolution is our commitment to upholding end-to-end accountability across the platform. When issues arise—whether related to listing accuracy, product flaws, or delivery—we take immediate action to investigate and remedy points of failure. We offer free returns for any items that do not meet our standards, including defective or inauthentic items, and provide appropriate compensation in cases of service disruptions, such as order processing delays.",
  },
  {
    id: "user-reports",
    label: "USER REPORTS",
    excerpt:
      "User reports extend our verification process beyond customers by enabling the greater community to react to and influence listings shown across the platform. We encourage users to flag items they believe may be inaccurate or incomplete, and evaluate reports individually to verify claims. These reports help surface potential risks earlier and reinforce listing integrity, keeping our verification system well-informed and unbiased.",
  },
  {
    id: "platform-monitoring",
    label: "PLATFORM MONITORING",
    excerpt:
      "Platform monitoring ensures ongoing oversight across all listings and seller activity on the platform. We continuously review listings for inconsistencies in product data, imagery, and structure, and track seller behavior for patterns that may indicate elevated risk or non-compliance. Detected anomalies are flagged for further review and, where necessary, prompt corrective action. This continuous layer of semi-automated monitoring helps maintain listing integrity at scale and reinforces the consistency and reliability of our verification system.",
  },
]
const ASSURANCE_STAMP_FALLBACK_ITEM: AssuranceStampItem = {
  id: "customer-feedback",
  label: "CUSTOMER FEEDBACK",
  excerpt: "",
}
const ASSURANCE_PANEL_HEADERS_BY_ITEM_ID: Record<string, string> = {
  "customer-feedback": "CLOSING THE LOOP",
  "issue-resolution": "MAKING THINGS RIGHT",
  "user-reports": "EXTENDING COVERAGE",
  "platform-monitoring": "CONSTANT VIGILANCE",
}
const ASSURANCE_STAMP_TRACK_RADIUS = 50
const ASSURANCE_STAMP_TRACK_CIRCUMFERENCE = 2 * Math.PI * ASSURANCE_STAMP_TRACK_RADIUS
const ASSURANCE_STAMP_LABEL_GAP = "\u00A0\u00A0\u00A0\u00A0"
const ASSURANCE_STAMP_RING_TEXT = ASSURANCE_STAMP_ITEMS.map(
  (item) => `${item.label}${ASSURANCE_STAMP_LABEL_GAP}`
).join("")
const ASSURANCE_STAMP_RING_SEGMENTS = (() => {
  const totalChars = ASSURANCE_STAMP_RING_TEXT.length
  let cursor = 0

  return ASSURANCE_STAMP_ITEMS.map((item) => {
    const centerCharIndex = cursor + item.label.length / 2
    const centerAngleDeg = (centerCharIndex / totalChars) * 360

    cursor += item.label.length + ASSURANCE_STAMP_LABEL_GAP.length

    return {
      ...item,
      centerAngleDeg,
    }
  })
})()

const ASSURANCE_INITIAL_ITEM_ID = ASSURANCE_STAMP_ITEMS[0]?.id ?? ""
const ASSURANCE_INITIAL_ROTATION_DEG = (() => {
  const initialItem = ASSURANCE_STAMP_RING_SEGMENTS.find((item) => item.id === ASSURANCE_INITIAL_ITEM_ID)
  if (!initialItem) return 0
  return (360 - (initialItem.centerAngleDeg % 360)) % 360
})()

const getUprightAssuranceItemId = (rotationDeg: number) => {
  let activeItemId = ASSURANCE_STAMP_RING_SEGMENTS[0]?.id ?? ASSURANCE_STAMP_ITEMS[0]?.id ?? ""
  let closestDistance = Number.POSITIVE_INFINITY

  for (const item of ASSURANCE_STAMP_RING_SEGMENTS) {
    const normalizedAngle = ((item.centerAngleDeg + rotationDeg) % 360 + 360) % 360
    const distanceFromTop = Math.min(normalizedAngle, 360 - normalizedAngle)
    if (distanceFromTop < closestDistance) {
      closestDistance = distanceFromTop
      activeItemId = item.id
    }
  }

  return activeItemId
}
const RECONCILIATION_INTRO_TEXT =
  "Reconciliation is the pre-shipment control stage where the approved listing is directly matched against the physical item to confirm identity, condition, and completeness prior to dispatch. At this stage, the item received is verified against its original listing across all critical attributes, including model, size, materials, tags, accessories, and packaging, to ensure exact correspondence. Any discrepancies, flaws, or condition deviations are identified and evaluated, while material composition is validated as a non-negotiable pass/fail criterion. Seller performance signals, including item accuracy and fulfillment timing, are also tracked to inform ongoing trust scoring and future intake decisions."
const ASSURANCE_INTRO_TEXT =
  "Assurance is the post-sale trust and feedback stage where each completed transaction is used to validate outcomes, resolve issues, and continuously refine the system. At this stage, delivered items and their corresponding listings are re-evaluated in light of customer feedback, with any reported concerns investigated against prior verification records. Ongoing platform-level scrutiny is supported by user-submitted authenticity reports, periodic re-review of active listings, and continuous monitoring for inconsistencies in product data, imagery, and seller behavior across the marketplace. Confirmed outcomes are fed back into the system to strengthen future detection, improve seller accountability, and refine risk models over time."
const RECONCILIATION_CHECKLIST_SECTIONS: ReconciliationChecklistSection[] = [
  {
    title: "Identity Match",
    checks: [
      "Model/SKU correspondence",
      "Size and variant alignment",
      "Colorway and pattern match",
      "Serial/reference code parity",
      "Listing image consistency",
    ],
  },
  {
    title: "Condition Assessment",
    checks: [
      "Wear grade vs listing claim",
      "Stain/discoloration scan",
      "Tear/pull/seam damage check",
      "Alteration or repair review",
      "Odor/moisture contamination",
    ],
  },
  {
    title: "Materials & Construction",
    checks: [
      "Fiber composition validation",
      "Fabric handfeel verification",
      "Stitch density consistency",
      "Hardware finish authenticity",
      "Structural reinforcement check",
    ],
  },
  {
    title: "Tags & Labeling",
    checks: [
      "Brand tag typography match",
      "Care label sequence validity",
      "Country-origin consistency",
      "Size/lot code legibility",
      "Attachment method conformity",
    ],
  },
  {
    title: "Accessories & Packaging",
    checks: [
      "Accessory count completeness",
      "Dust bag/box correctness",
      "Insert/card marker review",
      "Replacement part disclosure",
      "Protective wrap completeness",
    ],
  },
  {
    title: "Final Controls",
    checks: [
      "Discrepancy severity scoring",
      "Material pass/fail gate",
      "Seller accuracy signal update",
      "Fulfillment timing recorded",
      "Dispatch authorization lock",
    ],
  },
]

const createAnalysisBounds = (width: number, height: number, centerlineX: number): AnalysisGraphicBounds => ({
  width,
  height,
  viewBoxMinX: centerlineX - width / 2,
})

const renderClothingAnalysisGraphic = () => (
  <>
    <path
      d="M216 44H430L524 134L478 202L438 166V458H210V166L170 202L124 134Z"
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M300 44C309 91 337 91 346 44"
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
    <rect
      x={309}
      y={52}
      width={28}
      height={17}
      fill="none"
      stroke="black"
      strokeWidth="1.2"
    />
    <line
      x1={314}
      y1={60}
      x2={332}
      y2={60}
      stroke="black"
      strokeWidth="0.9"
    />
    <image
      href="/images/logo_transparent.svg"
      x={271}
      y={148}
      width={106}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
    />
    <rect
      x={98}
      y={272}
      width={84}
      height={136}
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
    <path
      d="M118 272V244C118 226 132 214 140 214C148 214 162 226 162 244V272"
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
    <text
      x={140}
      y={338}
      textAnchor="middle"
      fill="black"
      fontSize="11"
      letterSpacing="0.02em"
    >
      @shoprevetir
    </text>
  </>
)

const renderShoeAnalysisGraphic = () => (
  <>
    <g transform="translate(82 78) scale(0.95)">
      <image
        href="/images/logo_transparent.svg"
        x={334}
        y={166}
        width={88}
        height={22}
        opacity={0.9}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      />
      <path
        d="M222.432 34.5L327.932 91L451.432 138L492.432 120.5"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M74.4317 56C107.9 87.0973 144.12 82.9684 178.932 55.5"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M287.932 69L183.932 194.5"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M328.932 91.5L265.432 202.5"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.931626 175.5C0.903697 104.018 13.4744 75.4022 29.4316 23C48.1501 21.2739 56.6133 24.6579 69.9316 34.5L79.9316 82.5C112.112 109.82 157.361 91.6892 182.932 64C157.319 10.4468 217.154 0.5 257.932 0.5L492.932 120.5C525.391 124.487 596.015 125.54 598.932 170C412.877 242.393 193.113 189.789 0.931626 175.5Z"
        fill="none"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.931702 176C-0.379977 209.331 0.599094 225.054 13.9317 237C208.654 240.568 417.669 270.83 604.432 202.5C606.895 198.39 613.528 162.791 598.932 170"
        fill="none"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </>
)

const renderAccessoriesAnalysisGraphic = () => {
  const leftChainBeads = [
    { x: 291.6, y: 3.4, r: 5.6 },
    { x: 295, y: 26, r: 5.6 },
    { x: 298.4, y: 48.6, r: 5.6 },
    { x: 301.9, y: 71.1, r: 5.6 },
    { x: 305.3, y: 93.7, r: 5.6 },
    { x: 308.7, y: 116.3, r: 5.6 },
    { x: 312.1, y: 138.9, r: 5.6 },
    { x: 315.6, y: 161.4, r: 5.6 },
    { x: 319, y: 184, r: 5.6 },
  ]
  const rightChainBeads = [
    { x: 396.4, y: 3.4, r: 5.6 },
    { x: 393, y: 26, r: 5.6 },
    { x: 389.6, y: 48.6, r: 5.6 },
    { x: 386.1, y: 71.1, r: 5.6 },
    { x: 382.7, y: 93.7, r: 5.6 },
    { x: 379.3, y: 116.3, r: 5.6 },
    { x: 375.9, y: 138.9, r: 5.6 },
    { x: 372.4, y: 161.4, r: 5.6 },
    { x: 369, y: 184, r: 5.6 },
  ]

  return (
    <>
      <path
        d="M295 0L291.6 3.4L295 26L298.4 48.6L301.9 71.1L305.3 93.7L308.7 116.3L312.1 138.9L315.6 161.4L319 184"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M393 0L396.4 3.4L393 26L389.6 48.6L386.1 71.1L382.7 93.7L379.3 116.3L375.9 138.9L372.4 161.4L369 184"
        fill="none"
        stroke="black"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {leftChainBeads.map((bead) => (
        <circle
          key={`accessory-left-bead-${bead.y}`}
          cx={bead.x}
          cy={bead.y}
          r={bead.r}
          fill="white"
          stroke="black"
          strokeWidth="1.2"
        />
      ))}
      {rightChainBeads.map((bead) => (
        <circle
          key={`accessory-right-bead-${bead.y}`}
          cx={bead.x}
          cy={bead.y}
          r={bead.r}
          fill="white"
          stroke="black"
          strokeWidth="1.2"
        />
      ))}
      <image
        href="/images/logo_transparent.svg"
        x={347}
        y={245.5}
        width={34}
        height={10}
        opacity={0.9}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
      />
      <g transform="translate(224 391.5) scale(0.04 -0.04)">
        <path
          d="M2920 5253 c-70 -24 -183 -108 -270 -199 -46 -50 -82 -80 -85 -73
          -12 19 -97 49 -155 56 -87 9 -163 -17 -222 -77 -27 -26 -48 -52 -48 -57 0 -6
          14 -13 31 -17 63 -12 230 -213 297 -356 98 -211 190 -450 242 -628 36 -123 32
          -130 -70 -102 -89 25 -285 121 -429 210 -130 81 -268 212 -297 282 -10 27 -22
          48 -25 48 -24 0 -78 -53 -101 -99 -49 -96 -30 -218 45 -299 12 -13 17 -26 11
          -30 -5 -5 -39 -32 -76 -61 -157 -122 -212 -263 -153 -389 27 -58 123 -161 193
          -207 23 -15 42 -29 42 -32 0 -2 -12 -27 -27 -56 -23 -44 -28 -64 -28 -132 0
          -68 4 -89 28 -137 15 -31 42 -69 60 -84 29 -24 32 -25 36 -9 10 53 62 110 176
          192 213 154 412 237 609 256 l49 4 -7 -256 c-3 -141 -8 -272 -11 -291 -2 -19
          -9 -78 -16 -130 -35 -297 -150 -688 -283 -957 -62 -125 -171 -292 -246 -376
          -51 -56 -52 -58 -35 -77 29 -32 115 -69 183 -78 93 -13 181 5 273 55 4 2 19
          -18 34 -44 43 -73 140 -196 182 -229 120 -95 191 -98 288 -13 41 37 175 193
          215 251 l24 36 51 -26 c46 -25 59 -27 165 -26 124 0 170 14 235 68 l30 26 -45
          47 c-79 83 -158 196 -227 323 -149 272 -279 700 -323 1063 -13 110 -31 620
          -22 629 10 9 196 -18 262 -37 74 -23 249 -110 335 -167 139 -93 201 -151 251
          -234 11 -18 14 -17 48 15 78 75 99 226 46 336 -13 28 -24 53 -24 56 -1 4 27
          28 61 53 116 88 184 181 199 272 15 97 -95 256 -246 355 l-24 16 26 31 c95
          113 93 273 -5 357 -22 19 -44 35 -48 35 -4 0 -17 -21 -29 -46 -60 -123 -231
          -259 -500 -396 -155 -79 -288 -127 -311 -112 -16 10 -9 43 45 206 95 288 200
          533 282 660 57 89 177 214 220 230 19 6 34 15 34 19 0 22 -53 77 -100 103 -50
          28 -63 31 -140 31 -76 0 -91 -4 -142 -32 l-57 -31 -16 25 c-25 37 -154 161
          -205 196 -57 40 -147 77 -185 76 -16 0 -50 -7 -75 -16z"
          fill="none"
          stroke="black"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  )
}

const ANALYSIS_PAGES: AnalysisPage[] = [
  {
    id: "clothing",
    label: "Clothing",
    enabled: true,
    bounds: createAnalysisBounds(760, 500, 324),
    mobileLeftShiftCheckpointIds: new Set(["clothing-shape", "clothing-material"]),
    panelVerticalTranslateByCheckpointId: {
      "clothing-material": "-72%",
    },
    checkpoints: [
      {
        id: "clothing-shape",
        anchor: { x: 250, y: 120 },
        bend: { x: 184, y: 88 },
        end: { x: 70, y: 88 },
        panelSide: "right",
        title: "Shape/Silhouette",
        methodsUsed: `Garment outline extraction and geometric profile comparison
Measurement-based dimensional ratio analysis
Deviation scoring against known model templates`,
      },
      {
        id: "clothing-label",
        anchor: { x: 323, y: 58 },
        bend: { x: 454, y: 30 },
        end: { x: 656, y: 30 },
        panelSide: "left",
        title: "Brand Label",
        methodsUsed: `Brand typography comparison against reference glyph sets
Label proportion and placement normalization
Weave pattern and material classification`,
      },
      {
        id: "clothing-design",
        anchor: { x: 324, y: 174 },
        bend: { x: 454, y: 206 },
        end: { x: 656, y: 206 },
        panelSide: "left",
        title: "Main Design",
        methodsUsed: `Region-of-interest segmentation
Logo vector shape and proportion comparison to known logo geometry
Print/embroidery classification using surface and edge feature extraction`,
      },
      {
        id: "clothing-care",
        anchor: { x: 423, y: 352 },
        bend: { x: 468, y: 270 },
        end: { x: 656, y: 270 },
        panelSide: "left",
        title: "Care Label",
        methodsUsed: `Structured label parsing by symbol sequence and layout hierarchy
Typographic pattern comparison
Instruction set validation against known brand formats`,
      },
      {
        id: "clothing-material",
        anchor: { x: 250, y: 458 },
        bend: { x: 178, y: 468 },
        end: { x: 72, y: 468 },
        panelSide: "right",
        title: "Material & Stitching",
        methodsUsed: `Texture and surface pattern analysis
Stitch density and uniformity quantification
Seam construction pattern recognition`,
      },
      {
        id: "clothing-packaging",
        anchor: { x: 134, y: 302 },
        bend: { x: 108, y: 248 },
        end: { x: 30, y: 248 },
        panelSide: "right",
        title: "Accessories & Packaging",
        methodsUsed: `Component identification and benchmarking against expected inclusions
Textual feature extraction and typographic comparison
Construction and assembly similarity gating`,
      },
    ],
    renderGraphic: renderClothingAnalysisGraphic,
  },
  {
    id: "shoes",
    label: "Shoes",
    enabled: true,
    bounds: createAnalysisBounds(760, 500, 380),
    mobileLeftShiftCheckpointIds: new Set(["shoe-silhouette", "shoe-heel"]),
    checkpoints: [
      {
        id: "shoe-silhouette",
        anchor: { x: 296, y: 202 },
        bend: { x: 198, y: 230 },
        end: { x: 44, y: 230 },
        panelSide: "right",
        title: "Silhouette",
        methodsUsed: `Side-profile contour extraction and last-shape comparison
Toe spring and collar pitch ratio analysis
Deviation scoring against known low-top reference geometry`,
      },
      {
        id: "shoe-tongue",
        anchor: { x: 300, y: 98 },
        bend: { x: 246, y: 62 },
        end: { x: 124, y: 62 },
        panelSide: "right",
        title: "Tongue",
        methodsUsed: `Label patch proportion and placement normalization
Typographic spacing comparison against reference glyph sets
Tongue height and fold behavior consistency checks`,
      },
      {
        id: "shoe-laces",
        anchor: { x: 434, y: 153 },
        bend: { x: 478, y: 86 },
        end: { x: 688, y: 86 },
        panelSide: "left",
        title: "Lace Field",
        methodsUsed: `Eyestay angle and spacing analysis
Lace row density benchmarking
Panel-edge alignment checks across the throat opening`,
      },
      {
        id: "shoe-quarter",
        anchor: { x: 582, y: 210 },
        bend: { x: 622, y: 166 },
        end: { x: 722, y: 166 },
        panelSide: "left",
        title: "Panels & Stitching",
        methodsUsed: `Panel seam path comparison against reference patterns
Stitch run uniformity and spacing quantification
Overlay shape matching across sidewall sections`,
      },
      {
        id: "shoe-sole",
        anchor: { x: 575, y: 273 },
        bend: { x: 628, y: 344 },
        end: { x: 702, y: 344 },
        panelSide: "left",
        title: "Sole",
        methodsUsed: `Midsole profile segmentation and foxing height comparison
Heel-to-toe tooling proportion analysis
Outsole edge and stitch channel consistency checks`,
      },
      {
        id: "shoe-heel",
        anchor: { x: 128, y: 126 },
        bend: { x: 92, y: 104 },
        end: { x: 34, y: 104 },
        panelSide: "right",
        title: "Heel Counter",
        methodsUsed: `Heel tab and counter geometry comparison
Lining finish and collar construction classification
Expected box and insert inclusion gating against known issue patterns`,
      },
    ],
    renderGraphic: renderShoeAnalysisGraphic,
  },
  {
    id: "accessories",
    label: "Accessories",
    enabled: true,
    bounds: createAnalysisBounds(760, 500, 344),
    mobileLeftShiftCheckpointIds: new Set(["accessory-shape", "accessory-surface-finish"]),
    checkpoints: [
      {
        id: "accessory-shape",
        anchor: { x: 344, y: 220 },
        bend: { x: 248, y: 165 },
        end: { x: 112, y: 165 },
        panelSide: "right",
        title: "Shape",
        methodsUsed: `Object outline extraction and comparison against known product profiles
Measurement-based dimensional ratio analysis
Deviation scoring against known model templates`,
      },
      {
        id: "accessory-brand-markings",
        anchor: { x: 386, y: 248 },
        bend: { x: 484, y: 222 },
        end: { x: 618, y: 222 },
        panelSide: "left",
        title: "Brand Markings",
        methodsUsed: `Logo and hallmark detection across relevant regions
Brand typography comparison against reference glyph sets
Symbol placement and alignment validation`,
      },
      {
        id: "accessory-surface-finish",
        anchor: { x: 328, y: 309 },
        bend: { x: 262, y: 356 },
        end: { x: 76, y: 356 },
        panelSide: "right",
        title: "Surface & Finish",
        methodsUsed: `High-resolution texture analysis
Finish classification
Consistency checks across components and materials`,
      },
      {
        id: "accessory-functionality",
        anchor: { x: 376, y: 151 },
        bend: { x: 500, y: 92 },
        end: { x: 698, y: 92 },
        panelSide: "left",
        title: "Functionality",
        methodsUsed: `Basic operation check of functional components
Assessment of structural consistency with intended use`,
      },
    ],
    renderGraphic: renderAccessoriesAnalysisGraphic,
  },
]

const ENABLED_ANALYSIS_PAGES = ANALYSIS_PAGES.filter((page) => page.enabled)
const INTAKE_INPUT_COLUMNS = [
  {
    title: "Seller Qualification",
    items: [
      "Reputation and independent reviews",
      "Transaction history and platform activity",
      "Category access and selling restrictions",
      "Account risk signals",
    ],
  },
  {
    title: "Product Metadata",
    items: [
      "Brand and model (SKU)",
      "Category, size, and variant details",
      "Included accessories and packaging",
      "Item condition", "Product-brand risk class",
    ],
  },
  {
    title: "Listing Integrity",
    items: [
      "Original listing content",
      "Required detail images",
      "No references to replicas or dupes",
    ],
  },
]
const INTAKE_CHART_BARS = [
  {
    labelTop: "Seller",
    labelBottom: "",
    minScale: 0.38,
    maxScale: 0.8,
    duration: "3.2s",
    delay: "0s",
  },
  {
    labelTop: "Product",
    labelBottom: "",
    minScale: 0.28,
    maxScale: 0.7,
    duration: "4s",
    delay: "0.15s",
  },
  {
    labelTop: "Listing",
    labelBottom: "",
    minScale: 0.46,
    maxScale: 0.9,
    duration: "3.5s",
    delay: "0.05s",
  },
]
const INTAKE_PASS_THRESHOLD = 0.6

const DOSSIER_SECTIONS: DossierSection[] = [
  {
    id: "intake",
    tabLabel: "INTAKE",
    heading: "INTAKE",
    bodyToken: "Reserved for section write-up",
    slots: [
      { id: "intake-process", label: "Process Block Placeholder", size: "wide" },
      { id: "intake-reference", label: "Reference Block Placeholder", size: "square" },
      { id: "intake-log", label: "Intake Log Placeholder", size: "strip" },
    ],
  },
  {
    id: "analysis",
    tabLabel: "ANALYSIS",
    heading: "ANALYSIS",
    bodyToken: ANALYSIS_INTRO_TEXT,
    slots: [
      { id: "analysis-grid", label: "Comparison Matrix Placeholder", size: "wide" },
      { id: "analysis-token", label: "Review Notes Placeholder", size: "square" },
      { id: "analysis-model", label: "Confidence Notes Placeholder", size: "portrait" },
    ],
  },
  {
    id: "decision",
    tabLabel: "RECONCILIATION",
    mobileTabLabel: "RECONCIL.",
    heading: "RECONCILIATION",
    bodyToken: RECONCILIATION_INTRO_TEXT,
    slots: [
      { id: "decision-map", label: "Decision Logic Placeholder", size: "wide" },
      { id: "decision-flag", label: "Exception Queue Placeholder", size: "square" },
      { id: "decision-proof", label: "Evidence Notes Placeholder", size: "portrait" },
    ],
  },
  {
    id: "assurance",
    tabLabel: "ASSURANCE",
    heading: "ASSURANCE",
    bodyToken: ASSURANCE_INTRO_TEXT,
    slots: [
      { id: "assurance-cert", label: "Assurance Record Placeholder", size: "wide" },
      { id: "assurance-archive", label: "Archive Notes Placeholder", size: "square" },
      { id: "assurance-timeline", label: "Timeline Placeholder", size: "strip" },
    ],
  },
]

const sizeToClass: Record<GraphicSlot["size"], string> = {
  wide: "aspect-[16/6] min-[431px]:aspect-[16/7]",
  square: "aspect-[16/9] min-[431px]:aspect-square",
  portrait: "aspect-[16/10] min-[431px]:aspect-[4/5]",
  strip: "aspect-[16/5] min-[431px]:aspect-[12/2]",
}

type ModeControlsProps = {
  viewMode: ViewMode
  onSelect: (mode: ViewMode) => void
  compact?: boolean
  whitepaperEnabled?: boolean
}

function ModeControls({ viewMode, onSelect, compact = false, whitepaperEnabled = true }: ModeControlsProps) {
  const base = compact
    ? "w-[104px] whitespace-nowrap px-1.5 py-1 text-center text-[8px] tracking-[0.05em] min-[431px]:w-auto"
    : "w-[116px] px-3 py-1.5 text-center text-[11px] tracking-[0.05em] min-[431px]:w-auto"
  const isWhitepaperDisabled = !whitepaperEnabled

  return (
    <div className="inline-flex flex-col border border-black bg-white min-[431px]:flex-row">
      <button
        type="button"
        onClick={() => onSelect("dossier")}
        className={`${base} uppercase ${
          viewMode === "dossier" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        Dossier View
      </button>
      <button
        type="button"
        onClick={() => {
          if (!isWhitepaperDisabled) onSelect("whitepaper")
        }}
        disabled={isWhitepaperDisabled}
        aria-disabled={isWhitepaperDisabled}
        className={`border-t border-black min-[431px]:border-l min-[431px]:border-t-0 ${base} uppercase ${
          isWhitepaperDisabled
            ? "cursor-not-allowed bg-white text-black/25"
            : viewMode === "whitepaper"
              ? "bg-black text-white"
              : "bg-white text-black"
        }`}
      >
        White Paper View
      </button>
    </div>
  )
}

function ReconciliationChecklistGraphic({ className }: { className?: string }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const cardWidth = 250
  const cardHeight = 289
  const cardRadius = 12
  const cardPerimeter = 2 * (cardWidth + cardHeight - 2 * cardRadius) + 2 * Math.PI * cardRadius

  const toggleChecklistItem = (sectionIndex: number, checkIndex: number) => {
    const key = `${sectionIndex}-${checkIndex}`
    setCheckedItems((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const isChecklistItemChecked = (sectionIndex: number, checkIndex: number) =>
    Boolean(checkedItems[`${sectionIndex}-${checkIndex}`])

  return (
    <svg
      viewBox="0 0 930 900"
      className={className ?? "h-auto w-full"}
      role="img"
      aria-label="Reconciliation checklist clipboard"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <defs>
        <linearGradient id="reconciliation-rainbow-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff003c" />
          <stop offset="16.6%" stopColor="#ff7a00" />
          <stop offset="33.3%" stopColor="#ffd500" />
          <stop offset="50%" stopColor="#12d66a" />
          <stop offset="66.6%" stopColor="#0094ff" />
          <stop offset="83.3%" stopColor="#6a00ff" />
          <stop offset="100%" stopColor="#ff00a8" />
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 0.5 0.5"
            to="360 0.5 0.5"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <rect x={24} y={31} width={882} height={835} rx={26} fill="white" stroke="black" strokeWidth={2} />
      <rect x={316} y={20} width={298} height={79} rx={18} fill="white" stroke="black" strokeWidth={2} />
      <rect x={380} y={38} width={170} height={28} rx={7} fill="none" stroke="black" strokeWidth={1.4} />
      <line x1={394} y1={52} x2={536} y2={52} stroke="black" strokeWidth={1.1} />

      {RECONCILIATION_CHECKLIST_SECTIONS.map((section, sectionIndex) => {
        const column = sectionIndex % 3
        const row = Math.floor(sectionIndex / 3)
        const cardX = 58 + column * 272
        const cardY = 156 + row * 322
        const headingY = cardY + 36
        const sectionComplete = section.checks.every((_, checkIndex) =>
          isChecklistItemChecked(sectionIndex, checkIndex)
        )

        return (
          <g key={`reconciliation-section-${section.title}`}>
            <rect
              x={cardX}
              y={cardY}
              width={cardWidth}
              height={cardHeight}
              rx={cardRadius}
              fill="white"
              stroke={sectionComplete ? "transparent" : "black"}
              strokeWidth={1.2}
              style={{ transition: "stroke 240ms ease" }}
            />
            <rect
              x={cardX}
              y={cardY}
              width={cardWidth}
              height={cardHeight}
              rx={cardRadius}
              fill="none"
              stroke="url(#reconciliation-rainbow-stroke)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={cardPerimeter}
              strokeDashoffset={sectionComplete ? 0 : cardPerimeter}
              style={{ transition: "stroke-dashoffset 800ms ease-out, opacity 200ms ease", opacity: sectionComplete ? 1 : 0 }}
            />
            <text
              x={cardX + 14}
              y={headingY}
              fill="black"
              fontSize={13}
              letterSpacing="0.06em"
              style={{ textTransform: "uppercase" }}
            >
              {section.title}
            </text>
            <line
              x1={cardX + 12}
              y1={headingY + 15}
              x2={cardX + 238}
              y2={headingY + 15}
              stroke="black"
              strokeWidth={0.9}
            />

            {section.checks.map((check, checkIndex) => {
              const checkY = headingY + 46 + checkIndex * 32
              const isChecked = isChecklistItemChecked(sectionIndex, checkIndex)

                return (
                  <g key={`reconciliation-check-${section.title}-${check}`}>
                    <rect
                      x={cardX + 11}
                      y={checkY - 18}
                      width={224}
                      height={20}
                      fill="transparent"
                      stroke="none"
                      role="checkbox"
                      aria-checked={isChecked}
                      aria-label={`${section.title}: ${check}`}
                    tabIndex={0}
                    onPointerDown={(event) => {
                      event.preventDefault()
                    }}
                    onClick={(event) => {
                      toggleChecklistItem(sectionIndex, checkIndex)
                      if ("blur" in event.currentTarget && typeof event.currentTarget.blur === "function") {
                        event.currentTarget.blur()
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        toggleChecklistItem(sectionIndex, checkIndex)
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <rect
                    x={cardX + 13}
                    y={checkY - 16}
                    width={12}
                    height={12}
                    fill="none"
                    stroke="black"
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                  {isChecked ? (
                    <path
                      d={`M ${cardX + 15} ${checkY - 10} L ${cardX + 19} ${checkY - 6} L ${cardX + 24} ${checkY - 13}`}
                      fill="none"
                      stroke="black"
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                  ) : null}
                  <text
                    x={cardX + 32}
                    y={checkY - 5}
                    fill="black"
                    fontSize={12.5}
                    letterSpacing="0.01em"
                    pointerEvents="none"
                  >
                    {check}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

type AnalysisPageGraphicProps = {
  page: AnalysisPage
  activeCheckpointId: string | null
  showHintGlow: boolean
  onCheckpointClick: (id: string) => void
  getPanelPosition: (checkpoint: AnalysisCheckpoint, page: AnalysisPage) => CSSProperties
  setActivePanelRef: (element: HTMLDivElement | null) => void
  renderFloatingPanel?: boolean
  className?: string
}

function AnalysisCheckpointPanelContent({ checkpoint }: { checkpoint: AnalysisCheckpoint }) {
  return (
    <div className="border border-black bg-white p-2 text-left shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <p className="text-[9px] uppercase tracking-[0.05em] text-black/70">
        Checkpoint
      </p>
      <p className="mt-1 text-[11px] leading-snug text-black/85">
        {checkpoint.title}
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.05em] text-black/70">
        Protocol
      </p>
      <ul className="mt-1 text-[11px] leading-snug text-black/80">
        {checkpoint.methodsUsed
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => (
            <li key={`${checkpoint.id}-${line}`} className="max-[430px]:!text-left">
              {line}
            </li>
          ))}
      </ul>
    </div>
  )
}

function AnalysisPageGraphic({
  page,
  activeCheckpointId,
  showHintGlow,
  onCheckpointClick,
  getPanelPosition,
  setActivePanelRef,
  renderFloatingPanel = true,
  className,
}: AnalysisPageGraphicProps) {
  const { bounds } = page
  const gradientId = `analysis-yellow-ring-gradient-${page.id}`

  return (
    <div className={`relative ${className ?? ""}`.trim()}>
      <svg
        viewBox={`${bounds.viewBoxMinX} 0 ${bounds.width} ${bounds.height}`}
        className="block h-auto w-full md:h-full md:w-auto md:max-h-full md:max-w-full"
        role="img"
        aria-label={`${page.label} analysis checkpoint map`}
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9ca3af" stopOpacity="0" />
            <stop offset="64%" stopColor="#9ca3af" stopOpacity="0" />
            <stop offset="82%" stopColor="#9ca3af" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9ca3af" stopOpacity="0" />
          </radialGradient>
        </defs>

        {page.renderGraphic()}

        {page.checkpoints.map((checkpoint) => {
          const isActive = activeCheckpointId === checkpoint.id
          const markerStroke = isActive ? 1.25 : 0.9

          return (
            <g key={`analysis-checkpoint-${page.id}-${checkpoint.id}`}>
              <polyline
                points={`${checkpoint.anchor.x},${checkpoint.anchor.y} ${checkpoint.bend.x},${checkpoint.bend.y} ${checkpoint.end.x},${checkpoint.end.y}`}
                fill="none"
                stroke="black"
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={checkpoint.end.x}
                cy={checkpoint.end.y}
                r={20}
                fill="white"
                stroke="black"
                strokeWidth={markerStroke}
              />
              <path
                d={`
                  M ${checkpoint.end.x} ${checkpoint.end.y}
                  m -33 0
                  a 33 33 0 1 0 66 0
                  a 33 33 0 1 0 -66 0
                  M ${checkpoint.end.x} ${checkpoint.end.y}
                  m -23 0
                  a 23 23 0 1 1 46 0
                  a 23 23 0 1 1 -46 0
                `}
                fill={`url(#${gradientId})`}
                fillRule="evenodd"
                clipRule="evenodd"
                className={`analysis-hint-glow ${showHintGlow ? "is-active" : ""}`}
              />
              {isActive ? (
                <circle
                  cx={checkpoint.end.x}
                  cy={checkpoint.end.y}
                  r={28}
                  fill="none"
                  stroke="black"
                  strokeWidth="0.6"
                  strokeDasharray="2.3 2.3"
                />
              ) : null}
              <circle
                cx={checkpoint.end.x}
                cy={checkpoint.end.y}
                r={20}
                fill="transparent"
                stroke="transparent"
                strokeWidth="0"
                data-analysis-hotspot="true"
                aria-label={`Toggle ${checkpoint.title} details`}
                onPointerDown={(event) => {
                  event.preventDefault()
                }}
                onClick={() => {
                  onCheckpointClick(checkpoint.id)
                }}
                className="analysis-checkpoint-hotspot cursor-pointer"
              />
            </g>
          )
        })}
      </svg>

      {renderFloatingPanel
        ? page.checkpoints.map((checkpoint) => {
        if (checkpoint.id !== activeCheckpointId) return null

        return (
          <div
            key={`analysis-panel-${page.id}-${checkpoint.id}`}
            className="pointer-events-none absolute z-20 w-[10rem] min-[431px]:w-[12rem] md:w-[13rem]"
            style={getPanelPosition(checkpoint, page)}
            ref={setActivePanelRef}
          >
            <AnalysisCheckpointPanelContent checkpoint={checkpoint} />
          </div>
        )
      })
        : null}
    </div>
  )
}

export default function VerificationWhitepaperShell() {
  const [activeSectionId, setActiveSectionId] = useState<string>(DOSSIER_SECTIONS[0].id)
  const [viewMode, setViewMode] = useState<ViewMode>("dossier")
  const [showCover, setShowCover] = useState(true)
  const [intakeAllBarsAboveThreshold, setIntakeAllBarsAboveThreshold] = useState(false)
  const [mobileIntakeSlide, setMobileIntakeSlide] = useState(0)
  const [activeAnalysisPageId, setActiveAnalysisPageId] = useState<string>(ENABLED_ANALYSIS_PAGES[0]?.id ?? "")
  const [mobileAnalysisSlide, setMobileAnalysisSlide] = useState(0)
  const [isAnalysisHintDismissed, setIsAnalysisHintDismissed] = useState(false)
  const [isAssuranceHintDismissed, setIsAssuranceHintDismissed] = useState(false)
  const [isAssuranceLoopHeld, setIsAssuranceLoopHeld] = useState(false)
  const [activeAssuranceItemId, setActiveAssuranceItemId] = useState<string>(
    getUprightAssuranceItemId(ASSURANCE_INITIAL_ROTATION_DEG)
  )
  const [activeAnalysisCheckpointId, setActiveAnalysisCheckpointId] = useState<string | null>(null)
  const [isAnalysisHintHovered, setIsAnalysisHintHovered] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const intakeBarRefs = useRef<Array<HTMLDivElement | null>>([])
  const mobileIntakeBarRefs = useRef<Array<HTMLDivElement | null>>([])
  const mobileIntakeCarouselRef = useRef<HTMLDivElement | null>(null)
  const mobileAnalysisCarouselRef = useRef<HTMLDivElement | null>(null)
  const dossierSectionScrollRef = useRef<HTMLDivElement | null>(null)
  const activeAnalysisPanelRef = useRef<HTMLDivElement | null>(null)
  const assuranceLoopRingRef = useRef<SVGGElement | null>(null)
  const assuranceLoopFrameRef = useRef<number | null>(null)
  const assuranceLoopLastTimestampRef = useRef<number | null>(null)
  const assuranceLoopRotationRef = useRef(ASSURANCE_INITIAL_ROTATION_DEG)
  const assurancePointerIdRef = useRef<number | null>(null)
  const assuranceHoldTimerRef = useRef<number | null>(null)
  const assuranceHintDismissTimerRef = useRef<number | null>(null)
  const assurancePointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const assuranceHoldActivatedRef = useRef(false)

  const activeSection = useMemo(
    () => DOSSIER_SECTIONS.find((section) => section.id === activeSectionId) ?? DOSSIER_SECTIONS[0],
    [activeSectionId]
  )
  const activeAnalysisPageIndex = useMemo(() => {
    const index = ENABLED_ANALYSIS_PAGES.findIndex((page) => page.id === activeAnalysisPageId)
    return index >= 0 ? index : 0
  }, [activeAnalysisPageId])
  const activeAnalysisPage =
    ENABLED_ANALYSIS_PAGES[activeAnalysisPageIndex] ?? ENABLED_ANALYSIS_PAGES[0]!
  const activeAnalysisCheckpoint = useMemo(
    () => activeAnalysisPage.checkpoints.find((checkpoint) => checkpoint.id === activeAnalysisCheckpointId) ?? null,
    [activeAnalysisCheckpointId, activeAnalysisPage]
  )
  const activeAssuranceItem = useMemo(
    () =>
      ASSURANCE_STAMP_ITEMS.find((item) => item.id === activeAssuranceItemId) ??
      ASSURANCE_STAMP_ITEMS[0] ??
      ASSURANCE_STAMP_FALLBACK_ITEM,
    [activeAssuranceItemId]
  )
  const activeAssurancePanelHeader =
    ASSURANCE_PANEL_HEADERS_BY_ITEM_ID[activeAssuranceItem.id] ?? "CLOSING THE LOOP"
  const isDossierView = !WHITEPAPER_VIEW_ENABLED || viewMode === "dossier"

  useEffect(() => {
    if (WHITEPAPER_VIEW_ENABLED || viewMode === "dossier") return
    setViewMode("dossier")
  }, [viewMode])

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (navEntry?.type === "reload") {
      sessionStorage.removeItem(COVER_DISMISSED_SESSION_KEY)
    }

    const dismissed = sessionStorage.getItem(COVER_DISMISSED_SESSION_KEY) === "1"
    setShowCover(!dismissed)
  }, [])

  useEffect(() => {
    if (!(viewMode === "dossier" && activeSectionId === "intake")) {
      setIntakeAllBarsAboveThreshold(false)
      return
    }

    const readScaleY = (element: HTMLDivElement) => {
      const transform = window.getComputedStyle(element).transform
      if (!transform || transform === "none") return 1

      if (transform.startsWith("matrix3d(")) {
        const values = transform
          .slice(9, -1)
          .split(",")
          .map((value) => Number(value.trim()))
        return Number.isFinite(values[5]) ? values[5] : 1
      }

      if (transform.startsWith("matrix(")) {
        const values = transform
          .slice(7, -1)
          .split(",")
          .map((value) => Number(value.trim()))
        return Number.isFinite(values[3]) ? values[3] : 1
      }

      return 1
    }

    let frame = 0

    const tick = () => {
      const getVisibleBars = (refs: Array<HTMLDivElement | null>) =>
        refs
          .slice(0, INTAKE_CHART_BARS.length)
          .filter((element): element is HTMLDivElement => Boolean(element))
          .filter((element) => element.getClientRects().length > 0)

      const desktopBars = getVisibleBars(intakeBarRefs.current)
      const mobileBars = getVisibleBars(mobileIntakeBarRefs.current)
      const bars =
        desktopBars.length === INTAKE_CHART_BARS.length
          ? desktopBars
          : mobileBars.length === INTAKE_CHART_BARS.length
            ? mobileBars
            : []

      const allAboveThreshold =
        bars.length === INTAKE_CHART_BARS.length &&
        bars.every((bar) => readScaleY(bar) > INTAKE_PASS_THRESHOLD)

      setIntakeAllBarsAboveThreshold((current) =>
        current === allAboveThreshold ? current : allAboveThreshold
      )

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [activeSectionId, viewMode])

  useEffect(() => {
    if (!(viewMode === "dossier" && activeSectionId === "intake")) return

    setMobileIntakeSlide(0)
    const carousel = mobileIntakeCarouselRef.current
    if (carousel) {
      carousel.scrollTo({ left: 0, behavior: "auto" })
    }
  }, [activeSectionId, viewMode])

  useEffect(() => {
    setActiveAnalysisCheckpointId(null)
    setIsAnalysisHintHovered(false)
  }, [activeAnalysisPageId])

  useEffect(() => {
    if (activeAnalysisCheckpointId) {
      setIsAnalysisHintHovered(false)
    }
  }, [activeAnalysisCheckpointId])

  useEffect(() => {
    if (viewMode === "dossier" && activeSectionId === "analysis") return
    setIsAnalysisHintHovered(false)
  }, [activeSectionId, viewMode])

  useEffect(() => {
    if (!(viewMode === "dossier" && activeSectionId === "analysis")) return
    if (!isMobileViewport) return

    setMobileAnalysisSlide((current) => (current === activeAnalysisPageIndex ? current : activeAnalysisPageIndex))

    const carousel = mobileAnalysisCarouselRef.current
    if (!carousel) return

    const targetLeft = carousel.clientWidth * activeAnalysisPageIndex
    if (Math.abs(carousel.scrollLeft - targetLeft) < 1) return

    carousel.scrollTo({ left: targetLeft, behavior: "auto" })
  }, [activeAnalysisPageIndex, activeSectionId, isMobileViewport, viewMode])

  useEffect(() => {
    if (!activeAnalysisCheckpointId) return
    if (viewMode !== "dossier" || activeSectionId !== "analysis") return
    if (!isMobileViewport) return

    const scrollContainer = dossierSectionScrollRef.current
    const panel = activeAnalysisPanelRef.current
    if (!scrollContainer || !panel) return

    const frame = window.requestAnimationFrame(() => {
      const containerRect = scrollContainer.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const topPadding = 12
      const bottomPadding = 12

      const overlapsTop = panelRect.top < containerRect.top + topPadding
      const overlapsBottom = panelRect.bottom > containerRect.bottom - bottomPadding
      if (!overlapsTop && !overlapsBottom) return

      const delta = overlapsTop
        ? panelRect.top - (containerRect.top + topPadding)
        : panelRect.bottom - (containerRect.bottom - bottomPadding)

      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + delta,
        behavior: "smooth",
      })
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [activeAnalysisCheckpointId, activeSectionId, isMobileViewport, viewMode])

  useEffect(() => {
    if (!activeAnalysisCheckpointId) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-analysis-hotspot="true"]')) return
      setActiveAnalysisCheckpointId(null)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [activeAnalysisCheckpointId])

  useEffect(() => {
    if (viewMode !== "dossier") return
    if (typeof window === "undefined") return
    if (window.matchMedia("(min-width: 431px)").matches) return

    const scrollContainer = dossierSectionScrollRef.current
    if (!scrollContainer) return

    scrollContainer.scrollTo({ top: 0, behavior: "auto" })
  }, [activeSectionId, viewMode])

  useEffect(() => {
    if (viewMode === "dossier" && activeSectionId === "assurance") return
    resetAssurancePointerGesture()
    setIsAssuranceLoopHeld(false)
  }, [activeSectionId, viewMode])

  useEffect(() => {
    return () => {
      clearAssuranceHoldTimer()
      clearAssuranceHintDismissTimer()
    }
  }, [])

  useEffect(() => {
    if (viewMode !== "dossier" || activeSectionId !== "assurance") return
    const ring = assuranceLoopRingRef.current
    if (!ring) return

    assuranceLoopRotationRef.current = ASSURANCE_INITIAL_ROTATION_DEG
    ring.setAttribute("transform", `rotate(${ASSURANCE_INITIAL_ROTATION_DEG.toFixed(3)} 50 50)`)
    const uprightId = getUprightAssuranceItemId(ASSURANCE_INITIAL_ROTATION_DEG)
    setActiveAssuranceItemId((current) => (current === uprightId ? current : uprightId))
  }, [activeSectionId, viewMode])

  useEffect(() => {
    const shouldAnimate =
      viewMode === "dossier" && activeSectionId === "assurance" && isAssuranceLoopHeld

    if (!shouldAnimate) {
      if (assuranceLoopFrameRef.current !== null) {
        window.cancelAnimationFrame(assuranceLoopFrameRef.current)
        assuranceLoopFrameRef.current = null
      }
      assuranceLoopLastTimestampRef.current = null
      return
    }

    const ring = assuranceLoopRingRef.current
    if (!ring) return

    const degreesPerMillisecond = 360 / (ASSURANCE_LOOP_ROTATION_SECONDS * 1000)

    const tick = (timestamp: number) => {
      const lastTimestamp = assuranceLoopLastTimestampRef.current ?? timestamp
      const delta = timestamp - lastTimestamp
      assuranceLoopLastTimestampRef.current = timestamp

      const nextRotation = (assuranceLoopRotationRef.current - delta * degreesPerMillisecond + 360) % 360
      assuranceLoopRotationRef.current = nextRotation
      ring.setAttribute("transform", `rotate(${nextRotation.toFixed(3)} 50 50)`)

      const uprightId = getUprightAssuranceItemId(nextRotation)
      setActiveAssuranceItemId((current) => (current === uprightId ? current : uprightId))

      assuranceLoopFrameRef.current = window.requestAnimationFrame(tick)
    }

    assuranceLoopFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (assuranceLoopFrameRef.current !== null) {
        window.cancelAnimationFrame(assuranceLoopFrameRef.current)
        assuranceLoopFrameRef.current = null
      }
      assuranceLoopLastTimestampRef.current = null
    }
  }, [activeSectionId, isAssuranceLoopHeld, viewMode])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches)
    }

    syncViewport()

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport)
      return () => mediaQuery.removeEventListener("change", syncViewport)
    }

    mediaQuery.addListener(syncViewport)
    return () => mediaQuery.removeListener(syncViewport)
  }, [])

  const jumpToPaperSection = (id: string) => {
    setActiveSectionId(id)
    const element = document.getElementById(`paper-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const enterDossier = () => {
    setShowCover(false)
    sessionStorage.setItem(COVER_DISMISSED_SESSION_KEY, "1")
  }

  const onMobileIntakeCarouselScroll = () => {
    const carousel = mobileIntakeCarouselRef.current
    if (!carousel) return

    const slideWidth = Math.max(carousel.clientWidth, 1)
    const nextSlide = Math.max(0, Math.min(1, Math.round(carousel.scrollLeft / slideWidth)))
    setMobileIntakeSlide((current) => (current === nextSlide ? current : nextSlide))
  }

  const scrollToMobileIntakeSlide = (index: number) => {
    const carousel = mobileIntakeCarouselRef.current
    if (!carousel) return

    const clamped = Math.max(0, Math.min(1, index))
    carousel.scrollTo({ left: carousel.clientWidth * clamped, behavior: "smooth" })
    setMobileIntakeSlide(clamped)
  }

  const clearAssuranceHoldTimer = () => {
    if (assuranceHoldTimerRef.current === null) return
    window.clearTimeout(assuranceHoldTimerRef.current)
    assuranceHoldTimerRef.current = null
  }

  const clearAssuranceHintDismissTimer = () => {
    if (assuranceHintDismissTimerRef.current === null) return
    window.clearTimeout(assuranceHintDismissTimerRef.current)
    assuranceHintDismissTimerRef.current = null
  }

  const startAssuranceHintDismissTimer = () => {
    if (isAssuranceHintDismissed) return

    clearAssuranceHintDismissTimer()
    assuranceHintDismissTimerRef.current = window.setTimeout(() => {
      setIsAssuranceHintDismissed(true)
      assuranceHintDismissTimerRef.current = null
    }, ASSURANCE_HINT_DISMISS_HOLD_MS)
  }

  const resetAssurancePointerGesture = () => {
    clearAssuranceHoldTimer()
    clearAssuranceHintDismissTimer()
    assurancePointerIdRef.current = null
    assurancePointerStartRef.current = null
    assuranceHoldActivatedRef.current = false
  }

  const endAssuranceHoldInteraction = () => {
    resetAssurancePointerGesture()
    setIsAssuranceLoopHeld(false)
  }

  const isMobileTouchPointer = (pointerType: string) =>
    isMobileViewport && (pointerType === "touch" || pointerType === "pen")

  const onAssurancePointerDown = (event: { pointerType: string; pointerId: number; clientX: number; clientY: number }) => {
    startAssuranceHintDismissTimer()

    if (!isMobileTouchPointer(event.pointerType)) {
      setIsAssuranceLoopHeld(true)
      return
    }

    assurancePointerIdRef.current = event.pointerId
    assurancePointerStartRef.current = { x: event.clientX, y: event.clientY }
    assuranceHoldActivatedRef.current = false
    clearAssuranceHoldTimer()

    assuranceHoldTimerRef.current = window.setTimeout(() => {
      const isSamePointer = assurancePointerIdRef.current === event.pointerId
      if (!isSamePointer || !assurancePointerStartRef.current) return

      assuranceHoldActivatedRef.current = true
      setIsAssuranceLoopHeld(true)
    }, MOBILE_ASSURANCE_HOLD_DELAY_MS)
  }

  const onAssurancePointerMove = (event: { pointerType: string; pointerId: number; clientX: number; clientY: number }) => {
    if (!isMobileTouchPointer(event.pointerType)) return
    if (assurancePointerIdRef.current !== event.pointerId) return

    const start = assurancePointerStartRef.current
    if (!start) return

    const absDx = Math.abs(event.clientX - start.x)
    const absDy = Math.abs(event.clientY - start.y)
    const isVerticalScrollGesture = absDy > absDx && absDy >= MOBILE_ASSURANCE_SCROLL_CANCEL_PX

    if (isVerticalScrollGesture) {
      endAssuranceHoldInteraction()
      return
    }

    if (!assuranceHoldActivatedRef.current && (absDx > MOBILE_ASSURANCE_MOVE_TOLERANCE_PX || absDy > MOBILE_ASSURANCE_MOVE_TOLERANCE_PX)) {
      clearAssuranceHoldTimer()
      clearAssuranceHintDismissTimer()
    }
  }

  const onMobileAnalysisCarouselScroll = () => {
    const carousel = mobileAnalysisCarouselRef.current
    if (!carousel) return

    const slideWidth = Math.max(carousel.clientWidth, 1)
    const maxSlide = Math.max(ENABLED_ANALYSIS_PAGES.length - 1, 0)
    const nextSlide = Math.max(0, Math.min(maxSlide, Math.round(carousel.scrollLeft / slideWidth)))
    const nextPage = ENABLED_ANALYSIS_PAGES[nextSlide]

    setMobileAnalysisSlide((current) => (current === nextSlide ? current : nextSlide))
    if (nextPage && nextPage.id !== activeAnalysisPageId) {
      setActiveAnalysisPageId(nextPage.id)
    }
  }

  const scrollToMobileAnalysisSlide = (index: number) => {
    const carousel = mobileAnalysisCarouselRef.current
    if (!carousel) return

    const maxSlide = Math.max(ENABLED_ANALYSIS_PAGES.length - 1, 0)
    const clamped = Math.max(0, Math.min(maxSlide, index))
    const nextPage = ENABLED_ANALYSIS_PAGES[clamped]

    carousel.scrollTo({ left: carousel.clientWidth * clamped, behavior: "smooth" })
    setMobileAnalysisSlide(clamped)
    if (nextPage) {
      setActiveAnalysisPageId(nextPage.id)
    }
  }

  const stepAnalysisPage = (direction: -1 | 1) => {
    if (!ENABLED_ANALYSIS_PAGES.length) return

    const nextIndex = Math.max(0, Math.min(ENABLED_ANALYSIS_PAGES.length - 1, activeAnalysisPageIndex + direction))
    const nextPage = ENABLED_ANALYSIS_PAGES[nextIndex]
    if (!nextPage || nextPage.id === activeAnalysisPageId) return

    setActiveAnalysisPageId(nextPage.id)
  }

  const onAnalysisCheckpointClick = (id: string) => {
    setActiveAnalysisCheckpointId((current) => {
      const nextId = current === id ? null : id
      if (nextId && !isAnalysisHintDismissed) {
        setIsAnalysisHintDismissed(true)
      }
      return nextId
    })
  }

  const analysisXToPercent = (x: number, page: AnalysisPage) =>
    ((x - page.bounds.viewBoxMinX) / page.bounds.width) * 100

  const getAnalysisPanelPosition = (checkpoint: AnalysisCheckpoint, page: AnalysisPage): CSSProperties => {
    const left = `${analysisXToPercent(checkpoint.end.x, page)}%`
    const top = `${(checkpoint.end.y / page.bounds.height) * 100}%`
    const mobileRightPanelShiftRem =
      isMobileViewport && page.mobileLeftShiftCheckpointIds?.has(checkpoint.id) ? 2.2 : 4.8
    const verticalTranslate = !isMobileViewport
      ? page.panelVerticalTranslateByCheckpointId?.[checkpoint.id] ?? "-50%"
      : "-50%"
    const transform =
      checkpoint.panelSide === "right"
        ? `translate(${mobileRightPanelShiftRem}rem, ${verticalTranslate})`
        : `translate(calc(-100% - 4.8rem), ${verticalTranslate})`

    return { left, top, transform }
  }

  return (
    <div className="relative overflow-hidden bg-white text-black">
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 lg:px-8">
        {isDossierView ? (
          <section>
            <div className="relative h-[70vh] min-h-[70vh] w-full md:h-[84vh] md:min-h-[84vh]">
              <div className="absolute -top-1 right-2 z-40 hidden min-[431px]:block">
                <ModeControls viewMode={viewMode} onSelect={setViewMode} whitepaperEnabled={WHITEPAPER_VIEW_ENABLED} />
              </div>
              <div className="pointer-events-none absolute inset-0 z-20">
                <svg
                  viewBox="0 0 430 980"
                  className="h-full w-full min-[431px]:hidden"
                  aria-hidden="true"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 88V44C1 20.3 20.3 1 44 1H136C151.6 1 161.3 4.4 169 16L180 32C187.8 43.1 198.8 48 212 48H386C409.7 48 429 67.3 429 91V946C429 964.8 413.8 980 395 980H35C16.2 980 1 964.8 1 946V88Z"
                    stroke="black"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M35 979.5H395"
                    stroke="black"
                    strokeLinecap="square"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <svg
                  viewBox="0 0 720 980"
                  className="hidden h-full w-full min-[431px]:block md:hidden"
                  aria-hidden="true"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 72.5V34C0.5 15.5 15.5 0.5 34 0.5H188C204 0.5 214 4 224 17L242 39C252 50 264 55 280 55H682C702.5 55 719.5 72 719.5 92.5V947.5C719.5 965.7 704.7 980.5 686.5 980.5H33.5C15.3 980.5 0.5 965.7 0.5 947.5V72.5Z"
                    stroke="black"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M33.5 980H686.5"
                    stroke="black"
                    strokeLinecap="square"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <svg
                  viewBox="0 0 1200 860"
                  className="hidden h-full w-full md:block"
                  aria-hidden="true"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 63.5V26C0.5 12.2 11.7 1 25.5 1H319C331 1 338.5 4 346.5 13.5L360.5 30C367.2 37.8 376.1 42 388 42H1174.5C1188.3 42 1199.5 53.2 1199.5 67V831.5C1199.5 846.9 1186.9 859.5 1171.5 859.5H28.5C13.1 859.5 0.5 846.9 0.5 831.5V63.5Z"
                    stroke="black"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              <div className="relative z-10 flex h-full flex-col bg-white px-4 pb-3 pt-[5.25rem] min-[431px]:pb-4 min-[431px]:pt-[5.25rem] md:px-8 md:pb-0 md:pt-16">
                {showCover ? (
                  <div className="flex min-h-[58vh] flex-1 flex-col items-center justify-center px-4 text-center">
                    <h2 className="text-[clamp(1.35rem,6vw,2.2rem)] tracking-[-0.02em] text-black">
                      Verification at
                    </h2>
                    <div className="mt-3">
                      <Image
                        src="/images/logo_transparent.svg"
                        alt="REVETIR"
                        width={220}
                        height={48}
                        className="h-auto w-[8.5rem] min-[431px]:w-[10.5rem]"
                        priority
                      />
                    </div>
                    <button
                      type="button"
                      onClick={enterDossier}
                      className="mt-7 border border-black px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Explore the dossier
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="absolute -top-7 right-2 z-40 min-[431px]:hidden">
                      <ModeControls
                        viewMode={viewMode}
                        onSelect={setViewMode}
                        compact
                        whitepaperEnabled={WHITEPAPER_VIEW_ENABLED}
                      />
                    </div>

                    <div className="border-b border-black pb-2">
                      <div className="grid grid-cols-4 gap-0.5 min-[431px]:hidden">
                        {DOSSIER_SECTIONS.map((section) => {
                          const isActive = section.id === activeSectionId
                          return (
                            <button
                              key={`mobile-${section.id}`}
                              type="button"
                              onClick={() => setActiveSectionId(section.id)}
                              aria-label={section.tabLabel}
                              className={`h-7 border border-black border-b-0 px-1 text-[8px] uppercase tracking-[0.11em] ${
                                isActive ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                              }`}
                            >
                              {section.mobileTabLabel ?? section.tabLabel}
                            </button>
                          )
                        })}
                      </div>

                      <div className="no-scrollbar -mx-1 hidden overflow-x-auto px-1 min-[431px]:block">
                        <div className="flex w-max gap-1">
                          {DOSSIER_SECTIONS.map((section) => {
                            const isActive = section.id === activeSectionId
                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSectionId(section.id)}
                                className={`h-8 border border-black border-b-0 px-2.5 text-[9px] uppercase tracking-[0.13em] min-[431px]:h-9 min-[431px]:px-3 min-[431px]:text-[10px] md:px-4 ${
                                  isActive ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                              >
                                {section.tabLabel}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div ref={dossierSectionScrollRef} className="mt-6 grid h-[39rem] min-w-0 flex-1 gap-4 overflow-x-hidden overflow-y-auto [&>*]:min-w-0 [&_li]:break-words [&_p]:break-words max-[430px]:[&_h2]:text-center max-[430px]:[&_h3]:text-center max-[430px]:[&_h4]:text-center max-[430px]:[&_p]:text-center max-[430px]:[&_li]:text-center min-[431px]:mt-7 min-[431px]:h-[40rem] min-[431px]:gap-6 md:h-[clamp(41rem,78vh,46rem)] md:overflow-visible">
                      {activeSection.id === "intake" ? (
                        <>
                          <div className="relative md:min-h-[38rem]">
                            <div className="relative z-10 flex h-full w-full flex-col items-center gap-6 md:w-[70%] md:items-start">
                              <div className="w-full max-w-[17.5rem] space-y-3 text-left min-[431px]:max-w-[30rem] md:max-w-none">
                                <h2 className="text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-black">
                                  {activeSection.heading}
                                </h2>
                                <p className="max-w-full break-words text-[12px] leading-relaxed text-black/80 md:text-[13px]">{INTAKE_INTRO_TEXT}</p>
                              </div>
                              <div className="pt-3">
                                <div className="flex justify-center md:block">
                                  <div className="w-full max-w-[17.5rem] text-left min-[431px]:max-w-[18rem] md:w-full md:max-w-none">
                                    <div className="grid grid-cols-1 gap-y-5 md:grid-cols-3 md:gap-x-6">
                                      {INTAKE_INPUT_COLUMNS.map((column) => (
                                        <div key={column.title} className="space-y-1.5">
                                          <h3 className="text-[11px] uppercase tracking-[0.05em] text-black md:text-[12px]">{column.title}</h3>
                                          <ul className="list-inside space-y-1 text-[11px] leading-snug text-black/80 md:text-[12px]">
                                            {column.items.map((item) => (
                                              <li key={item}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full pt-2 min-[431px]:hidden">
                                <div className="flex flex-col items-center gap-3">
                                  <div
                                    ref={mobileIntakeCarouselRef}
                                    onScroll={onMobileIntakeCarouselScroll}
                                    className="no-scrollbar flex w-full max-w-[17.5rem] snap-x snap-mandatory overflow-x-auto scroll-smooth"
                                  >
                                    <div className="w-full shrink-0 snap-start">
                                      <div className="mx-auto w-[13.75rem]">
                                        <div className="relative h-[8.75rem]">
                                          <div className="absolute inset-x-0 top-[40%] border-t border-black/45" />
                                          <span className="absolute right-0 top-[40%] -translate-y-1/2 bg-white/95 pl-1 text-right text-[8px] uppercase leading-[1.05] tracking-[0.06em] text-black/75">
                                            <span className="block">PASS/FAIL</span>
                                            <span className="block">THRESHOLD</span>
                                          </span>
                                          <div className="absolute inset-0 border-b border-l border-black/70" />
                                          <div className="absolute inset-0">
                                            <div className="mx-auto grid h-full w-[9.5rem] grid-cols-3 items-end gap-3">
                                              {INTAKE_CHART_BARS.map((bar, index) => (
                                                <div
                                                  key={`mobile-${bar.labelTop}-${bar.labelBottom}`}
                                                  className="flex h-full items-end justify-center"
                                                >
                                                  <div
                                                    ref={(element) => {
                                                      mobileIntakeBarRefs.current[index] = element
                                                    }}
                                                    className="intake-chart-bar w-5"
                                                    style={
                                                      {
                                                        "--bar-min": bar.minScale,
                                                        "--bar-max": bar.maxScale,
                                                        "--bar-duration": bar.duration,
                                                        "--bar-delay": bar.delay,
                                                        backgroundColor: intakeAllBarsAboveThreshold ? "#16a34a" : "rgba(0, 0, 0, 0.85)",
                                                      } as CSSProperties
                                                    }
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-2">
                                          <div className="mx-auto grid w-[9.5rem] grid-cols-3 gap-3">
                                            {INTAKE_CHART_BARS.map((bar) => (
                                              <span
                                                key={`mobile-label-${bar.labelTop}-${bar.labelBottom}`}
                                                className="text-center text-[8px] uppercase leading-[1.15] tracking-[0.05em] text-black/75"
                                              >
                                                <span className="block">{bar.labelTop}</span>
                                                <span className="block">{bar.labelBottom || "\u00A0"}</span>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full shrink-0 snap-start">
                                      <div className="mobile-intake-flow-shell mx-auto w-[11rem]">
                                        <Image
                                          src="/images/intake_flow_v2.svg"
                                          alt="Intake flow"
                                          width={616}
                                          height={662}
                                          className="intake-flow-image mobile-intake-flow-image block h-auto w-full"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center gap-2">
                                    {[0, 1].map((index) => (
                                      <button
                                        key={`intake-mobile-dot-${index}`}
                                        type="button"
                                        onClick={() => scrollToMobileIntakeSlide(index)}
                                        aria-label={`Show intake slide ${index + 1}`}
                                        className={`h-1 w-1 rounded-full transition-colors ${
                                          mobileIntakeSlide === index ? "bg-zinc-500" : "bg-zinc-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="hidden w-full pt-2 md:block">
                                <div className="w-[15.5rem]">
                                  <div className="relative h-44">
                                    <div className="absolute inset-x-0 bottom-[60%] border-t border-black/45">
                                      <span className="absolute left-full ml-2 -top-2 whitespace-nowrap text-[10px] uppercase tracking-[0.11em] text-black/75">
                                        PASS/FAIL THRESHOLD
                                      </span>
                                    </div>
                                    <div className="absolute inset-0 border-b border-l border-black/70" />
                                    <div className="absolute inset-x-0 inset-y-0">
                                      <div className="mx-auto grid h-full w-[12.5rem] grid-cols-3 items-end gap-4">
                                        {INTAKE_CHART_BARS.map((bar, index) => (
                                          <div
                                            key={`${bar.labelTop}-${bar.labelBottom}`}
                                            className="flex h-full items-end justify-center"
                                          >
                                            <div
                                              ref={(element) => {
                                                intakeBarRefs.current[index] = element
                                              }}
                                              className="intake-chart-bar w-8"
                                              style={
                                                {
                                                  "--bar-min": bar.minScale,
                                                  "--bar-max": bar.maxScale,
                                                  "--bar-duration": bar.duration,
                                                  "--bar-delay": bar.delay,
                                                  backgroundColor: intakeAllBarsAboveThreshold ? "#16a34a" : "rgba(0, 0, 0, 0.85)",
                                                } as CSSProperties
                                              }
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <div className="mx-auto grid w-[12.5rem] grid-cols-3 gap-4">
                                      {INTAKE_CHART_BARS.map((bar) => (
                                        <span
                                          key={`label-${bar.labelTop}-${bar.labelBottom}`}
                                          className="text-center text-[10px] uppercase leading-[1.2] tracking-[0.12em] text-black/75"
                                        >
                                          <span className="block">{bar.labelTop}</span>
                                          <span className="block">{bar.labelBottom || "\u00A0"}</span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 hidden min-[431px]:block md:hidden">
                              <div className="intake-flow-shell min-h-[16rem] overflow-hidden">
                                <Image
                                src="/images/intake_flow_v2.svg"
                                alt="Intake flow"
                                width={616}
                                height={662}
                                className="intake-flow-image block h-auto w-full"
                              />
                            </div>
                          </div>
                          </div>
                        </>
                      ) : activeSection.id === "analysis" ? (
                        <>
                          <div className="relative md:min-h-[38rem]">
                            <div className="relative z-10 flex h-full w-full flex-col items-center gap-4 md:items-start md:gap-3">
                              <div className="w-full max-w-[17.5rem] space-y-4 text-left min-[431px]:max-w-[30rem] md:max-w-none">
                                <h2 className="text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-black">
                                  {activeSection.heading}
                                </h2>
                                <p className="max-w-[17.5rem] text-[12px] leading-relaxed text-black/80 min-[431px]:max-w-[30rem] md:max-w-[42rem] md:text-[13px]">
                                  {activeSection.bodyToken}
                                </p>
                              </div>

                              <div className="w-full pt-1 md:flex md:flex-1 md:min-h-0 md:justify-center md:pt-0">
                                <div className="mx-auto flex w-full max-w-[17.5rem] flex-col items-center min-[431px]:max-w-[30rem] md:h-full md:min-h-0 md:max-w-full md:justify-center">
                                  <div className="w-full md:flex md:h-full md:flex-col md:items-center">
                                    <div className="hidden w-full max-w-[30rem] items-center justify-between gap-4 pb-3 min-[431px]:flex md:max-w-[38rem]">
                                      <div className="text-[10px] uppercase tracking-[0.14em] text-black/70">
                                        {activeAnalysisPage.label}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.14em] text-black/65">
                                          {activeAnalysisPageIndex + 1} / {ENABLED_ANALYSIS_PAGES.length}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          {([-1, 1] as const).map((direction) => {
                                            const isDisabled =
                                              direction === -1
                                                ? activeAnalysisPageIndex === 0
                                                : activeAnalysisPageIndex === ENABLED_ANALYSIS_PAGES.length - 1

                                            return (
                                              <button
                                                key={`analysis-page-direction-${direction}`}
                                                type="button"
                                                onClick={() => stepAnalysisPage(direction)}
                                                disabled={isDisabled}
                                                aria-label={direction === -1 ? "Show previous analysis page" : "Show next analysis page"}
                                                className={`flex h-8 w-8 items-center justify-center border border-black transition-colors ${
                                                  isDisabled ? "cursor-not-allowed border-black/20 text-black/25" : "hover:bg-black hover:text-white"
                                                }`}
                                              >
                                                <svg
                                                  viewBox="0 0 12 12"
                                                  className="h-3 w-3"
                                                  aria-hidden="true"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d={direction === -1 ? "M7.75 2.5L4.25 6L7.75 9.5" : "M4.25 2.5L7.75 6L4.25 9.5"}
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.2"
                                                  />
                                                </svg>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="w-full min-[431px]:hidden">
                                      <div className="flex flex-col items-center gap-3">
                                        <div
                                          ref={mobileAnalysisCarouselRef}
                                          onScroll={onMobileAnalysisCarouselScroll}
                                          className="no-scrollbar flex w-full max-w-[17.5rem] snap-x snap-mandatory overflow-x-auto scroll-smooth"
                                        >
                                          {ENABLED_ANALYSIS_PAGES.map((page) => {
                                            const isActivePage = page.id === activeAnalysisPage.id
                                            const showHintGlow =
                                              isActivePage &&
                                              !isMobileViewport &&
                                              isAnalysisHintHovered &&
                                              !activeAnalysisCheckpointId
                                            const activeCheckpointId = isActivePage ? activeAnalysisCheckpointId : null

                                            return (
                                              <div key={`analysis-mobile-slide-${page.id}`} className="w-full shrink-0 snap-start">
                                                <div className="mx-auto w-full max-w-[17.5rem]">
                                                  <AnalysisPageGraphic
                                                    page={page}
                                                    activeCheckpointId={activeCheckpointId}
                                                    showHintGlow={showHintGlow}
                                                    onCheckpointClick={onAnalysisCheckpointClick}
                                                    getPanelPosition={getAnalysisPanelPosition}
                                                    setActivePanelRef={() => {}}
                                                    renderFloatingPanel={false}
                                                    className="w-full"
                                                  />
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                          {ENABLED_ANALYSIS_PAGES.map((page, index) => (
                                            <button
                                              key={`analysis-mobile-dot-${page.id}`}
                                              type="button"
                                              onClick={() => scrollToMobileAnalysisSlide(index)}
                                              aria-label={`Show ${page.label.toLowerCase()} analysis page`}
                                              className={`h-1 w-1 rounded-full transition-colors ${
                                                mobileAnalysisSlide === index ? "bg-zinc-500" : "bg-zinc-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="relative hidden w-full min-[431px]:block md:min-h-0 md:flex-1 md:w-fit md:max-w-full">
                                      <AnalysisPageGraphic
                                        page={activeAnalysisPage}
                                        activeCheckpointId={activeAnalysisCheckpointId}
                                        showHintGlow={!isMobileViewport && isAnalysisHintHovered && !activeAnalysisCheckpointId}
                                        onCheckpointClick={onAnalysisCheckpointClick}
                                        getPanelPosition={getAnalysisPanelPosition}
                                        setActivePanelRef={(element) => {
                                          activeAnalysisPanelRef.current = element
                                        }}
                                        className="w-full md:h-full"
                                      />
                                    </div>
                                  <p
                                    onMouseEnter={() => {
                                      if (!isMobileViewport) setIsAnalysisHintHovered(true)
                                    }}
                                    onMouseLeave={() => {
                                      if (!isMobileViewport) setIsAnalysisHintHovered(false)
                                    }}
                                    className={`text-center text-[12px] leading-relaxed text-black/75 transition-[margin,max-height,opacity] duration-500 min-[431px]:mt-1 min-[431px]:max-h-none md:mt-2 md:shrink-0 ${
                                      isAnalysisHintDismissed
                                        ? "mt-0 max-h-0 overflow-hidden opacity-0"
                                        : "mt-3 max-h-12 opacity-100"
                                    }`}
                                  >
                                    Select a checkpoint to view analysis details.
                                  </p>
                                  <div className="mt-3 w-full min-[431px]:hidden">
                                    {activeAnalysisCheckpoint ? (
                                      <div
                                        ref={(element) => {
                                          activeAnalysisPanelRef.current = element
                                        }}
                                      >
                                        <AnalysisCheckpointPanelContent checkpoint={activeAnalysisCheckpoint} />
                                      </div>
                                    ) : null}
                                  </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : activeSection.id === "decision" ? (
                        <>
                          <div className="relative md:h-full md:overflow-hidden">
                            <div className="relative z-10 flex h-full w-full flex-col items-center gap-6 md:grid md:h-full md:min-h-0 md:grid-cols-[minmax(11.75rem,26%)_minmax(0,1fr)] md:items-stretch md:gap-5 lg:grid-cols-[minmax(13.5rem,29%)_minmax(0,1fr)] lg:gap-7">
                              <div className="w-full max-w-[17.5rem] space-y-4 text-left min-[431px]:max-w-[30rem] md:max-w-[13.75rem] lg:max-w-[16rem]">
                                <h2 className="text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-black">
                                  {activeSection.heading}
                                </h2>
                                <p className="max-w-[17.5rem] text-[12px] leading-relaxed text-black/80 min-[431px]:max-w-[30rem] md:max-w-[13.75rem] md:text-[13px] lg:max-w-[16rem]">
                                  {activeSection.bodyToken}
                                </p>
                              </div>

                              <div className="w-full pt-1 md:flex md:h-full md:min-h-0 md:items-center md:justify-center md:pt-0">
                                <div className="mx-auto flex w-full max-w-[17.5rem] flex-col items-center min-[431px]:max-w-[30rem] md:h-full md:min-h-0 md:max-w-full md:justify-center">
                                  <div className="relative w-full md:h-full md:w-fit md:max-w-full">
                                    <ReconciliationChecklistGraphic className="h-auto w-full md:h-full md:max-h-full md:w-auto md:max-w-full" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : activeSection.id === "assurance" ? (
                        <>
                          <div className="relative md:min-h-[38rem]">
                            <div className="relative z-10 flex h-full w-full flex-col items-center gap-4 md:items-start md:gap-3">
                              <div className="w-full max-w-[17.5rem] space-y-4 text-left min-[431px]:max-w-[30rem] md:max-w-none">
                                <h2 className="text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-black">
                                  {activeSection.heading}
                                </h2>
                                <p className="max-w-[17.5rem] text-[12px] leading-relaxed text-black/80 min-[431px]:max-w-[30rem] md:max-w-[42rem] md:text-[13px]">
                                  {activeSection.bodyToken}
                                </p>
                              </div>

                              <div className="w-full pt-1 md:flex md:flex-1 md:min-h-0 md:justify-center md:pt-0">
                                <div className="mx-auto flex w-full max-w-[17.5rem] flex-col items-center gap-4 min-[431px]:max-w-[30rem] md:min-h-0 md:flex-1 md:max-w-none md:flex-row md:items-center md:justify-center md:gap-8">
                                  <div className="flex w-full flex-col items-center md:w-[42%] md:justify-start">
                                    <button
                                      type="button"
                                      onPointerDown={onAssurancePointerDown}
                                      onPointerMove={onAssurancePointerMove}
                                      onPointerUp={endAssuranceHoldInteraction}
                                      onPointerLeave={endAssuranceHoldInteraction}
                                      onPointerCancel={endAssuranceHoldInteraction}
                                      onKeyDown={(event) => {
                                        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                                          event.preventDefault()
                                          startAssuranceHintDismissTimer()
                                          setIsAssuranceLoopHeld(true)
                                        }
                                      }}
                                      onKeyUp={(event) => {
                                        if (event.key === " " || event.key === "Enter") {
                                          event.preventDefault()
                                          clearAssuranceHintDismissTimer()
                                          setIsAssuranceLoopHeld(false)
                                        }
                                      }}
                                      onBlur={endAssuranceHoldInteraction}
                                      aria-label="Press and hold to rotate assurance inputs around the stamp"
                                      aria-pressed={isAssuranceLoopHeld}
                                      aria-describedby="assurance-loop-hint"
                                      className="analysis-loop-circle"
                                    >
                                      <span className="sr-only">
                                        Hold to rotate the circular assurance labels. Release pauses without resetting.
                                      </span>
                                      <svg
                                        viewBox="-14 -14 128 128"
                                        className="analysis-loop-svg"
                                        aria-hidden="true"
                                        focusable="false"
                                        preserveAspectRatio="xMidYMid meet"
                                      >
                                        <defs>
                                          <path
                                            id="assurance-loop-track"
                                            d={`M 50 ${50 - ASSURANCE_STAMP_TRACK_RADIUS} A ${ASSURANCE_STAMP_TRACK_RADIUS} ${ASSURANCE_STAMP_TRACK_RADIUS} 0 1 1 50 ${50 + ASSURANCE_STAMP_TRACK_RADIUS} A ${ASSURANCE_STAMP_TRACK_RADIUS} ${ASSURANCE_STAMP_TRACK_RADIUS} 0 1 1 50 ${50 - ASSURANCE_STAMP_TRACK_RADIUS}`}
                                          />
                                        </defs>
                                        <g ref={assuranceLoopRingRef}>
                                          <text
                                            className="analysis-loop-node-text"
                                            dy="-0.45"
                                            textLength={ASSURANCE_STAMP_TRACK_CIRCUMFERENCE}
                                            lengthAdjust="spacing"
                                            xmlSpace="preserve"
                                          >
                                            <textPath href="#assurance-loop-track" startOffset="0%">
                                              {ASSURANCE_STAMP_RING_TEXT}
                                            </textPath>
                                          </text>
                                        </g>
                                        <text
                                          x="50"
                                          y="50"
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                          className="analysis-loop-stamp-text"
                                        >
                                          ASSURANCE
                                        </text>
                                      </svg>
                                    </button>
                                    <p
                                      id="assurance-loop-hint"
                                      className={`mt-2 w-full max-w-[16.5rem] text-center text-[11px] leading-snug text-black/70 transition-opacity duration-500 min-[431px]:max-w-[19rem] md:max-w-[21rem] md:text-[12px] ${
                                        isAssuranceHintDismissed ? "opacity-0" : "opacity-100"
                                      }`}
                                    >
                                      Press and hold to switch focus area.
                                    </p>
                                  </div>
                                  <div className="w-full border border-black bg-white/90 px-3 py-3 text-left min-[431px]:px-4 min-[431px]:py-4 md:w-[50%] md:max-h-full md:overflow-y-auto">
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-black/70">
                                      {activeAssurancePanelHeader}
                                    </p>
                                    <h3 className="mt-1 text-[13px] font-semibold uppercase tracking-[0.03em] text-black md:text-[14px]">
                                      {activeAssuranceItem.label}
                                    </h3>
                                    <p className="mt-2 text-[12px] leading-relaxed text-black/80 md:text-[13px]">
                                      {activeAssuranceItem.excerpt}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative md:min-h-[38rem]">
                            <div className="relative z-10 flex h-full w-full flex-col items-center gap-6 md:items-start">
                              <div className="w-full max-w-[17.5rem] space-y-4 text-left min-[431px]:max-w-[30rem] md:max-w-none">
                                <h2 className="text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-black">
                                  {activeSection.heading}
                                </h2>
                                <p className="text-[12px] uppercase tracking-[0.12em] text-black/70">
                                  {activeSection.bodyToken}
                                </p>
                                <div className="space-y-2">
                                  <div className="h-2 w-full bg-black/10" />
                                  <div className="h-2 w-11/12 bg-black/10" />
                                  <div className="h-2 w-8/12 bg-black/10" />
                                </div>
                              </div>

                              <div className="grid w-full max-w-[17.5rem] gap-3 min-[431px]:max-w-[30rem] md:max-w-none md:grid-cols-2">
                                {activeSection.slots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={`${sizeToClass[slot.size]} ${
                                      slot.size === "strip" ? "md:col-span-2" : ""
                                    } overflow-hidden border border-black bg-white p-3`}
                                  >
                                    <p className="text-[11px] uppercase tracking-[0.13em] text-black/70">{slot.label}</p>
                                    <div className="mt-3 space-y-2">
                                      <div className="h-2 w-full bg-black/10" />
                                      <div className="h-2 w-4/5 bg-black/10" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 border-t border-black pt-3 text-[11px] uppercase tracking-[0.13em] text-black/70 md:py-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 leading-none">
                        <Image
                          src="/images/logo_transparent.svg"
                          alt="REVETIR"
                          width={46}
                          height={10}
                          className="h-[10px] w-auto"
                        />
                        <span className="select-none text-[11px] uppercase tracking-[0.13em] text-black/70">
                          IARA
                          <span className="align-super text-[7px] tracking-normal">{"\u00A9"}</span>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="relative w-full min-h-[70vh] md:min-h-[78vh]">
              <div className="absolute -top-1 right-2 z-40 hidden min-[431px]:block">
                <ModeControls viewMode={viewMode} onSelect={setViewMode} whitepaperEnabled={WHITEPAPER_VIEW_ENABLED} />
              </div>

              <div className="relative space-y-8 pt-10 min-[431px]:pt-0">
                <div className="absolute -top-7 right-2 z-40 min-[431px]:hidden">
                  <ModeControls
                    viewMode={viewMode}
                    onSelect={setViewMode}
                    compact
                    whitepaperEnabled={WHITEPAPER_VIEW_ENABLED}
                  />
                </div>
                <div className="sticky top-[72px] z-10 border border-black bg-white px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {DOSSIER_SECTIONS.map((section) => (
                      <button
                        key={`paper-nav-${section.id}`}
                        type="button"
                        onClick={() => jumpToPaperSection(section.id)}
                        className={`border px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${
                          activeSectionId === section.id
                            ? "border-black bg-black text-white"
                            : "border-black bg-white text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {section.tabLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {DOSSIER_SECTIONS.map((section) => (
                  <article
                    key={section.id}
                    id={`paper-${section.id}`}
                    className="relative scroll-mt-28 border border-black bg-white p-5 pt-8 md:p-6 md:pt-9"
                  >
                    <div className="pointer-events-none absolute left-5 top-[-34px] h-8 rounded-t-md border border-black border-b-0 bg-white px-3 py-2 text-[10px] uppercase tracking-[0.13em] md:left-6">
                      {section.tabLabel}
                    </div>
                    <div className={`grid gap-5 ${section.id === "intake" ? "md:grid-cols-[7fr_3fr]" : "md:grid-cols-12"}`}>
                      {section.id === "intake" ? (
                        <>
                          <div>
                            <div className="flex h-full flex-col items-center gap-6 md:min-h-[16rem] md:items-start">
                              <div className="w-full max-w-[30rem] space-y-3 text-left md:max-w-none">
                                <h3 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-black">{section.heading}</h3>
                                <p className="text-[11px] leading-relaxed text-black/80">{INTAKE_INTRO_TEXT}</p>
                              </div>
                              <div className="pt-3">
                                <div className="block">
                                  <div className="w-fit max-w-[18rem] text-left md:w-full md:max-w-none">
                                    <div className="grid grid-cols-1 gap-y-5 md:grid-cols-3 md:gap-x-6">
                                      {INTAKE_INPUT_COLUMNS.map((column) => (
                                        <div key={`paper-${column.title}`} className="space-y-1.5">
                                          <h4 className="text-[10px] uppercase tracking-[0.05em] text-black">{column.title}</h4>
                                          <ul className="list-inside space-y-1 text-[10px] leading-snug text-black/80">
                                            {column.items.map((item) => (
                                              <li key={item}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="intake-flow-shell min-h-[16rem] overflow-hidden">
                              <Image
                                src="/images/intake_flow_v2.svg"
                                alt="Intake flow"
                                width={616}
                                height={662}
                                className="intake-flow-image block h-auto w-full"
                              />
                            </div>
                          </div>
                        </>
                      ) : section.id === "analysis" ? (
                        <>
                          <div className="space-y-4 md:col-span-5">
                            <h3 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-black">{section.heading}</h3>
                            <p className="text-[11px] leading-relaxed text-black/80">{section.bodyToken}</p>
                          </div>
                          <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
                            {section.slots.map((slot) => (
                              <div
                                key={`paper-${slot.id}`}
                                className={`${sizeToClass[slot.size]} ${
                                  slot.size === "strip" ? "md:col-span-2" : ""
                                } border border-black bg-white p-3`}
                              >
                                <p className="text-[10px] uppercase tracking-[0.13em] text-black/70">{slot.label}</p>
                                <div className="mt-3 space-y-2">
                                  <div className="h-2 w-full bg-black/10" />
                                  <div className="h-2 w-4/5 bg-black/10" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : section.id === "decision" ? (
                        <>
                          <div className="space-y-4 md:col-span-4">
                            <h3 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-black">{section.heading}</h3>
                            <p className="text-[11px] leading-relaxed text-black/80">{section.bodyToken}</p>
                          </div>
                          <div className="md:col-span-8">
                            <div className="no-scrollbar overflow-x-auto">
                              <ReconciliationChecklistGraphic className="h-auto w-[34rem] min-w-[34rem] min-[431px]:w-full min-[431px]:min-w-0" />
                            </div>
                          </div>
                        </>
                      ) : section.id === "assurance" ? (
                        <>
                          <div className="space-y-4 md:col-span-5">
                            <h3 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-black">{section.heading}</h3>
                            <p className="text-[11px] leading-relaxed text-black/80">{section.bodyToken}</p>
                          </div>
                          <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
                            {section.slots.map((slot) => (
                              <div
                                key={`paper-${slot.id}`}
                                className={`${sizeToClass[slot.size]} ${
                                  slot.size === "strip" ? "md:col-span-2" : ""
                                } border border-black bg-white p-3`}
                              >
                                <p className="text-[10px] uppercase tracking-[0.13em] text-black/70">{slot.label}</p>
                                <div className="mt-3 space-y-2">
                                  <div className="h-2 w-full bg-black/10" />
                                  <div className="h-2 w-4/5 bg-black/10" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-4 md:col-span-5">
                            <h3 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-black">{section.heading}</h3>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-black/70">{section.bodyToken}</p>
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-black/10" />
                              <div className="h-2 w-5/6 bg-black/10" />
                              <div className="h-2 w-3/5 bg-black/10" />
                            </div>
                          </div>
                          <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
                            {section.slots.map((slot) => (
                              <div
                                key={`paper-${slot.id}`}
                                className={`${sizeToClass[slot.size]} ${
                                  slot.size === "strip" ? "md:col-span-2" : ""
                                } border border-black bg-white p-3`}
                              >
                                <p className="text-[10px] uppercase tracking-[0.13em] text-black/70">{slot.label}</p>
                                <div className="mt-3 space-y-2">
                                  <div className="h-2 w-full bg-black/10" />
                                  <div className="h-2 w-4/5 bg-black/10" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <style jsx>{`
        .intake-flow-shell {
          background: transparent;
        }

        .intake-flow-image {
          border: 0;
          outline: 0;
          box-shadow: none;
          clip-path: none;
          -webkit-clip-path: none;
        }

        @media (max-width: 767px) {
          .mobile-intake-flow-shell {
            overflow: hidden;
          }

          .mobile-intake-flow-image {
            width: calc(100% + 2px);
            max-width: none;
            margin-left: -1px;
            transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        }

        .intake-chart-bar {
          height: 100%;
          transform-origin: bottom center;
          animation-name: intakeBarPulse;
          animation-duration: var(--bar-duration);
          animation-delay: var(--bar-delay);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes intakeBarPulse {
          0%,
          100% {
            transform: scaleY(var(--bar-min));
          }
          50% {
            transform: scaleY(var(--bar-max));
          }
        }

        .analysis-hint-glow {
          opacity: 0;
          pointer-events: none;
          transition: opacity 280ms ease;
        }

        .analysis-hint-glow.is-active {
          animation: analysisHintGlow 1.8s ease-in-out infinite;
          opacity: 1;
        }

        .analysis-checkpoint-hotspot:focus,
        .analysis-checkpoint-hotspot:focus-visible {
          outline: none;
        }

        @keyframes analysisHintGlow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }

        .analysis-loop-circle {
          position: relative;
          width: 100%;
          max-width: 16.5rem;
          aspect-ratio: 1 / 1;
          border: 0;
          border-radius: 0;
          background: transparent;
          cursor: pointer;
          touch-action: pan-y;
          user-select: none;
        }

        @media (min-width: 431px) {
          .analysis-loop-circle {
            max-width: 19rem;
          }
        }

        @media (min-width: 768px) {
          .analysis-loop-circle {
            width: min(100%, 21rem);
            height: auto;
            max-width: 21rem;
          }
        }

        .analysis-loop-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .analysis-loop-node-text {
          fill: rgba(0, 0, 0, 0.9);
          font-size: 6.6px;
          letter-spacing: 0.012em;
          pointer-events: none;
          dominant-baseline: middle;
          text-transform: uppercase;
        }

        @media (min-width: 768px) {
          .analysis-loop-node-text {
            font-size: 7.1px;
          }
        }

        .analysis-loop-stamp-text {
          fill: rgba(0, 0, 0, 0.9);
          font-size: 7.2px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          pointer-events: none;
        }

        @media (min-width: 768px) {
          .analysis-loop-stamp-text {
            font-size: 7.8px;
          }
        }
      `}</style>
    </div>
  )
}
