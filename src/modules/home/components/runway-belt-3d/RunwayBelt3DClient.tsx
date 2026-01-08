"use client"

import dynamic from "next/dynamic"

const RunwayBelt3DClient = dynamic(() => import("@modules/home/components/runway-belt-3d"), {
  loading: () => <div className="h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]" />,
  ssr: false,
})

export default RunwayBelt3DClient
