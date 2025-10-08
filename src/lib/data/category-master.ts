export type TemplateCategory =
  | "Shirts"
  | "Sweatshirts"
  | "Pants"
  | "Merch"
  | "Shoes Unisex"
  | "Shoes Men"
  | "Shoes Women"
  | "Generic"

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
}

const state: CategoryMasterState = {
  byId: {},
  byHandle: {},
  byName: {},
  templateById: {},
}

const normalizeName = (name: string) => name.trim().toLowerCase()

export const CategoryMaster = {
  // O(1) queries
  getById(id: string): CategoryRecord | undefined {
    return state.byId[id]
  },
  getByHandle(handle: string): CategoryRecord | undefined {
    const id = state.byHandle[handle]
    return id ? state.byId[id] : undefined
  },
  getByName(name: string): CategoryRecord | undefined {
    const id = state.byName[normalizeName(name)]
    return id ? state.byId[id] : undefined
  },

  // Template lookups - uses hierarchical lookup by default
  getTemplateForCategory(input: { id?: string; handle?: string; name?: string }): TemplateCategory | undefined {
    // Get the category ID from any input format
    let categoryId: string | undefined

    if (input.id) {
      categoryId = input.id
    } else if (input.handle) {
      categoryId = state.byHandle[input.handle]
    } else if (input.name) {
      const rec = this.getByName(input.name)
      categoryId = rec?.id
    }

    // Use hierarchical lookup if we have an ID
    if (categoryId) {
      return this.getTemplateForCategoryHierarchical(categoryId)
    }

    return undefined
  },

  // Registration APIs (called when new category JSON is provided)
  upsertCategories(categories: CategoryRecord[]) {
    for (const c of categories) {
      state.byId[c.id] = { ...c, childIds: Array.isArray(c.childIds) ? c.childIds : [] }
      state.byHandle[c.handle] = c.id
      state.byName[normalizeName(c.name)] = c.id
    }
  },

  // Assign a sizing template for a category (by ID or handle)
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
    const path: string[] = []

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)
      const category = state.byId[currentId]
      path.push(`${category?.name || currentId} (${currentId})`)

      // Check if current category has a template
      const template = state.templateById[currentId]
      if (template) {
        return template
      }

      // Move up to parent
      currentId = category?.parentId
    }

    return undefined
  },

  // Check if a category or any of its ancestors matches a target category ID
  isDescendantOf(categoryId: string, targetCategoryId: string): boolean {
    if (categoryId === targetCategoryId) return true

    let currentId: string | undefined = categoryId
    const visited = new Set<string>()

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)

      if (currentId === targetCategoryId) return true

      const category = state.byId[currentId]
      currentId = category?.parentId
    }

    return false
  },
}

export type { CategoryMasterState }

