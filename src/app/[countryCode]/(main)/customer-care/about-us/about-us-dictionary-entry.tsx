"use client"

import { useEffect, useRef, useState } from "react"

type TermId = "global" | "marketplace" | "discovery" | "luxury" | "independentFashion"

type DefinitionToken =
  | {
      type: "text"
      value: string
    }
  | {
      type: "term"
      id: TermId
    }

interface DefinitionTerm {
  label: string
  guidedPreview: string
  fullInline: string[]
  expandedClassName: string
  guidedClassName: string
}

const GUIDED_DISCOVERY_KEY = "revetir_about_us_guided_seen_v1"
const GUIDED_IDLE_DELAY_MS = 2000
const GUIDED_VISIBLE_MS = 3000

const TERMS: Record<TermId, DefinitionTerm> = {
  global: {
    label: "global",
    guidedPreview: "from fashion capitals to craft districts",
    fullInline: [
      "from fashion capitals to craft districts, we source from over 30 countries around the world",
    ],
    expandedClassName:
      "ml-[0.10em] mr-[0.26em] mt-[0.08em] mb-[0.20em] max-w-[21ch] px-[0.28em] py-[0.20em]",
    guidedClassName:
      "mx-[0.08em] my-[0.08em] max-w-[15ch] px-[0.20em] py-[0.14em]",
  },
  marketplace: {
    label: "marketplace",
    guidedPreview: "partner brands, stores, and independent resellers",
    fullInline: [
      "we maintain a growing network of partner brands, stores and independent resellers that list new items for sale every single day",
    ],
    expandedClassName:
      "ml-[0.18em] mr-[0.12em] mt-[0.14em] mb-[0.12em] max-w-[22ch] px-[0.32em] py-[0.24em]",
    guidedClassName:
      "mx-[0.10em] my-[0.06em] max-w-[16ch] px-[0.22em] py-[0.16em]",
  },
  discovery: {
    label: "discovery",
    guidedPreview: "emerging labels, seasonal shifts, and regional scenes",
    fullInline: [
      "our curation tracks emerging labels, seasonal shifts and regional scenes.",
      "every shape, size and taste is accounted for",
    ],
    expandedClassName:
      "ml-[0.08em] mr-[0.30em] mt-[0.06em] mb-[0.26em] max-w-[23ch] px-[0.24em] py-[0.20em]",
    guidedClassName:
      "mx-[0.12em] my-[0.10em] max-w-[17ch] px-[0.20em] py-[0.15em]",
  },
  luxury: {
    label: "luxury",
    guidedPreview: "high-end materials with meticulous attention-to-detail",
    fullInline: [
      "high-end clothing, shoes, and accessories made of superior-quality materials with meticulous attention-to-detail",
    ],
    expandedClassName:
      "ml-[0.24em] mr-[0.10em] mt-[0.10em] mb-[0.18em] max-w-[20ch] px-[0.30em] py-[0.20em]",
    guidedClassName:
      "mx-[0.08em] my-[0.07em] max-w-[15ch] px-[0.20em] py-[0.14em]",
  },
  independentFashion: {
    label: "independent fashion",
    guidedPreview: "design-forward, culture-rooted originality",
    fullInline: [
      "design-forward clothing, shoes, and accessories rooted in culture and originality",
    ],
    expandedClassName:
      "ml-[0.10em] mr-[0.22em] mt-[0.16em] mb-[0.14em] max-w-[26ch] px-[0.26em] py-[0.24em]",
    guidedClassName:
      "mx-[0.12em] my-[0.10em] max-w-[18ch] px-[0.22em] py-[0.16em]",
  },
}

const DEFINITION_TOKENS: DefinitionToken[] = [
  { type: "text", value: "a " },
  { type: "term", id: "global" },
  { type: "text", value: " " },
  { type: "term", id: "marketplace" },
  { type: "text", value: " for the " },
  { type: "term", id: "discovery" },
  { type: "text", value: " of " },
  { type: "term", id: "luxury" },
  { type: "text", value: " and " },
  { type: "term", id: "independentFashion" },
]

