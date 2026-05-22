import type { Metadata } from "next"

import { EditJobScreen } from "@/components/edit-job-screen"

export const metadata: Metadata = {
  title: "Editar Vaga - ITBA Empregos",
}

export default function Page() {
  return <EditJobScreen />
}
