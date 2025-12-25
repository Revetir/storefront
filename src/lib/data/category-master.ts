export type TemplateCategory =
  | "Pants"
  | "T-Shirts"
  | "Sweaters"
  | "Shorts"
  | "Jackets"
  | "Shoes Unisex"
  | "Shoes Men"
  | "Shoes Women"

export interface CategoryRecord {
  id: string
  handle: string
  name: string
  parentId?: string
  childIds: string[]
}

interface CategoryMasterState {
  byId: Record<string, CategoryRecord>
  byHandle: Record<string, string> // handle -> id
  byName: Record<string, string> // normalized name -> id
  templateById: Record<string, TemplateCategory> // Only store by ID - use hierarchy for lookups
  initialized: boolean
  initPromise: Promise<void> | null
}

const state: CategoryMasterState = {
  byId: {},
  byHandle: {},
  byName: {},
  templateById: {},
  initialized: false,
  initPromise: null,
}

const normalizeName = (name: string) => name.trim().toLowerCase()

/**
 * Fetch categories from backend and initialize CategoryMaster state.
 * This is called lazily on first access (typically when sizing modal opens).
 * Uses Promise deduplication to prevent multiple concurrent fetches.
 */
async function ensureInitialized(): Promise<void> {
  // Already initialized, return immediately
  if (state.initialized) return

  // Initialization in progress, wait for existing Promise
  if (state.initPromise) return state.initPromise

  // Start new initialization
  state.initPromise = (async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
                     process.env.MEDUSA_BACKEND_URL ||
                     "https://application-production-0ced.up.railway.app"

      const response = await fetch(`${baseUrl}/store/categories`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        cache: "default", // Use browser cache with default strategy
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const categories = data.categories || []

      // Transform backend categories to CategoryRecord format
      const records: CategoryRecord[] = categories.map((cat: any) => ({
        id: cat.id,
        handle: cat.handle,
        name: cat.name,
        parentId: cat.parent_category_id,
        childIds: [], // Will be populated in next step
      }))

      // Build childIds arrays by scanning parentId references
      const childIdsMap = new Map<string, string[]>()
      records.forEach((cat) => {
        if (cat.parentId) {
          if (!childIdsMap.has(cat.parentId)) {
            childIdsMap.set(cat.parentId, [])
          }
          childIdsMap.get(cat.parentId)!.push(cat.id)
        }
      })

      // Assign childIds back to records
      records.forEach((cat) => {
        cat.childIds = childIdsMap.get(cat.id) || []
      })

      // Populate state using existing upsertCategories method
      CategoryMaster.upsertCategories(records)

      // Apply template assignments after categories are loaded
      applyTemplateAssignments()

      state.initialized = true
      console.log(`[CategoryMaster] Initialized with ${records.length} categories`)
    } catch (error) {
      console.error("[CategoryMaster] Failed to initialize:", error)
      // Don't mark as initialized so it retries on next call
      throw error
    } finally {
      state.initPromise = null
    }
  })()

  return state.initPromise
}

/**
 * Apply hardcoded template assignments to categories.
 * This is called after categories are loaded from the backend.
 * Template assignments are kept in code because they correspond to
 * frontend diagram components and sizing templates.
 */
