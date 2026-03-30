"use client"

import Image from "next/image"
import { Fragment, type MouseEvent, useEffect, useRef, useState } from "react"

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
  inlineLead: string
  blockRemainder?: string
  subdefinitionClassName: string
  guidedInlineClassName: string
}

const GUIDED_DISCOVERY_KEY = "revetir_about_us_guided_seen_v1"
const GUIDED_IDLE_DELAY_MS = 2000
const GUIDED_VISIBLE_MS = 3000

const TERMS: Record<TermId, DefinitionTerm> = {
  global: {
    label: "global",
    guidedPreview: "from fashion capitals to craft districts",
    inlineLead: "from fashion capitals to craft districts,",
    blockRemainder: "we source from over 30 countries around the world",
    subdefinitionClassName: "max-w-[29ch] md:ml-[8%]",
    guidedInlineClassName: "text-black/62",
  },
  marketplace: {
    label: "marketplace",
    guidedPreview: "partner brands, stores, and independent resellers",
    inlineLead: "we maintain a growing network of partner brands,",
    blockRemainder:
      "stores and independent resellers that list new items for sale every single day",
    subdefinitionClassName: "max-w-[34ch] md:ml-[21%]",
    guidedInlineClassName: "text-black/62",
  },
  discovery: {
    label: "discovery",
    guidedPreview: "emerging labels, seasonal shifts, and regional scenes",
    inlineLead:
      "our curation tracks emerging labels, seasonal shifts and regional scenes with",
    blockRemainder: "every shape, size and taste accounted for",
    subdefinitionClassName: "max-w-[34ch] md:ml-[4%]",
    guidedInlineClassName: "text-black/62",
  },
  luxury: {
    label: "luxury",
    guidedPreview: "high-end materials with meticulous attention-to-detail",
    inlineLead: "high-end clothing, shoes, and accessories",
    blockRemainder:
      "made of superior-quality materials with meticulous attention-to-detail",
    subdefinitionClassName: "max-w-[35ch] md:ml-[26%]",
    guidedInlineClassName: "text-black/62",
  },
  independentFashion: {
    label: "independent fashion",
    guidedPreview: "design-forward, culture-rooted originality",
    inlineLead: "design-forward clothing, shoes, and accessories",
    blockRemainder: "rooted in culture and originality",
    subdefinitionClassName: "max-w-[34ch] md:ml-[12%]",
    guidedInlineClassName: "text-black/62",
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
  const [activeTerm, setActiveTerm] = useState<TermId | null>(null)
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

  const handleTermFocus = (termId: TermId) => {
    if (!canHover || guidedActive) {
      return
    }

    markGuidedSeen()
    setActiveTerm(termId)
  }

  const handleTermBlur = (termId: TermId) => {
    if (!canHover || guidedActive) {
      return
    }

    setActiveTerm((currentTerm) => (currentTerm === termId ? null : currentTerm))
  }

  const handleTermTap = (termId: TermId) => {
    markGuidedSeen()
    setGuidedActive(false)

    if (canHover) {
      return
    }

    setActiveTerm((currentTerm) => (currentTerm === termId ? null : termId))
  }

  const handleDefinitionMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!canHover || guidedActive) {
      return
    }

    const hoveredTrigger = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-term-trigger='true']"
    )

    if (!hoveredTrigger) {
      setActiveTerm((currentTerm) => (currentTerm ? null : currentTerm))
      return
    }

    const hoveredTerm = hoveredTrigger.dataset.termId as TermId | undefined

    if (!hoveredTerm) {
      return
    }

    markGuidedSeen()
    setActiveTerm((currentTerm) =>
      currentTerm === hoveredTerm ? currentTerm : hoveredTerm
    )
  }

  const handleDefinitionMouseLeave = () => {
    if (!canHover || guidedActive) {
      return
    }

    setActiveTerm(null)
  }

  return (
    <div className="content-container py-10 font-sans lg:py-14">
      <div className="mx-auto max-w-4xl text-black">
        <h1 className="sr-only">About REVETIR</h1>

        <div className="max-w-[54rem]">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2 md:flex-nowrap md:gap-7">
            <Image
              src="/images/logo_transparent.svg"
              alt="REVETIR"
              width={560}
              height={120}
              priority
              className="h-auto w-[clamp(11rem,56vw,26rem)]"
            />
            <span className="pb-[0.2em] text-[clamp(1.35rem,7vw,3rem)] font-light leading-none text-black/80">
              noun
            </span>
          </div>

          <p className="mt-5 text-[clamp(1.75rem,5.2vw,3.1rem)] font-light leading-none">
            \ rə-və-tir \
          </p>

          <p className="mt-10 text-[clamp(2.05rem,6vw,4rem)] leading-tight">
            <span className="font-bold">Definition</span>{" "}
            <span className="font-light text-black/65">(entry 1 of 1)</span>
          </p>

          <div
            className="mt-8 max-w-[31ch] text-[clamp(2rem,6.4vw,4.15rem)] font-light leading-[1.12]"
            onMouseMove={handleDefinitionMouseMove}
            onMouseLeave={handleDefinitionMouseLeave}
          >
            <span className="mr-[0.18em]">:</span>
            {DEFINITION_TOKENS.map((token, index) => {
              if (token.type === "text") {
                return <span key={`text-${index}`}>{token.value}</span>
              }

              const term = TERMS[token.id]
              const isExpanded = guidedActive || activeTerm === token.id
              const inlineLead = guidedActive ? term.guidedPreview : term.inlineLead

              return (
                <Fragment key={token.id}>
                  <button
                    type="button"
                    data-term-trigger="true"
                    data-term-id={token.id}
                    className="inline cursor-pointer bg-transparent p-0 text-left text-inherit [font:inherit] underline decoration-dotted decoration-[1px] underline-offset-[0.14em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/45"
                    aria-expanded={isExpanded}
                    onFocus={() => handleTermFocus(token.id)}
                    onBlur={() => handleTermBlur(token.id)}
                    onClick={() => handleTermTap(token.id)}
                  >
                    {term.label}
                  </button>

                  {isExpanded && (
                    <>
                      <span
                        className={`ml-[0.14em] text-[clamp(0.95rem,1.35vw,1.22rem)] leading-[1.45] text-black/70 ${
                          guidedActive ? term.guidedInlineClassName : ""
                        }`}
                      >
                        {inlineLead}
                      </span>
                      {!guidedActive && term.blockRemainder && (
                        <p
                          className={`mt-[0.08em] mb-[0.18em] pl-[0.22em] text-[clamp(0.95rem,1.35vw,1.22rem)] leading-[1.45] text-black/70 ${term.subdefinitionClassName}`}
                        >
                          {term.blockRemainder}
                        </p>
                      )}
                    </>
                  )}
                </Fragment>
              )
            })}
          </div>

          <p className="mt-8 text-[11px] uppercase text-black/45">
            hover or tap key terms to unfold meaning in-place
          </p>
        </div>
      </div>
    </div>
  )
}
