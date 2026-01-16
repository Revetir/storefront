import { type SchemaTypeDefinition } from 'sanity'
import editorial from '../../../sanity/schemas/editorials'
import spotlight from '../../../sanity/schemas/spotlights'
import story from '../../../sanity/schemas/stories'
import { editorialObjects } from '../../../sanity/schemas/objects'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [editorial, spotlight, story, ...editorialObjects],
}
