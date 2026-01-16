// Schema index for Sanity Studio
// Import all schemas and export them

import editorial from "./editorials"
import spotlight from "./spotlights"
import story from "./stories"

// Object schemas must be registered for Sanity to recognize them
import { editorialObjects } from "./objects"

// Include all document types AND object types in schemaTypes
export const schemaTypes = [
  editorial,
  spotlight,
  story,
  ...editorialObjects,
]
