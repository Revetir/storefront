"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useIntersection } from "@lib/hooks/use-in-view"
import type { RunwayBelt3DItem } from "@modules/home/components/runway-belt-3d"

const RunwayBelt3D = dynamic(() => import("@modules/home/components/runway-belt-3d"), {
  loading: () => <div className="w-full bg-white h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]" />,
  ssr: false,
})

type Props = {
  items: RunwayBelt3DItem[]
  className?: string
}

const RunwayBelt3DClient = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(containerRef, "200px")
  const [hasEntered, setHasEntered] = useState(false)
  const hasPrefetchedRef = useRef(false)
  const placeholderClassName =
    "w-full bg-white h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]" +
    (props.className ? ` ${props.className}` : "")

  useEffect(() => {
    const el = containerRef.current
    if (!el || hasPrefetchedRef.current) return

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection
    if (connection?.saveData) {
      return
    }

    const scheduleIdle = (cb: () => void) => {
      const win = window as Window & { requestIdleCallback?: (cb: () => void) => number }
      if (typeof win.requestIdleCallback === "function") {
        win.requestIdleCallback(() => cb())
      } else {
        window.setTimeout(cb, 200)
      }
    }

    const preloadModels = (items: RunwayBelt3DItem[]) => {
      if (!document.head) return
      items.forEach((item) => {
        if (!item.modelSrc) return
        const href = item.modelSrc
        if (document.querySelector(`link[data-revetir-preload="${href}"]`)) return
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "fetch"
        link.type = "model/gltf-binary"
        link.href = href
        link.crossOrigin = "anonymous"
        link.setAttribute("fetchpriority", "low")
        link.setAttribute("data-revetir-preload", href)
        document.head.appendChild(link)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          hasPrefetchedRef.current = true
          scheduleIdle(() => preloadModels(props.items))
          observer.disconnect()
        }
      },
      { rootMargin: "1200px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [props.items])

  useEffect(() => {
    if (inView) {
      setHasEntered(true)
    }
  }, [inView])

  return (
    <div ref={containerRef} className="w-full">
      {hasEntered ? (
        <RunwayBelt3D {...props} isVisible={inView} />
      ) : (
        <div className={placeholderClassName} />
      )}
    </div>
  )
}

export default RunwayBelt3DClient
