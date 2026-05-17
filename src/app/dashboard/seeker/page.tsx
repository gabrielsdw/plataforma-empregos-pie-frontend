import type { Metadata } from "next"

import { AuthDashboardScreen } from "@/components/auth-dashboard-screen"

export const metadata: Metadata = {
  title: "Painel do Candidato - ITBA Empregos",
}

export default function Page() {
  return <AuthDashboardScreen role="candidate" />
}
