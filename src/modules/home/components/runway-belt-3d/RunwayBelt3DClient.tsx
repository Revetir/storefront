"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import NextImage from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useIntersection } from "@lib/hooks/use-in-view"
import type { RunwayBelt3DItem } from "@modules/home/components/runway-belt-3d"

const RunwayBelt3D = dynamic(() => import("@modules/home/components/runway-belt-3d"), {
  loading: () => null,
  ssr: false,
})

const beltHeightClass = "h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]"
const previewCamera = {
  position: { x: 0, y: 1.4, z: 5 },
  target: { x: 0, y: 0.55, z: 0 },
  fov: 28,
}
const previewTargetHeight = 0.9

type Vec3 = { x: number; y: number; z: number }

const vecSub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const vecDot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
const vecCross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})
const vecNormalize = (v: Vec3): Vec3 => {
  const len = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

type Props = {
  items: RunwayBelt3DItem[]
  className?: string
}

function PreviewBelt({ items, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const [previewAspects, setPreviewAspects] = useState<Record<string, number>>({})

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      setBounds({ width: el.clientWidth, height: el.clientHeight })
    }

    update()

    if (typeof ResizeObserver === "undefined") {
      return
    }

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isMounted = true
    const nextAspects: Record<string, number> = {}

    const sources = items
      .map((item) => item.previewSrc)
      .filter((src): src is string => Boolean(src))

    sources.forEach((src) => {
      if (previewAspects[src]) return
      const img = new window.Image()
      img.onload = () => {
        if (!isMounted) return
        if (!img.naturalWidth || !img.naturalHeight) return
        const aspect = img.naturalWidth / img.naturalHeight
        setPreviewAspects((prev) => ({ ...prev, [src]: aspect }))
      }
      img.src = src
    })

    return () => {
      isMounted = false
    }
  }, [items, previewAspects])

  const layout = (() => {
    if (!bounds.width || !bounds.height) return null

    const aspect = bounds.width / bounds.height
    const fovRad = (previewCamera.fov * Math.PI) / 180
    const f = 1 / Math.tan(fovRad / 2)

    const forward = vecNormalize(vecSub(previewCamera.target, previewCamera.position))
    const right = vecNormalize(vecCross(forward, { x: 0, y: 1, z: 0 }))
    const up = vecCross(right, forward)

    const project = (point: Vec3) => {
      const delta = vecSub(point, previewCamera.position)
      const xCam = vecDot(delta, right)
      const yCam = vecDot(delta, up)
      const zCam = vecDot(delta, forward)

      if (zCam <= 0) {
        return { x: 0, y: 0 }
      }

      return {
        x: (xCam / zCam) * (f / aspect),
        y: (yCam / zCam) * f,
      }
    }

    const isMobile = bounds.width < 640
    const spacing = isMobile ? 1.2 : 1.8

    // Breakpoint-specific depth influence values tuned to match 3D render sizes.
    // These values control the projected height of the preview images.
    const getDepthInfluence = (width: number): number => {
      if (width < 640) return 0.5    // mobile: reduce size
      if (width < 768) return 0.7    // sm
      if (width < 1024) return 1.2   // md
      if (width < 1280) return 1.8   // lg
      return 2.4                      // xl+: increase size
    }
    const depthInfluence = getDepthInfluence(bounds.width)

    const positions = items.map((item, idx) => {
      const offset = (idx - (items.length - 1) / 2) * spacing
      const height =
        previewTargetHeight *
        (item.scale ?? 1) *
        (item.previewScale ?? 1)

      const previewAspect =
        item.previewAspect ??
        (item.previewSrc ? previewAspects[item.previewSrc] ?? 1 : 1)
      const previewDepth = item.previewDepth ?? previewAspect

      const halfW = (height * previewAspect) / 2
      const halfD = (height * previewDepth * depthInfluence) / 2

      // Project 8 corners of the 3D bounding box for SIZE calculation
      const corners: Vec3[] = [
        { x: offset - halfW, y: height, z: halfD },
        { x: offset + halfW, y: height, z: halfD },
        { x: offset - halfW, y: 0, z: halfD },
        { x: offset + halfW, y: 0, z: halfD },
        { x: offset - halfW, y: height, z: -halfD },
        { x: offset + halfW, y: height, z: -halfD },
        { x: offset - halfW, y: 0, z: -halfD },
        { x: offset + halfW, y: 0, z: -halfD },
      ]

      const projected = corners.map((corner) => project(corner))
      const xs = projected.map((p) => p.x)
      const ys = projected.map((p) => p.y)

      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)

      const heightPercent = Math.max(0, (maxY - minY) * 50)
      const widthPercent = Math.max(0, (maxX - minX) * 50)

      // Project single point at z=0 for X POSITION (matching 3D model placement)
      // Use bounding box center for Y position since that accounts for perspective
      const projectedX = project({ x: offset, y: 0, z: 0 })
      const left = (projectedX.x + 1) * 50
      const bottomY = (1 - minY) * 50

      return {
        left,
        bottom: bottomY,
        width: widthPercent,
        height: heightPercent,
      }
    })

    if (positions.some((pos) => !Number.isFinite(pos.width) || !Number.isFinite(pos.height))) {
      return null
    }

    return positions
  })()

  return (
    <section
      className={
        "w-full h-full bg-white select-none " +
        (className ?? "")
      }
      aria-label="3D runway belt"
    >
      <div ref={containerRef} className="w-full h-full">
        {layout ? (
          <div className="relative w-full h-full">
            {items.map((item, idx) => {
              const wrapperStyle: CSSProperties = {
                position: "absolute",
                left: `${layout[idx].left}%`,
                top: `${layout[idx].bottom}%`,
                transform: "translate(-50%, -100%)",
                width: `${layout[idx].width}%`,
                height: `${layout[idx].height}%`,
              }

              const image = item.previewSrc ? (
                <div className="relative w-full h-full">
                  <NextImage
                    src={item.previewSrc}
                    alt={item.alt || ""}
                    fill
                    sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, (max-width: 1024px) 200px, 240px"
                    className="object-contain object-bottom"
                    quality={85}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-white" />
              )

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} style={wrapperStyle} className="block">
                    {image}
                  </Link>
                )
              }
              return (
                <div key={item.id} style={wrapperStyle} className="block">
                  {image}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 sm:px-6 md:px-12">
            {items.map((item) => {
              const image = item.previewSrc ? (
                <div className="relative h-[65%] aspect-square">
                  <NextImage
                    src={item.previewSrc}
                    alt={item.alt || ""}
                    fill
                    sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, (max-width: 1024px) 200px, 240px"
                    className="object-contain object-bottom"
                    quality={85}
                  />
                </div>
              ) : (
                <div className="h-[65%] aspect-square bg-white" />
              )

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} className="block h-full flex items-center">
                    {image}
                  </Link>
                )
              }
              return (
                <div key={item.id} className="h-full flex items-center">
                  {image}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

const RunwayBelt3DClient = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(containerRef, "200px")
  const [hasEntered, setHasEntered] = useState(false)
  const [shouldMount3d, setShouldMount3d] = useState(false)
  const [threeReady, setThreeReady] = useState(false)
  const hasPrefetchedRef = useRef(false)

  const hasPreviews = props.items.some((item) => item.previewSrc)

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

  useEffect(() => {
    if (!hasEntered || shouldMount3d) return

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    const scheduleMount = () => setShouldMount3d(true)

    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(() => scheduleMount(), { timeout: 1200 })
      return () => win.cancelIdleCallback?.(handle)
    }

    const timeout = window.setTimeout(scheduleMount, 200)
    return () => window.clearTimeout(timeout)
  }, [hasEntered, shouldMount3d])

  return (
    <div
      ref={containerRef}
      className={`w-full relative ${beltHeightClass}` + (props.className ? ` ${props.className}` : "")}
      style={{ overflowAnchor: "none", contain: "layout" }}
    >
      {/* 2D preview: shown immediately, fades out once 3D is ready */}
      {hasPreviews && (
        <div
          className={
            "absolute inset-0 transition-opacity duration-500" +
            (threeReady ? " opacity-0 pointer-events-none" : " opacity-100")
          }
          aria-hidden={threeReady}
        >
          <PreviewBelt {...props} />
        </div>
      )}

      {/* 3D canvas: loaded once in view, fades in over the preview */}
      {shouldMount3d && (
        <div
          className={
            "absolute inset-0 transition-opacity duration-500" +
            (threeReady ? " opacity-100" : " opacity-0 pointer-events-none")
          }
        >
          <RunwayBelt3D
            {...props}
            isVisible={inView}
            onReady={() => setThreeReady(true)}
          />
        </div>
      )}
    </div>
  )
}

export default RunwayBelt3DClient
