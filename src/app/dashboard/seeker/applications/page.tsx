import type { Metadata } from "next"

import { SeekerApplicationsScreen } from "@/components/seeker-applications-screen"

export const metadata: Metadata = {
  title: "Minhas candidaturas - ITBA Empregos",
}

export default function Page() {
  return <SeekerApplicationsScreen />
}
