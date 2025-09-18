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
      <h1 className="text-sm font-medium text-[#333] uppercase tracking-wide">
        {title}
      </h1>
      <p className="text-sm text-[#333] mt-0 leading-relaxed">
        {blurb}
      </p>
    </div>
  )
}
