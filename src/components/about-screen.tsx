"use client"

import Image from "next/image"
import { BookOpenText, Building2, Code2, GraduationCap, MapPin } from "lucide-react"

import { PrivateShell } from "@/components/private-shell"

type AboutScreenProps = {
  role: "candidate" | "business"
}

const students = [
  "Gabriel Oliveira",
  "José Lemos",
  "Lucas Lira",
  "Guilherme Cruvinel",
]

export function AboutScreen({ role }: AboutScreenProps) {
  return (
    <PrivateShell
      role={role}
      title="Sobre o projeto"
      description="Contexto acadêmico, impacto local e proposta aberta da plataforma ITBA Empregos."
      breadcrumb="Sobre"
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <GraduationCap className="size-4" />
                Campus IFTM Ituiutaba
              </span>
              <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Plataforma desenvolvida no IFTM para aproximar talentos e oportunidades de Ituiutaba - MG.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Este trabalho foi desenvolvido no campus IFTM Ituiutaba como parte da disciplina Projeto Integrador Extensionista III, sob orientação do professor Alencar de Melo. A proposta une formação acadêmica, extensão e desenvolvimento de software com foco em necessidades reais da comunidade local.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-sm items-center justify-center overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,135,90,0.16),_transparent_55%)]" />
              <Image
                src="/images/IFTM.png"
                alt="Logo do IFTM"
                width={260}
                height={260}
                className="relative z-10 h-auto w-full max-w-[220px] object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-foreground">
              <BookOpenText className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">Disciplina e autoria</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              O sistema foi produzido na disciplina Projeto Integrador Extensionista III, com condução do professor Alencar de Melo, pelos alunos {students.join(", ")}. O objetivo foi transformar aprendizado técnico em um produto útil, público e replicável.
            </p>
          </article>

          <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-foreground">
              <MapPin className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">Benefício para Ituiutaba - MG</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Para a cidade de Ituiutaba - MG, uma plataforma como esta pode facilitar a conexão entre empresas locais e candidatos da região, reduzir barreiras de divulgação de vagas, ampliar a visibilidade de oportunidades e estimular a permanência de talentos no mercado local. Isso fortalece o ecossistema econômico e gera um canal digital mais acessível para recrutamento e empregabilidade.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8 xl:col-span-2">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3 text-foreground">
                <Building2 className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Extensão com impacto</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                O projeto dialoga com a realidade local ao responder uma demanda concreta: tornar o encontro entre empresas e profissionais mais organizado, rápido e transparente.
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3 text-foreground">
                <Code2 className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Software de código aberto</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Ser um software de código aberto permite auditoria, evolução colaborativa e reaproveitamento por outras instituições, turmas e comunidades. Isso reduz dependência tecnológica e amplia o alcance social do trabalho acadêmico.
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex items-center gap-3 text-foreground">
                <GraduationCap className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Formação aplicada</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                O desenvolvimento do sistema reforça a formação dos estudantes ao integrar análise, implementação e entrega de um produto com finalidade pública, aproximando teoria, prática e responsabilidade social.
              </p>
            </article>
          </div>
        </section>
      </div>
    </PrivateShell>
  )
}
