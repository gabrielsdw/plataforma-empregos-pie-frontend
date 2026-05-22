import type { Metadata } from "next"

import { BusinessCandidatesScreen } from "@/components/business-candidates-screen"

export const metadata: Metadata = {
  title: "Candidatos - ITBA Empregos",
}

export default function Page() {
  return <BusinessCandidatesScreen />
}
