import CollapsibleText from "@modules/store/components/collapsible-text"

interface EditorialIntroProps {
  title: string
  blurb?: string
}

export default function EditorialIntro({ title, blurb }: EditorialIntroProps) {
  if (!blurb) {
    return null
  }

  return (
    <div className="mb-6">
      <h1 className="text-sm font-bold text-[#333] uppercase tracking-wide">
        {title}
      </h1>
      <CollapsibleText text={blurb} className="mt-0" />
    </div>
  )
}
