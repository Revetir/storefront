'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

type Category = {
  id: string
  name: string
  handle: string
}

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()
  const params = useParams()

  const countryCode = params?.countryCode as string

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories`)
        const data = await res.json()
        setCategories(data.categories)
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  return (
    <aside className="flex flex-col gap-2 my-4">
      <h2 className="text-xs uppercase text-gray-500 mb-3">Categories test</h2>
      <ul className="space-y-4">
        {categories.map((category) => {
          // Extract gender and category slug from handle
          let gender: string
          let categorySlug: string
          
          if (category.handle.startsWith("mens-")) {
            gender = "men"
            categorySlug = category.handle.replace("mens-", "")
          } else if (category.handle.startsWith("womens-")) {
            gender = "women"
            categorySlug = category.handle.replace("womens-", "")
          } else {
            // Fallback to men if no gender prefix
            gender = "men"
            categorySlug = category.handle
          }
          
          const href = `/${countryCode}/${gender}/${categorySlug}`
          const isActive = pathname.includes(categorySlug)

          return (
            <li key={category.id}>
              <Link
                href={href}
                className={`block text-xs uppercase font-sans px-2 py-1 ${
                  isActive ? 'font-bold bg-gray-100 text-black' : 'text-gray-700 hover:text-black'
                }`}
              >
                {category.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default ProductCategories