// --- Registered categories (will grow as you provide more) ---
// Note: Only id, handle, name, parentId, childIds are stored here
// Top-level: Menswear and Womenswear
;(function registerInitialCategories() {
  const menswearId = "pcat_01JZQC5TCHD18GKNMJ7JG9VPJY"
  const womenswearId = "pcat_01JZQC6ANAHKS562Y0WM5CQ5CW"

  const mensChildren = [
    "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", // mens-bags
    "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", // mens-clothing
    "pcat_01JZQE228PGDRWJFRD5QGJFQ42", // mens-accessories
    "pcat_01JZQE15BY6WQF4GMK73R7FQD3", // mens-shoes
  ]

  const womensChildren = [
    "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", // womens-clothing
    "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", // womens-shoes
    "pcat_01JZQE2EBYCV58RPMY5HXM5JP2", // womens-accessories
    "pcat_01JZQE32E8EA3H997K6PY4QY99", // womens-bags
  ]

  const records: CategoryRecord[] = [
    { id: menswearId, handle: "men", name: "Menswear", parentId: undefined, childIds: mensChildren },
    { id: womenswearId, handle: "women", name: "Womenswear", parentId: undefined, childIds: womensChildren },

    // Menswear children
    { id: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", handle: "mens-bags", name: "Bags", parentId: menswearId, childIds: [
      "pcat_01JZXJ48EZT9DABBY64WNWC791",
      "pcat_01JZXJ4S4MMM8V6N0TFVEKCGW1",
      "pcat_01JZXJ5EDYRWAMQC2S13FXQQF4",
      "pcat_01JZXJ69HQPD7NVZQ8CBWM5CT6",
      "pcat_01JZXJ7A3FJE9TYTGHAY8Q8QQK",
      "pcat_01JZXJ7VMBH484YK8FD8D6RYF8",
      "pcat_01JZXJ8GMGP5EYADZDMZGCHQ6V",
    ] },
    { id: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", handle: "mens-clothing", name: "Clothing", parentId: menswearId, childIds: [
      "pcat_01JZQJZE6E5ZPKRN1KXZD5PDPA", // mens-jackets-coats
      "pcat_01JZQK0CM9ZRF3XKEH1GYPQTHH", // mens-jeans
      "pcat_01JZQK2890NKVFE5HMAE9ZNT0J", // mens-pants
      "pcat_01JZQK2RDBD0VFACQD3PV919HQ", // mens-shirts
      "pcat_01JZQK34T48GJRRKGJFRHMQDN4", // mens-shorts
      "pcat_01JZQK3P08QMVYZA1TBHFZ8Y7A", // mens-suits-blazers
      "pcat_01JZQK44VG19CN0S5SYE54RNW7", // mens-sweaters
      "pcat_01JZQK4KB1VSA9YJ83Z93W2M6W", // mens-swimwear
      "pcat_01JZQK4ZJKTMWRJ5W2Y2PH38N5", // mens-tops
      "pcat_01JZQK5H03A725W4TFFM19DEVT", // mens-underwear-loungewear
    ] },
    { id: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", handle: "mens-accessories", name: "Accessories", parentId: menswearId, childIds: [
      "pcat_01JZQEFQ2WWW8S2QC0E0GAX14G",
      "pcat_01JZQEPNH21X81NDRFCZ4RHDX4",
      "pcat_01JZQEJRT1XGV6E96HSCK9TAVM",
      "pcat_01JZQEK5QEAVMF7VAD5V3FP33W",
      "pcat_01JZQETGX369KPAMQV5CVWGAX0",
      "pcat_01JZQFMQASHNF580XWDEGAFNFC",
      "pcat_01JZQHEM0KM1D2N5PPPBBV3SHH",
      "pcat_01JZQHF7T8E6NZ8VGRBRDFWGXP",
      "pcat_01JZQHFNQ065PX7EGYERNGCSNY",
      "pcat_01JZQHG4Q6S0JSPDKZBAD627AY",
      "pcat_01JZQHJB4XXMA9YWJWBH12CD7S",
      "pcat_01JZQHKGNZHTH73Q67EY4834JW",
      "pcat_01JZQJQB4G13RNMRJQ2Y8YC3X8",
      "pcat_01JZQJY71KKV0ZN3TR7EF35SZD",
      "pcat_01JZQJPE58JFVTCK30WQKV2AQ3",
    ] },
    { id: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", handle: "mens-shoes", name: "Shoes", parentId: menswearId, childIds: [
      "pcat_01JZXGZD8ZKDP6BWT2Q2R681N1", // mens-boat-shoes-moccasins
      "pcat_01JZXH13EK8KP06M8MJ1BPF58J", // mens-boots
      "pcat_01JZXHZCEBF4CRZKX3T0SEXQDE", // mens-espadrilles
      "pcat_01JZXJ03HJYQ0JCV2D9DHWSF4H", // mens-lace-ups-oxfords
      "pcat_01JZXJ0HQY3NHJFC63JNVTJGD4", // mens-monkstraps
      "pcat_01JZXJ11D6JTH4K1DVM8FKA9A0", // mens-sandals
      "pcat_01JZXJ1ND58ZXASK8WSCXQNBNG", // mens-slippers-loafers
      "pcat_01JZXJ27Y2DCPH5Y6E2NP1TH64", // mens-sneakers
    ] },
    // Menswear > Clothing children
    { id: "pcat_01JZQJZE6E5ZPKRN1KXZD5PDPA", handle: "mens-jackets-coats", name: "Jackets & Coats", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXJ9PRE90J41VNK437H8GKD",
      "pcat_01JZXJSZ5XHYYYP99C5STV8SFE",
      "pcat_01JZXJTD9AA8X3A5284EMCFMJ2",
      "pcat_01JZXJV0K49HP4J0SDN6KZQ6KR",
      "pcat_01JZXJW03HNJVPY9S0AHJWP39G",
      "pcat_01JZXJWD458Y1J5PE5ZENG29YX",
      "pcat_01JZXJX13CNAD3JCZWEV256RXM",
      "pcat_01JZXJXHD87TJJ80RTSKP7WGVV",
      "pcat_01JZXJXZ9EQFV4NHY1J1Q6P5A8",
      "pcat_01JZXJVM0Z8T2FNKBHMNWC9T9J",
    ] },
    { id: "pcat_01JZQK0CM9ZRF3XKEH1GYPQTHH", handle: "mens-jeans", name: "Jeans", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [] },
    { id: "pcat_01JZQK2890NKVFE5HMAE9ZNT0J", handle: "mens-pants", name: "Pants", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXJYS4FPTR0H63DEEQH57ER",
      "pcat_01JZXJZBRJY68DB90CREA8HRRX",
      "pcat_01JZXJZV1HMEZ8344FMQY60HF1",
      "pcat_01JZXK0B46XV72WGSA687VPPWN",
    ] },
    { id: "pcat_01JZQK2RDBD0VFACQD3PV919HQ", handle: "mens-shirts", name: "Shirts", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [] },
    { id: "pcat_01JZQK34T48GJRRKGJFRHMQDN4", handle: "mens-shorts", name: "Shorts", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [] },
    { id: "pcat_01JZQK3P08QMVYZA1TBHFZ8Y7A", handle: "mens-suits-blazers", name: "Suits & Blazers", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXK26FZRK7VS70RGKY81W2W",
      "pcat_01JZXK2PF2BE45CFP2BHEPWVJZ",
      "pcat_01JZXK3745W553EN6RPS7MD8M2",
    ] },
    { id: "pcat_01JZQK44VG19CN0S5SYE54RNW7", handle: "mens-sweaters", name: "Sweaters", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXK3QMKEQG14JMV6YJVM2M3",
      "pcat_01JZXK466NVZZXK8VAP9757KDF",
      "pcat_01JZXK4QHJ0VRQXFD42YA12XPC",
      "pcat_01JZXK56KP2FX54P9PNYEHPJD2",
      "pcat_01JZXK5MKENNRN09795KGQW44R",
      "pcat_01JZXK65XR75ETH2HX4AQ7PR9N",
      "pcat_01JZXK6TAK93Q0KFV9DRY70EPS",
    ] },
    { id: "pcat_01JZQK4KB1VSA9YJ83Z93W2M6W", handle: "mens-swimwear", name: "Swimwear", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXK8FMHFYWQ6KNYK7HD9H5C",
    ] },
    { id: "pcat_01JZQK4ZJKTMWRJ5W2Y2PH38N5", handle: "mens-tops", name: "Tops", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXK92Q6V036ZEN09R8KCQQT",
      "pcat_01JZXK9GBKCY6EZN4TZQDENWGF",
      "pcat_01JZXKA0T0R3SF3W99371N7VCG",
      "pcat_01JZXKAP07MMDZJ9FN2X7KGBW1",
    ] },
    { id: "pcat_01JZQK5H03A725W4TFFM19DEVT", handle: "mens-underwear-loungewear", name: "Underwear & Loungewear", parentId: "pcat_01JZQDT6S6TPNYDMBVEAEAKJ6W", childIds: [
      "pcat_01JZXKB90TWK61E11B84JH8RVT",
      "pcat_01JZXKBT9TGJ6VB7RXQ50NHDNQ",
      "pcat_01JZXKCXHK21JEC8VWWWQNB7ED",
      "pcat_01JZXKDCAFTTW8DGC0JMMC57QV",
    ] },

    // Menswear > Shoes children
    { id: "pcat_01JZXGZD8ZKDP6BWT2Q2R681N1", handle: "mens-boat-shoes-moccasins", name: "Boat Shoes & Moccasins", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", handle: "mens-boots", name: "Boots", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXHZCEBF4CRZKX3T0SEXQDE", handle: "mens-espadrilles", name: "Espadrilles", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXJ03HJYQ0JCV2D9DHWSF4H", handle: "mens-lace-ups-oxfords", name: "Lace Ups & Oxfords", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXJ0HQY3NHJFC63JNVTJGD4", handle: "mens-monkstraps", name: "Monkstraps", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXJ11D6JTH4K1DVM8FKA9A0", handle: "mens-sandals", name: "Sandals", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXJ1ND58ZXASK8WSCXQNBNG", handle: "mens-slippers-loafers", name: "Slippers & Loafers", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },
    { id: "pcat_01JZXJ27Y2DCPH5Y6E2NP1TH64", handle: "mens-sneakers", name: "Sneakers", parentId: "pcat_01JZQE15BY6WQF4GMK73R7FQD3", childIds: [] },

    // Menswear > Boots children
    { id: "pcat_01JZXH1TTMM8WQXST6E89K9SCD", handle: "mens-biker-combat-boots", name: "Biker & Combat Boots", parentId: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", childIds: [] },
    { id: "pcat_01JZXH294WJR2QZ9EWVFXBHHRT", handle: "mens-chelsea-boots", name: "Chelsea Boots", parentId: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", childIds: [] },
    { id: "pcat_01JZXH2SJSCRWR3ECAQ94G82QR", handle: "mens-desert-boots", name: "Desert Boots", parentId: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", childIds: [] },
    { id: "pcat_01JZXHVFVX2WQCSP7HK59F10S6", handle: "mens-lace-up-boots", name: "Lace-up Boots", parentId: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", childIds: [] },
    { id: "pcat_01JZXHYK853TQMVBRNEZM1196C", handle: "mens-zip-up-buckled-boots", name: "Zip up & Buckled Boots", parentId: "pcat_01JZXH13EK8KP06M8MJ1BPF58J", childIds: [] },

    // Menswear > Sandals children
    { id: "pcat_01JZYE4H40E71ENJRHMXNJRG34", handle: "mens-flip-flops", name: "Flip Flops", parentId: "pcat_01JZXJ11D6JTH4K1DVM8FKA9A0", childIds: [] },
    { id: "pcat_01JZYE5CQES39PRGSCE2CJAJ25", handle: "mens-slides", name: "Slides", parentId: "pcat_01JZXJ11D6JTH4K1DVM8FKA9A0", childIds: [] },

    // Menswear > Sneakers children
    { id: "pcat_01JZYE6R9TTXPXK2Z5PT9FQDJX", handle: "mens-high-top-sneakers", name: "High Top Sneakers", parentId: "pcat_01JZXJ27Y2DCPH5Y6E2NP1TH64", childIds: [] },
    { id: "pcat_01JZYE7DAF1AV42F9K9PXDY4FZ", handle: "mens-low-top-sneakers", name: "Low Top Sneakers", parentId: "pcat_01JZXJ27Y2DCPH5Y6E2NP1TH64", childIds: [] },

    // Menswear > Bags children
    { id: "pcat_01JZXJ48EZT9DABBY64WNWC791", handle: "mens-backpacks", name: "Backpacks", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ4S4MMM8V6N0TFVEKCGW1", handle: "mens-briefcases", name: "Briefcases", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ5EDYRWAMQC2S13FXQQF4", handle: "mens-duffle-top-handle-bags", name: "Duffle & Top Handle Bags", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ69HQPD7NVZQ8CBWM5CT6", handle: "mens-messenger-bags-satchels", name: "Messenger Bags & Satchels", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ7A3FJE9TYTGHAY8Q8QQK", handle: "mens-pouches-document-holders", name: "Pouches & Document Holders", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ7VMBH484YK8FD8D6RYF8", handle: "mens-tote-bags", name: "Tote Bags", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },
    { id: "pcat_01JZXJ8GMGP5EYADZDMZGCHQ6V", handle: "mens-travel-bags", name: "Travel Bags", parentId: "pcat_01JZQE2QX7J016XH0DQ7ZN0DGV", childIds: [] },

    // Menswear > Accessories children
    { id: "pcat_01JZQEFQ2WWW8S2QC0E0GAX14G", handle: "mens-belts-suspenders", name: "Belts & Suspenders", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQEPNH21X81NDRFCZ4RHDX4", handle: "mens-eyewear", name: "Eyewear", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQEGHC7PG4S4RZKH45R9V3S",
      "pcat_01JZQEHEDGH03JCYFP4VD5KDB6",
    ] },
    { id: "pcat_01JZQEJRT1XGV6E96HSCK9TAVM", handle: "mens-face-masks", name: "Face Masks", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQEK5QEAVMF7VAD5V3FP33W", handle: "mens-gloves", name: "Gloves", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQETGX369KPAMQV5CVWGAX0", handle: "mens-hats", name: "Hats", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQFHREGEWE9J9JVMMNB8X3P",
      "pcat_01JZQFJC3P07D8BNK9R6Z47QV0",
      "pcat_01JZQFK1F5C377WF446Y2B4JPA",
      "pcat_01JZQFKJHYX08RFD8TMB9MAG1S",
    ] },
    { id: "pcat_01JZQFMQASHNF580XWDEGAFNFC", handle: "mens-jewelry", name: "Jewelry", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQFNE6MK75WVYBWC9AF5D1M",
      "pcat_01JZQHAC99X5SDXCXN6N4D677M",
      "pcat_01JZQHAC9D17NXN114SB0DSJNC",
      "pcat_01JZQHC8WE1GYE9RHNS2QWA1K9",
      "pcat_01JZQHCVXX639588XK7R3C4GB8",
      "pcat_01JZQHDE6JAFPAXCVEVE9Q3YZA",
    ] },
    { id: "pcat_01JZQHEM0KM1D2N5PPPBBV3SHH", handle: "mens-keychains", name: "Keychains", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQHF7T8E6NZ8VGRBRDFWGXP", handle: "pocket-squares-tie-bars", name: "Pocket Squares & Tie Bars", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQHFNQ065PX7EGYERNGCSNY", handle: "mens-scarves", name: "Scarves", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQHG4Q6S0JSPDKZBAD627AY", handle: "mens-socks", name: "Socks", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQHJB4XXMA9YWJWBH12CD7S", handle: "mens-tech", name: "Tech", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQHH54WSC6V2WXNKE3K46KA",
    ] },
    { id: "pcat_01JZQHKGNZHTH73Q67EY4834JW", handle: "mens-ties", name: "Ties", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQHKWRY1PG3C7VW339RWYAJ",
      "pcat_01JZQHMCAX3H0WX365X3AK011T",
    ] },
    { id: "pcat_01JZQJQB4G13RNMRJQ2Y8YC3X8", handle: "mens-wallets-card-holders", name: "Wallets & Card Holders", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [
      "pcat_01JZQJRC49MFB5ADZN9H3ZVGRT",
      "pcat_01JZQJRVX0K95QD2B4A5KFNE4J",
      "pcat_01JZQJSAWQ5ZGWCR9D79BCBRBR",
    ] },
    { id: "pcat_01JZQJY71KKV0ZN3TR7EF35SZD", handle: "mens-watches", name: "Watches", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },
    { id: "pcat_01JZQJPE58JFVTCK30WQKV2AQ3", handle: "mens-towels", name: "Towels", parentId: "pcat_01JZQE228PGDRWJFRD5QGJFQ42", childIds: [] },

    // Menswear > Eyewear children
    { id: "pcat_01JZQEGHC7PG4S4RZKH45R9V3S", handle: "mens-glasses", name: "Glasses", parentId: "pcat_01JZQEPNH21X81NDRFCZ4RHDX4", childIds: [] },
    { id: "pcat_01JZQEHEDGH03JCYFP4VD5KDB6", handle: "mens-sunglasses", name: "Sunglasses", parentId: "pcat_01JZQEPNH21X81NDRFCZ4RHDX4", childIds: [] },

    // Menswear > Hats children
    { id: "pcat_01JZQFHREGEWE9J9JVMMNB8X3P", handle: "mens-aviator", name: "Aviator", parentId: "pcat_01JZQETGX369KPAMQV5CVWGAX0", childIds: [] },
    { id: "pcat_01JZQFJC3P07D8BNK9R6Z47QV0", handle: "mens-beanies", name: "Beanies", parentId: "pcat_01JZQETGX369KPAMQV5CVWGAX0", childIds: [] },
    { id: "pcat_01JZQFK1F5C377WF446Y2B4JPA", handle: "mens-caps", name: "Caps", parentId: "pcat_01JZQETGX369KPAMQV5CVWGAX0", childIds: [] },
    { id: "pcat_01JZQFKJHYX08RFD8TMB9MAG1S", handle: "mens-structured-hats", name: "Structured Hats", parentId: "pcat_01JZQETGX369KPAMQV5CVWGAX0", childIds: [] },

    // Menswear > Jewelry children
    { id: "pcat_01JZQFNE6MK75WVYBWC9AF5D1M", handle: "mens-bracelets", name: "Bracelets", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },
    { id: "pcat_01JZQHAC99X5SDXCXN6N4D677M", handle: "mens-cufflinks", name: "Cufflinks", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },
    { id: "pcat_01JZQHAC9D17NXN114SB0DSJNC", handle: "mens-earrings", name: "Earrings", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },
    { id: "pcat_01JZQHC8WE1GYE9RHNS2QWA1K9", handle: "mens-necklaces", name: "Necklaces", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },
    { id: "pcat_01JZQHCVXX639588XK7R3C4GB8", handle: "mens-pendants-charms", name: "Pendants & Charms", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },
    { id: "pcat_01JZQHDE6JAFPAXCVEVE9Q3YZA", handle: "mens-rings", name: "Rings", parentId: "pcat_01JZQFMQASHNF580XWDEGAFNFC", childIds: [] },

    // Menswear > Tech children
    { id: "pcat_01JZQHH54WSC6V2WXNKE3K46KA", handle: "iphone-cases", name: "iPhone Cases", parentId: "pcat_01JZQHJB4XXMA9YWJWBH12CD7S", childIds: [] },

    // Menswear > Ties children
    { id: "pcat_01JZQHKWRY1PG3C7VW339RWYAJ", handle: "mens-bow-ties", name: "Bow Ties", parentId: "pcat_01JZQHKGNZHTH73Q67EY4834JW", childIds: [] },
    { id: "pcat_01JZQHMCAX3H0WX365X3AK011T", handle: "mens-neck-ties", name: "Neck Ties", parentId: "pcat_01JZQHKGNZHTH73Q67EY4834JW", childIds: [] },

    // Womenswear children
    { id: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", handle: "womens-clothing", name: "Clothing", parentId: womenswearId, childIds: [
      "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", // womens-lingerie
      "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", // womens-pants
      "pcat_01JZXZ6HMRR98NP74KY00CH8GY", // womens-skirts
      "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", // womens-sweaters
      "pcat_01JZXZCAN3ZDR9X6KAX1G4H7WB", // womens-swimwear
      "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", // womens-tops
    ] },
    { id: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", handle: "womens-shoes", name: "Shoes", parentId: womenswearId, childIds: [
      "pcat_01JZY0N024B85MW0BBAY0QBZ89", // womens-boots
      "pcat_01JZY0TY9ZA3TMHN8AF5DESAZF", // womens-flats
      "pcat_01JZY2R4J4X2KDZ60CS5KNQG8S", // womens-lace-ups-oxfords
      "pcat_01JZY2TQ8WK0PAK2AP1D8N08SK", // womens-slippers-loafers
      "pcat_01JZY2VAFJT2VX9Q81SQC2ASRB", // womens-heels
      "pcat_01JZY2W5894VTJ257X4J34HGP7", // womens-sandals
      "pcat_01JZY2Y5645RPJJ70PM67M79X1", // womens-sneakers
    ] },
    { id: "pcat_01JZQE2EBYCV58RPMY5HXM5JP2", handle: "womens-accessories", name: "Accessories", parentId: womenswearId, childIds: [] },
    { id: "pcat_01JZQE32E8EA3H997K6PY4QY99", handle: "womens-bags", name: "Bags", parentId: womenswearId, childIds: [
      "pcat_01JZXW0GBM3KRM8YF9F9GRR6KV", // womens-backpacks
      "pcat_01JZXW0VZ2286NAKMP6ESQ8BT2", // womens-clutches-pouches
      "pcat_01JZXW22GE0W4W48W5SG9GH1CT", // womens-duffle-top-handle-bags
      "pcat_01JZXW2K5AZHKZRN0E4E0W8NPM", // womens-messenger-bags-satchels
      "pcat_01JZXW32SEA7Z63BDQWXHN4QRW", // womens-shoulder-bags
      "pcat_01JZXW3JX6NY4PR47AQ3V7JPDS", // womens-tote-bags
      "pcat_01JZXW3VJJ4MV5Z58YN14QCADH", // womens-travel-bags
    ] },
    // Womenswear > Shoes parents
    { id: "pcat_01JZY0N024B85MW0BBAY0QBZ89", handle: "womens-boots", name: "Boots", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [
      "pcat_01JZY0NP3W68HXTS81J2CAZ87Y",
      "pcat_01JZY0PAT8Y7BWY0MSYKCH9FEH",
      "pcat_01JZY0S1TK2PAY8W9EBKB1F788",
    ] },
    { id: "pcat_01JZY0TY9ZA3TMHN8AF5DESAZF", handle: "womens-flats", name: "Flats", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [
      "pcat_01JZY0VG4JQ0QME34GNBB89BGG",
      "pcat_01JZY0W2QPJ1RFCZ7H04T205XZ",
    ] },
    { id: "pcat_01JZY2R4J4X2KDZ60CS5KNQG8S", handle: "womens-lace-ups-oxfords", name: "Lace Ups & Oxfords", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [] },
    { id: "pcat_01JZY2TQ8WK0PAK2AP1D8N08SK", handle: "womens-slippers-loafers", name: "Slippers & Loafers", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [] },
    { id: "pcat_01JZY2VAFJT2VX9Q81SQC2ASRB", handle: "womens-heels", name: "Heels", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [] },
    { id: "pcat_01JZY2W5894VTJ257X4J34HGP7", handle: "womens-sandals", name: "Sandals", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [
      "pcat_01JZY2WRM50HEV73HWPVTW2MA2",
      "pcat_01JZY2XFM8XCK3X5N1R7A8F32K",
    ] },
    { id: "pcat_01JZY2Y5645RPJJ70PM67M79X1", handle: "womens-sneakers", name: "Sneakers", parentId: "pcat_01JZQE1NN8DQSC0RH7CZ1SZYY0", childIds: [
      "pcat_01JZY2YPY9XY5KZ855C28ZEWHJ",
      "pcat_01JZY2Z7PM2TGJ46GCSSXYVXR5",
    ] },

    // Womenswear > Shoes children
    // Boots
    { id: "pcat_01JZY0NP3W68HXTS81J2CAZ87Y", handle: "womens-ankle-boots", name: "Ankle Boots", parentId: "pcat_01JZY0N024B85MW0BBAY0QBZ89", childIds: [] },
    { id: "pcat_01JZY0PAT8Y7BWY0MSYKCH9FEH", handle: "womens-mid-calf-boots", name: "Mid-Calf Boots", parentId: "pcat_01JZY0N024B85MW0BBAY0QBZ89", childIds: [] },
    { id: "pcat_01JZY0S1TK2PAY8W9EBKB1F788", handle: "womens-tall-boots", name: "Tall Boots", parentId: "pcat_01JZY0N024B85MW0BBAY0QBZ89", childIds: [] },
    
    // Flats
    { id: "pcat_01JZY0VG4JQ0QME34GNBB89BGG", handle: "womens-ballerina-flats", name: "Ballerina Flats", parentId: "pcat_01JZY0TY9ZA3TMHN8AF5DESAZF", childIds: [] },
    { id: "pcat_01JZY0W2QPJ1RFCZ7H04T205XZ", handle: "womens-espadrilles", name: "Espadrilles", parentId: "pcat_01JZY0TY9ZA3TMHN8AF5DESAZF", childIds: [] },
    
    // Sandals
    { id: "pcat_01JZY2WRM50HEV73HWPVTW2MA2", handle: "womens-flat-sandals", name: "Flat Sandals", parentId: "pcat_01JZY2W5894VTJ257X4J34HGP7", childIds: [] },
    { id: "pcat_01JZY2XFM8XCK3X5N1R7A8F32K", handle: "womens-heeled-sandals", name: "Heeled Sandals", parentId: "pcat_01JZY2W5894VTJ257X4J34HGP7", childIds: [] },
    
    // Sneakers
    { id: "pcat_01JZY2YPY9XY5KZ855C28ZEWHJ", handle: "womens-high-top-sneakers", name: "High Top Sneakers", parentId: "pcat_01JZY2Y5645RPJJ70PM67M79X1", childIds: [] },
    { id: "pcat_01JZY2Z7PM2TGJ46GCSSXYVXR5", handle: "womens-low-top-sneakers", name: "Low Top Sneakers", parentId: "pcat_01JZY2Y5645RPJJ70PM67M79X1", childIds: [] },

    // Womenswear > Clothing parents
    { id: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", handle: "womens-lingerie", name: "Lingerie", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXY3A51ZF3SGFFXZ0Q43SW3",
      "pcat_01JZXY3N6T0FGH376H11SQ0Y5K",
      "pcat_01JZXY40HJ8SNNH4241SR8QA20",
      "pcat_01JZXY7JCH39ZN14AMXP2PB5PH",
      "pcat_01JZXY82PSP495FYGX0S97D7FW",
      "pcat_01JZXYBVTXHZZDTB33KVHC2VAS",
      "pcat_01JZXZ2YSG9SKA9ED3NQ7VC45K",
    ] },
    { id: "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", handle: "womens-pants", name: "Pants", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXZ48Q8V8RRVYAHSS053P7W",
      "pcat_01JZXZ4N05AH09R07TE4VJ6HFN",
      "pcat_01JZXZ52SPJB61TBXD6CBRHHSA",
      "pcat_01JZXZ5JGDFST47SYY5TYP8N1S",
    ] },
    { id: "pcat_01JZXZ6HMRR98NP74KY00CH8GY", handle: "womens-skirts", name: "Skirts", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXZ7020B1844A44R3R1WQ9A",
      "pcat_01JZXZ7KP79FF3KSG0VJJMK0Z0",
      "pcat_01JZXZ8199D5DJRV13B2JQN7FV",
    ] },
    { id: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", handle: "womens-sweaters", name: "Sweaters", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXZ92RSDPHZT6078KX4GNQ7",
      "pcat_01JZXZ9M58NX2RP0BBX41W2907",
      "pcat_01JZXZA5HXXMZDKBPMPW36EEHH",
      "pcat_01JZXZAN25JNWXPNDAZWHVT5MH",
      "pcat_01JZXZB6G6RPDA3NKSNWKWY0KD",
      "pcat_01JZXZBPA593843Q4STJAHHW0Y",
    ] },
    { id: "pcat_01JZXZCAN3ZDR9X6KAX1G4H7WB", handle: "womens-swimwear", name: "Swimwear", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXZG8N6EV2C8JYXCG8DMAMT",
      "pcat_01JZXZH094RN99J9HQDRS28SNN",
      "pcat_01JZXZJ1AK9709B0DF3G3DXVWG",
    ] },
    { id: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", handle: "womens-tops", name: "Tops", parentId: "pcat_01JZQDWMGZVPWMFCA62DD0JQ7Q", childIds: [
      "pcat_01JZXZKDERTYWNAEPE2N5465Y9",
      "pcat_01JZXYB3YWJA3B0XXNHAPB5JV4",
      "pcat_01JZY0J5Z9WVRKCB66GN5ZK8MT",
      "pcat_01JZY0JP3Z0AAHHEH3YS70STAH",
      "pcat_01JZY0K56ATW9Q8G1WHKGNHXME",
      "pcat_01JZY0KSCJ8181X5D4K96GF91P",
    ] },

    // Womenswear > Clothing children
    // Lingerie
    { id: "pcat_01JZXY3A51ZF3SGFFXZ0Q43SW3", handle: "womens-boy-shorts", name: "Boy Shorts", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXY3N6T0FGH376H11SQ0Y5K", handle: "womens-bras", name: "Bras", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXY40HJ8SNNH4241SR8QA20", handle: "womens-briefs", name: "Briefs", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXY7JCH39ZN14AMXP2PB5PH", handle: "womens-robes", name: "Robes", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXY82PSP495FYGX0S97D7FW", handle: "womens-shapewear", name: "Shapewear", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXYBVTXHZZDTB33KVHC2VAS", handle: "womens-sleepwear", name: "Sleepwear", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },
    { id: "pcat_01JZXZ2YSG9SKA9ED3NQ7VC45K", handle: "womens-thongs", name: "Thongs", parentId: "pcat_01JZXY2HTXVW50R5YC5V4DB6JC", childIds: [] },

    // Pants
    { id: "pcat_01JZXZ48Q8V8RRVYAHSS053P7W", handle: "womens-leather-pants", name: "Leather Pants", parentId: "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", childIds: [] },
    { id: "pcat_01JZXZ4N05AH09R07TE4VJ6HFN", handle: "womens-leggings", name: "Leggings", parentId: "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", childIds: [] },
    { id: "pcat_01JZXZ52SPJB61TBXD6CBRHHSA", handle: "womens-lounge-pants", name: "Lounge Pants", parentId: "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", childIds: [] },
    { id: "pcat_01JZXZ5JGDFST47SYY5TYP8N1S", handle: "womens-trousers", name: "Trousers", parentId: "pcat_01JZXZ3Q0KPG154GZNSXKNQJZ5", childIds: [] },

    // Skirts
    { id: "pcat_01JZXZ7020B1844A44R3R1WQ9A", handle: "womens-long-skirts", name: "Long Skirts", parentId: "pcat_01JZXZ6HMRR98NP74KY00CH8GY", childIds: [] },
    { id: "pcat_01JZXZ7KP79FF3KSG0VJJMK0Z0", handle: "womens-mid-length-skirts", name: "Mid Length Skirts", parentId: "pcat_01JZXZ6HMRR98NP74KY00CH8GY", childIds: [] },
    { id: "pcat_01JZXZ8199D5DJRV13B2JQN7FV", handle: "womens-short-skirts", name: "Short Skirts", parentId: "pcat_01JZXZ6HMRR98NP74KY00CH8GY", childIds: [] },

    // Sweaters
    { id: "pcat_01JZXZ92RSDPHZT6078KX4GNQ7", handle: "womens-cardigans", name: "Cardigans", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },
    { id: "pcat_01JZXZ9M58NX2RP0BBX41W2907", handle: "womens-crewnecks", name: "Crewnecks", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },
    { id: "pcat_01JZXZA5HXXMZDKBPMPW36EEHH", handle: "womens-hoodies-zipups", name: "Hoodies & Zipups", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },
    { id: "pcat_01JZXZAN25JNWXPNDAZWHVT5MH", handle: "womens-sweatshirts", name: "Sweatshirts", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },
    { id: "pcat_01JZXZB6G6RPDA3NKSNWKWY0KD", handle: "womens-turtlenecks", name: "Turtlenecks", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },
    { id: "pcat_01JZXZBPA593843Q4STJAHHW0Y", handle: "womens-v-necks", name: "V-Necks", parentId: "pcat_01JZXZ8HH09NWDF1WFK5D3ZNSP", childIds: [] },

    // Swimwear
    { id: "pcat_01JZXZG8N6EV2C8JYXCG8DMAMT", handle: "womens-bikinis", name: "Bikinis", parentId: "pcat_01JZXZCAN3ZDR9X6KAX1G4H7WB", childIds: [] },
    { id: "pcat_01JZXZH094RN99J9HQDRS28SNN", handle: "womens-cover-ups", name: "Cover Ups", parentId: "pcat_01JZXZCAN3ZDR9X6KAX1G4H7WB", childIds: [] },
    { id: "pcat_01JZXZJ1AK9709B0DF3G3DXVWG", handle: "womens-one-piece", name: "One-Piece", parentId: "pcat_01JZXZCAN3ZDR9X6KAX1G4H7WB", childIds: [] },

    // Tops
    { id: "pcat_01JZXZKDERTYWNAEPE2N5465Y9", handle: "womens-blouses", name: "Blouses", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },
    { id: "pcat_01JZXYB3YWJA3B0XXNHAPB5JV4", handle: "womens-bodysuits", name: "Bodysuits", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },
    { id: "pcat_01JZY0J5Z9WVRKCB66GN5ZK8MT", handle: "womens-polos", name: "Polos", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },
    { id: "pcat_01JZY0JP3Z0AAHHEH3YS70STAH", handle: "womens-shirts", name: "Shirts", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },
    { id: "pcat_01JZY0K56ATW9Q8G1WHKGNHXME", handle: "womens-t-shirts", name: "T-Shirts", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },
    { id: "pcat_01JZY0KSCJ8181X5D4K96GF91P", handle: "womens-tank-tops-camisoles", name: "Tank Tops & Camisoles", parentId: "pcat_01JZXZJTSBZBJVJR77QXHZGMGB", childIds: [] },

    // Womenswear > Bags children
    { id: "pcat_01JZXW0GBM3KRM8YF9F9GRR6KV", handle: "womens-backpacks", name: "Backpacks", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW0VZ2286NAKMP6ESQ8BT2", handle: "womens-clutches-pouches", name: "Clutches & Pouches", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW22GE0W4W48W5SG9GH1CT", handle: "womens-duffle-top-handle-bags", name: "Duffle & Top Handle Bags", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW2K5AZHKZRN0E4E0W8NPM", handle: "womens-messenger-bags-satchels", name: "Messenger Bags & Satchels", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW32SEA7Z63BDQWXHN4QRW", handle: "womens-shoulder-bags", name: "Shoulder Bags", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW3JX6NY4PR47AQ3V7JPDS", handle: "womens-tote-bags", name: "Tote Bags", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
    { id: "pcat_01JZXW3VJJ4MV5Z58YN14QCADH", handle: "womens-travel-bags", name: "Travel Bags", parentId: "pcat_01JZQE32E8EA3H997K6PY4QY99", childIds: [] },
  ]

  CategoryMaster.upsertCategories(records)

  // ===========================================================================================
  // SIZING TEMPLATE ASSIGNMENTS
  // ===========================================================================================
  //
  // Template assignment enables the Product Measurements (PM) page in the sizing modal.
  // ONLY assign templates after:
  //   1. Template is created in sizing-templates.ts with diagram and coordinates
  //   2. Diagram image is added to /public/images/
  //   3. Testing confirms measurements display correctly on all viewports
  //
  // Assignment syntax:
  //   CategoryMaster.setTemplate({ handle: "category-handle" }, "Template Name")
  //
  // Template names must EXACTLY match the "category" field in SIZING_TEMPLATES array.
  // Assign to parent categories - children automatically inherit via hierarchical lookup.
  //
  // ===========================================================================================

  // SHOES - Fully implemented (uses size conversion tables, not diagrams)
  CategoryMaster.setTemplate({ handle: "mens-shoes" }, "Shoes Men")
  CategoryMaster.setTemplate({ handle: "womens-shoes" }, "Shoes Women")

  // ===========================================================================================
  // TODO: Add template assignments for apparel categories after templates are designed
  // ===========================================================================================
  //
  // Examples (uncomment when corresponding templates are ready in sizing-templates.ts):
  //
  // SHIRTS & TOPS
  // CategoryMaster.setTemplate({ handle: "mens-shirts" }, "Shirts")
  // CategoryMaster.setTemplate({ handle: "womens-shirts" }, "Shirts")
  // CategoryMaster.setTemplate({ handle: "mens-tops" }, "Shirts")
  // CategoryMaster.setTemplate({ handle: "womens-tops" }, "Shirts")
  //
  // PANTS, JEANS & SHORTS
  // CategoryMaster.setTemplate({ handle: "mens-pants" }, "Pants")
  // CategoryMaster.setTemplate({ handle: "womens-pants" }, "Pants")
  // CategoryMaster.setTemplate({ handle: "mens-jeans" }, "Pants")
  // CategoryMaster.setTemplate({ handle: "mens-shorts" }, "Shorts")
  //
  // SWEATERS & HOODIES
  // CategoryMaster.setTemplate({ handle: "mens-sweaters" }, "Sweaters")
  // CategoryMaster.setTemplate({ handle: "womens-sweaters" }, "Sweaters")
  //
  // JACKETS & COATS
  // CategoryMaster.setTemplate({ handle: "mens-jackets-coats" }, "Jackets")
  //
  // ===========================================================================================
})()


