import type { Metadata } from "next"

import { AuthDashboardScreen } from "@/components/auth-dashboard-screen"

export const metadata: Metadata = {
  title: "Painel da Empresa - ITBA Empregos",
}

export default function Page() {
  return <AuthDashboardScreen role="business" />
}
