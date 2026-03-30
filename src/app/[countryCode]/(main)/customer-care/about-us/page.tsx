import { Metadata } from "next"
import AboutUsDictionaryEntry from "./about-us-dictionary-entry"

export const metadata: Metadata = {
  title: "About Us | Revetir",
  description: "REVETIR: a global marketplace for the discovery of luxury and independent fashion.",
}

export default function AboutUsPage() {
  return <AboutUsDictionaryEntry />
}
