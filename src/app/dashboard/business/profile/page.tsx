import type { Metadata } from "next"

import { ProfileScreen } from "@/components/profile-screen"

export const metadata: Metadata = {
  title: "Perfil da Empresa - ITBA Empregos",
}

export default function Page() {
  return <ProfileScreen role="business" />
}
