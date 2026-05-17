import type { Metadata } from "next"

import { BusinessSignupScreen } from "@/components/business-signup-screen"

export const metadata: Metadata = {
  title: "ITBA Empregos - Cadastro de Empresa",
  description: "Crie a conta da sua empresa para publicar vagas e encontrar talentos.",
}

export default function Page() {
  return <BusinessSignupScreen />
}
