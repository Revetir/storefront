"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [maxVisiblePages, setMaxVisiblePages] = useState(7)

  // Detect screen size and set max visible pages
  useEffect(() => {
    const updateMaxPages = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Small mobile: 3 pages
        setMaxVisiblePages(3)
      } else if (width < 1024) {
        // Large mobile/tablet: 4 pages
        setMaxVisiblePages(4)
      } else {
        // Desktop: 7 pages
        setMaxVisiblePages(7)
      }
    }

    updateMaxPages()
    window.addEventListener('resize', updateMaxPages)
    return () => window.removeEventListener('resize', updateMaxPages)
  }, [])

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Function to prefetch adjacent pages
  const prefetchPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      const params = new URLSearchParams(searchParams)
      params.set("page", pageNum.toString())
      router.prefetch(`${pathname}?${params.toString()}`)
    }
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx(
        "mt-5 uppercase text-lg font-sans px-3 sm:px-4 lg:px-5 py-2 cursor-pointer min-w-[40px] sm:min-w-[48px]",
        {
          "font-bold text-black border-b-2 border-b-black": isCurrent,
          "text-gray-700 hover:text-black": !isCurrent,
        },
        isPending && "opacity-50 cursor-not-allowed"
      )}
      disabled={isCurrent || isPending}
      onClick={() => handlePageChange(p)}
      onMouseEnter={() => {
        // Prefetch adjacent pages on hover
        prefetchPage(p - 1)
        prefetchPage(p + 1)
      }}
    >
      {label}
    </button>
  )

  // Function to render BACK button
  const renderBackButton = () => {
    if (page <= 1) return null

    return (
      <button
        key="back"
        className={clx(
          "mt-5 uppercase text-lg font-sans px-3 sm:px-4 lg:px-5 py-2 cursor-pointer whitespace-nowrap",
          "text-gray-700 hover:text-black",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        disabled={isPending}
        onClick={() => handlePageChange(page - 1)}
        onMouseEnter={() => prefetchPage(page - 1)}
      >
        &lt; BACK
      </button>
    )
  }

  // Function to render NEXT button
  const renderNextButton = () => {
    if (page >= totalPages) return null

    return (
      <button
        key="next"
        className={clx(
          "mt-5 uppercase text-lg font-sans px-3 sm:px-4 lg:px-5 py-2 cursor-pointer whitespace-nowrap",
          "text-gray-700 hover:text-black",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        disabled={isPending}
        onClick={() => handlePageChange(page + 1)}
        onMouseEnter={() => prefetchPage(page + 1)}
      >
        NEXT &gt;
      </button>
    )
  }

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="txt-xlarge-plus text-ui-fg-muted items-center cursor-default"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is within the max visible limit
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Determine how many pages to show based on responsive breakpoint
      const halfVisible = Math.floor(maxVisiblePages / 2)

      // Calculate threshold for showing first/last pages with ellipses
      const nearStart = page <= halfVisible + 1
      const nearEnd = page >= totalPages - halfVisible

      if (nearStart) {
        // Show first N pages, ..., lastpage
        buttons.push(
          ...arrayRange(1, maxVisiblePages).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (nearEnd) {
        // Show 1, ..., last N pages
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - maxVisiblePages + 1, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., surrounding pages, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))

        // Show current page and surrounding pages
        const surroundingPages = Math.min(maxVisiblePages - 2, 3) // Reserve space for first, last, and ellipses
        const startPage = page - Math.floor(surroundingPages / 2)
        const endPage = page + Math.floor(surroundingPages / 2)

        buttons.push(
          ...arrayRange(startPage, endPage).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <div className="flex justify-center w-full mt-12 mb-8">
      <div
        className="flex items-end mb-5 w-[80%] justify-center"
        style={{ columnGap: "clamp(0.25rem, 4vw, 1.25rem)" }}
        data-testid={dataTestid}
      >
        {renderBackButton()}
        {renderPageButtons()}
        {renderNextButton()}
      </div>
    </div>
  )
}
