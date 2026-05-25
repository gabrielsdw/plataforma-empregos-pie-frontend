import type { Metadata } from "next"

import { ProfileScreen } from "@/components/profile-screen"

export const metadata: Metadata = {
  title: "Meu Perfil - ITBA Empregos",
}

export default function Page() {
  return <ProfileScreen role="candidate" />
}
