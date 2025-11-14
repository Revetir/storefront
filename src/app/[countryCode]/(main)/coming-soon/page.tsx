import ComingSoon from "@modules/common/components/coming-soon"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "A new way to shop is almost here. Please check back soon.",
}

export default function ComingSoonPage() {
  return <ComingSoon />
}
