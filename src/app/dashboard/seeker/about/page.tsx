import type { Metadata } from "next"

import { AboutScreen } from "@/components/about-screen"

export const metadata: Metadata = {
  title: "Sobre - ITBA Empregos",
}

export default function Page() {
  return <AboutScreen role="candidate" />
}
