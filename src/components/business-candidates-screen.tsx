"use client"

import { BriefcaseBusiness, ExternalLink, Mail, Phone, UserRound } from "lucide-react"

import { PrivateShell } from "@/components/private-shell"
import { useBusinessApplicantsQuery } from "@/hooks/use-vacancy-mutations"

function buildInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatApplicationDate(value: string | null) {
  if (!value) {
    return "Candidatura recente"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function BusinessCandidatesScreen() {
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useBusinessApplicantsQuery()

  return (
    <PrivateShell
      role="business"
      title="Candidatos"
      description="Visualize todos os candidatos das vagas publicadas pela sua empresa."
      breadcrumb="Candidatos"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de candidaturas: <span className="font-semibold text-foreground">{applications.length}</span>
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Carregando candidatos...</p>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
            <p className="text-sm text-destructive">Nao foi possivel carregar os candidatos.</p>
          </div>
        ) : null}

        {!isLoading && !isError && applications.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Nenhum candidato encontrado ate o momento.</p>
          </div>
        ) : null}

        {!isLoading && !isError
          ? applications.map((application) => {
              const candidate = application.candidate
              const vacancy = application.vacancy
              const candidateName = candidate?.name ?? "Candidato"

              return (
                <article
                  key={application.id}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {buildInitials(candidateName)}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">{candidateName}</h2>
                          <p className="text-sm text-muted-foreground">{formatApplicationDate(application.applied_at)}</p>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                            <BriefcaseBusiness className="size-4" />
                            {vacancy?.title ?? "Vaga"}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                            <Mail className="size-4" />
                            {candidate?.email ?? "Sem e-mail"}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                            <Phone className="size-4" />
                            {application.phone || candidate?.phone || "Sem telefone"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm">
                      {application.portfolio_url ? (
                        <a
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" />
                          Ver portfolio
                        </a>
                      ) : null}
                      {candidate?.resume_path ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <UserRound className="size-4" />
                          Curriculo enviado no cadastro
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Carta de apresentacao</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {application.cover_letter || "Sem carta de apresentacao informada."}
                    </p>
                  </div>
                </article>
              )
            })
          : null}
      </div>
    </PrivateShell>
  )
}
