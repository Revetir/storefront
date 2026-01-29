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
  const placeholderClassName =
    "w-full bg-white h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]" +
    (props.className ? ` ${props.className}` : "")

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
