import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export interface Category extends HttpTypes.StoreProductCategory {
  gender: "menswear" | "womenswear" | "unisex"
  children?: Category[]
}

/**
 * Recursively tag a raw StoreProductCategory with a `gender` field and map its children
 */
function tagGender(cat: HttpTypes.StoreProductCategory): Category {
  // Extract prefix from handle (e.g. "mens-pants" => "mens")
  const prefix = cat.handle.split("-")[0]
  let gender: Category["gender"] =
    prefix === "mens" ? "menswear"
    : prefix === "womens" ? "womenswear"
    : "unisex"

  return {
    ...cat,
    gender,
    children: (cat.category_children || []).map(tagGender),
  }
}

const fetchCategoryChildren = async (
  parentId: string,
  depth = 2
): Promise<HttpTypes.StoreProductCategory[]> => {
  if (depth <= 0) return []

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    query: {
      parent_id: parentId,
      limit: 100,
    },
    cache: "force-cache",
  })

  const nestedChildren = await Promise.all(
    product_categories.map(async (cat) => {
      const children = await fetchCategoryChildren(cat.id, depth - 1)
      return { ...cat, category_children: children }
    })
  )

  return nestedChildren
}

export const listCategories = async (): Promise<Category[]> => {
  const next = await getCacheOptions("categories")

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    query: {
      limit: 1000, // Get everything
    },
    next,
    cache: "force-cache",
  })

  const map = new Map<string, Category>()

  // Tag each category and add to map (without children initially)
  product_categories.forEach((cat) => {
    const taggedCat = tagGender(cat)
    // Clear any existing children to rebuild properly
    taggedCat.children = []
    map.set(cat.id, taggedCat)
  })

  // Build the tree structure by assigning children to parents
  const roots: Category[] = []
  
  // First pass: identify all root categories (those without parents)
  map.forEach((cat) => {
    if (!cat.parent_category_id) {
      roots.push(cat)
    }
  })
  
  // Second pass: assign children to their parents
  map.forEach((cat) => {
    if (cat.parent_category_id && map.has(cat.parent_category_id)) {
      const parent = map.get(cat.parent_category_id)!
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(cat)
    }
  })

  // Sort categories recursively
  const sortCategoriesRecursively = (categories: Category[]): Category[] => {
    return categories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => ({
        ...cat,
        children: cat.children && cat.children.length > 0 
          ? sortCategoriesRecursively(cat.children)
          : cat.children
      }))
  }

  return sortCategoriesRecursively(roots)
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<Category | undefined> => {
  // For flat URLs, we only need the last segment (the actual category handle)
  const handle = categoryHandle[categoryHandle.length - 1]

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    query: {
      handle,
    },
    cache: "force-cache",
  })

  const raw = product_categories[0]
  if (!raw) return undefined

  const children = await fetchCategoryChildren(raw.id, 3)
  return tagGender({ ...raw, category_children: children })
}

// New function to find category by flat handle from the full tree
export const getCategoryByFlatHandle = async (
  handle: string
): Promise<Category | undefined> => {
  const allCategories = await listCategories()
  
  // Recursively search through the category tree
  const findCategoryByHandle = (categories: Category[], targetHandle: string): Category | undefined => {
    for (const category of categories) {
      if (category.handle === targetHandle) {
        return category
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryByHandle(category.children, targetHandle)
        if (found) return found
      }
    }
    return undefined
  }
  
  return findCategoryByHandle(allCategories, handle)
}
