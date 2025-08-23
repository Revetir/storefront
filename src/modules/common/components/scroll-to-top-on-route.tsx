"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTopOnRoute() {
	const pathname = usePathname()

	useEffect(() => {
		try {
			window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
		} catch {
			window.scrollTo(0, 0)
		}
	}, [pathname])

	return null
}