export default function AboutUsDictionaryEntry() {
  const [hoveredTerm, setHoveredTerm] = useState<TermId | null>(null)
  const [pinnedTerm, setPinnedTerm] = useState<TermId | null>(null)
  const [guidedActive, setGuidedActive] = useState(false)
  const [guidedEligible, setGuidedEligible] = useState(false)
  const [guidedHasPlayed, setGuidedHasPlayed] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const guidedActiveRef = useRef(false)

  useEffect(() => {
    guidedActiveRef.current = guidedActive
  }, [guidedActive])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    setGuidedEligible(window.sessionStorage.getItem(GUIDED_DISCOVERY_KEY) !== "1")
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")

    const updateHoverCapability = () => {
      setCanHover(mediaQuery.matches)
    }

    updateHoverCapability()

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateHoverCapability)
      return () => mediaQuery.removeEventListener("change", updateHoverCapability)
    }

    mediaQuery.addListener(updateHoverCapability)
    return () => mediaQuery.removeListener(updateHoverCapability)
  }, [])

  useEffect(() => {
    if (!guidedEligible || guidedHasPlayed || typeof window === "undefined") {
      return
    }

    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let revertTimer: ReturnType<typeof setTimeout> | null = null

    const clearIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer)
        idleTimer = null
      }
    }

    const clearRevertTimer = () => {
      if (revertTimer) {
        clearTimeout(revertTimer)
        revertTimer = null
      }
    }

    const startGuidedDiscovery = () => {
      setGuidedHasPlayed(true)
      setGuidedActive(true)
      window.sessionStorage.setItem(GUIDED_DISCOVERY_KEY, "1")

      clearRevertTimer()
      revertTimer = setTimeout(() => {
        setGuidedActive(false)
      }, GUIDED_VISIBLE_MS)
    }

    const scheduleGuidedDiscovery = () => {
      clearIdleTimer()
      idleTimer = setTimeout(startGuidedDiscovery, GUIDED_IDLE_DELAY_MS)
    }

    const handleActivity = () => {
      if (guidedActiveRef.current) {
        setGuidedActive(false)
        clearRevertTimer()
        return
      }

      scheduleGuidedDiscovery()
    }

    scheduleGuidedDiscovery()

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity)
    })

    return () => {
      clearIdleTimer()
      clearRevertTimer()

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
    }
  }, [guidedEligible, guidedHasPlayed])

  const markGuidedSeen = () => {
    if (!guidedEligible || typeof window === "undefined") {
      return
    }

    window.sessionStorage.setItem(GUIDED_DISCOVERY_KEY, "1")
    setGuidedEligible(false)
    setGuidedActive(false)
  }

  const handleTermHover = (termId: TermId) => {
    if (!canHover || pinnedTerm || guidedActive) {
      return
    }

    markGuidedSeen()
    setHoveredTerm(termId)
  }

  const handleTermLeave = (termId: TermId) => {
    if (!canHover || pinnedTerm || guidedActive) {
      return
    }

    setHoveredTerm((currentTerm) => (currentTerm === termId ? null : currentTerm))
  }

  const handleTermFocus = (termId: TermId) => {
    if (pinnedTerm || guidedActive) {
      return
    }

    markGuidedSeen()
    setHoveredTerm(termId)
  }

  const handleTermBlur = (termId: TermId) => {
    if (pinnedTerm || guidedActive) {
      return
    }

    setHoveredTerm((currentTerm) => (currentTerm === termId ? null : currentTerm))
  }

  const handleTermSelect = (termId: TermId) => {
    markGuidedSeen()
    setGuidedActive(false)
    setHoveredTerm(null)
    setPinnedTerm((currentTerm) => (currentTerm === termId ? null : termId))
  }

  const activeTerm = pinnedTerm || hoveredTerm

  return (
    <div className="content-container py-10 lg:py-14">
      <div className="mx-auto max-w-4xl text-black">
        <h1 className="sr-only">About REVETIR</h1>

        <div className="max-w-[54rem]">
          <p className="text-[clamp(2.75rem,9vw,6rem)] font-light leading-none tracking-[0.05em]">
            <span className="tracking-[0.08em]">REVETIR</span>{" "}
            <span className="align-[0.14em] text-[0.42em] tracking-normal text-black/80">noun</span>
          </p>

          <p className="mt-5 text-[clamp(1.75rem,5.2vw,3.1rem)] font-light leading-none tracking-[0.01em]">
            \ rə-və-tir \
          </p>

          <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-black/55">
            from French <span className="normal-case italic tracking-normal">revêtir</span>, to dress in
          </p>

          <p className="mt-10 text-[clamp(2.05rem,6vw,4rem)] leading-tight tracking-[-0.02em]">
            <span className="font-bold">Definition</span>{" "}
            <span className="font-light text-black/70">(entry 1 of 1)</span>
          </p>

          <p className="mt-8 max-w-[31ch] text-[clamp(2rem,6.4vw,4.15rem)] font-light leading-[1.12] tracking-[-0.018em]">
            <span className="mr-[0.18em]">:</span>
            {DEFINITION_TOKENS.map((token, index) => {
              if (token.type === "text") {
                return <span key={`text-${index}`}>{token.value}</span>
              }

              const term = TERMS[token.id]
              const isExpanded = guidedActive || activeTerm === token.id
              const isGuidedExpansion = guidedActive

              if (!isExpanded) {
                return (
                  <button
                    key={token.id}
                    type="button"
                    className="inline-flex cursor-pointer items-baseline border-b border-black/35 px-[0.02em] text-left text-inherit transition-colors duration-200 hover:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/45"
                    aria-expanded={false}
                    onMouseEnter={() => handleTermHover(token.id)}
                    onMouseLeave={() => handleTermLeave(token.id)}
                    onFocus={() => handleTermFocus(token.id)}
                    onBlur={() => handleTermBlur(token.id)}
                    onClick={() => handleTermSelect(token.id)}
                  >
                    {term.label}
                  </button>
                )
              }

              return (
                <span
                  key={token.id}
                  className={`inline-flex align-top flex-col border border-black/20 bg-black/[0.025] text-black transition-all duration-300 ease-out motion-reduce:transition-none ${
                    isGuidedExpansion ? term.guidedClassName : term.expandedClassName
                  }`}
                >
                  <button
                    type="button"
                    className="cursor-pointer text-left text-current focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/45"
                    aria-expanded={true}
                    onMouseEnter={() => handleTermHover(token.id)}
                    onMouseLeave={() => handleTermLeave(token.id)}
                    onFocus={() => handleTermFocus(token.id)}
                    onBlur={() => handleTermBlur(token.id)}
                    onClick={() => handleTermSelect(token.id)}
                  >
                    {term.label}
                  </button>

                  <span className="mt-[0.16em] h-px w-[1.5em] bg-black/20" />

                  <span className="mt-[0.16em] text-[0.31em] leading-[1.35] tracking-[0.01em] text-black/70">
                    {isGuidedExpansion ? (
                      term.guidedPreview
                    ) : (
                      term.fullInline.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))
                    )}
                  </span>
                </span>
              )
            })}
          </p>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-black/45">
            hover or tap key terms to unfold meaning in-place
          </p>
        </div>
      </div>
    </div>
  )
}
