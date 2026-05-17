import type { Metadata } from "next"

import { SeekerSignupScreen } from "@/components/seeker-signup-screen"

export const metadata: Metadata = {
  title: "Cadastro de Candidato - ITBA Empregos",
  description: "Crie sua conta de candidato para acessar as vagas da plataforma.",
}

export default function Page() {
  return <SeekerSignupScreen />
}
