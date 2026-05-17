import type { Metadata } from "next"

import { NewJobScreen } from "@/components/new-job-screen"

export const metadata: Metadata = {
  title: "Publicar Nova Vaga - ITBA Empregos",
}

export default function Page() {
  return <NewJobScreen />
}