function applyTemplateAssignments(): void {
  // SHOES - Fully implemented (uses size conversion tables, not diagrams)
  CategoryMaster.setTemplate({ handle: "mens-shoes" }, "Shoes Men")
  CategoryMaster.setTemplate({ handle: "womens-shoes" }, "Shoes Women")

  // PANTS & JEANS
  CategoryMaster.setTemplate({ handle: "mens-pants" }, "Pants")
  CategoryMaster.setTemplate({ handle: "womens-pants" }, "Pants")
  CategoryMaster.setTemplate({ handle: "mens-jeans" }, "Pants")

  // T-SHIRTS
  // Note: Child categories (mens-long-sleeve-t-shirts, mens-short-sleeve-t-shirts, etc.)
  // automatically inherit template from parent via hierarchical lookup
  CategoryMaster.setTemplate({ handle: "mens-t-shirts" }, "T-Shirts")
  CategoryMaster.setTemplate({ handle: "womens-t-shirts" }, "T-Shirts")

  // POLOS
  // TODO: Create dedicated polo diagram with collar-specific measurements when design is ready
  // Temporarily using T-Shirts template until polo-specific diagram is implemented
  CategoryMaster.setTemplate({ handle: "mens-polos" }, "T-Shirts")
  CategoryMaster.setTemplate({ handle: "womens-polos" }, "T-Shirts")

  // SWEATERS
  CategoryMaster.setTemplate({ handle: "mens-sweaters" }, "Sweaters")
  CategoryMaster.setTemplate({ handle: "womens-sweaters" }, "Sweaters")

  // SHORTS
  CategoryMaster.setTemplate({ handle: "mens-shorts" }, "Shorts")
  CategoryMaster.setTemplate({ handle: "womens-shorts" }, "Shorts")

  // JACKETS
  CategoryMaster.setTemplate({ handle: "mens-bombers" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "mens-denim-jackets" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "mens-down" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "mens-jackets" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "mens-leather-jackets" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "womens-bombers" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "womens-denim-jackets" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "womens-down" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "womens-jackets" }, "Jackets")
  CategoryMaster.setTemplate({ handle: "womens-leather-jackets" }, "Jackets")
}

export const CategoryMaster = {
  // O(1) queries - now async to ensure initialization
  async getById(id: string): Promise<CategoryRecord | undefined> {
    await ensureInitialized()
    return state.byId[id]
  },

  async getByHandle(handle: string): Promise<CategoryRecord | undefined> {
    await ensureInitialized()
    const id = state.byHandle[handle]
    return id ? state.byId[id] : undefined
  },

  async getByName(name: string): Promise<CategoryRecord | undefined> {
    await ensureInitialized()
    const id = state.byName[normalizeName(name)]
    return id ? state.byId[id] : undefined
  },

  // Template lookups - uses hierarchical lookup by default
  async getTemplateForCategory(input: { id?: string; handle?: string; name?: string }): Promise<TemplateCategory | undefined> {
    await ensureInitialized()

    // Get the category ID from any input format
    let categoryId: string | undefined

    if (input.id) {
      categoryId = input.id
    } else if (input.handle) {
      categoryId = state.byHandle[input.handle]
    } else if (input.name) {
      const id = state.byName[normalizeName(input.name)]
      categoryId = id
    }

    // Use hierarchical lookup if we have an ID
    if (categoryId) {
      return this.getTemplateForCategoryHierarchical(categoryId)
    }

    return undefined
  },

  // Registration APIs (called internally after fetch, or externally for testing)
  upsertCategories(categories: CategoryRecord[]) {
    for (const c of categories) {
      state.byId[c.id] = { ...c, childIds: Array.isArray(c.childIds) ? c.childIds : [] }
      state.byHandle[c.handle] = c.id
      state.byName[normalizeName(c.name)] = c.id
    }
  },

  // Assign a sizing template for a category (by ID or handle)
  // This is synchronous and called internally by applyTemplateAssignments()
  setTemplate(input: { id?: string; handle?: string }, template: TemplateCategory) {
    let categoryId: string | undefined

    if (input.id) {
      categoryId = input.id
    } else if (input.handle) {
      categoryId = state.byHandle[input.handle]
    }

    if (categoryId) {
      state.templateById[categoryId] = template
    }
  },

  // Hierarchical lookup: traverse up parent chain to find a template
  getTemplateForCategoryHierarchical(categoryId: string): TemplateCategory | undefined {
    let currentId: string | undefined = categoryId
    const visited = new Set<string>() // prevent infinite loops

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)
      const categoryRecord: CategoryRecord | undefined = state.byId[currentId]

      // Check if current category has a template
      const template = state.templateById[currentId]
      if (template) {
        return template
      }

      // Move up to parent
      currentId = categoryRecord?.parentId
    }

    return undefined
  },

  // Check if a category or any of its ancestors matches a target category ID
  async isDescendantOf(categoryId: string, targetCategoryId: string): Promise<boolean> {
    await ensureInitialized()

    if (categoryId === targetCategoryId) return true

    let currentId: string | undefined = categoryId
    const visited = new Set<string>()

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)

      if (currentId === targetCategoryId) return true

      const categoryRecord: CategoryRecord | undefined = state.byId[currentId]
      currentId = categoryRecord?.parentId
    }

    return false
  },
}

export type { CategoryMasterState }
