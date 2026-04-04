import { Metadata } from "next"
import VerificationWhitepaperShell from "./components/verification-whitepaper-shell"

export const metadata: Metadata = {
  title: "Verification",
  description: "Verification white paper framework preview for REVETIR.",
}

export default function VerificationPage() {
  return (
    <VerificationWhitepaperShell />
  )
}
