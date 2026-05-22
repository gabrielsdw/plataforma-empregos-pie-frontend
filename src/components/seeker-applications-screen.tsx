"use client"

import { BriefcaseBusiness, ExternalLink, MapPin, Phone } from "lucide-react"

import { PrivateShell } from "@/components/private-shell"
import { useSeekerApplicationsQuery } from "@/hooks/use-vacancy-mutations"

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

function getCompanyName(application: NonNullable<ReturnType<typeof useSeekerApplicationsQuery>["data"]>[number]) {
  return (
    application.vacancy?.business?.company_name ||
    application.vacancy?.business?.name ||
    "Empresa parceira"
  )
}

export function SeekerApplicationsScreen() {
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useSeekerApplicationsQuery()

  return (
    <PrivateShell
      role="candidate"
      title="Minhas candidaturas"
      description="Acompanhe todas as vagas em que voce ja enviou candidatura."
      breadcrumb="Minhas candidaturas"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de candidaturas enviadas: <span className="font-semibold text-foreground">{applications.length}</span>
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Carregando suas candidaturas...</p>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
            <p className="text-sm text-destructive">Nao foi possivel carregar suas candidaturas.</p>
          </div>
        ) : null}

        {!isLoading && !isError && applications.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Voce ainda nao enviou nenhuma candidatura.</p>
          </div>
        ) : null}

        {!isLoading && !isError
          ? applications.map((application) => (
              <article
                key={application.id}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {application.vacancy?.title ?? "Vaga"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                        <BriefcaseBusiness className="size-4" />
                        {getCompanyName(application)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                        <MapPin className="size-4" />
                        {application.vacancy?.location ?? "Localidade nao informada"}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                        <Phone className="size-4" />
                        {application.phone || "Telefone nao informado"}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Enviada em {formatApplicationDate(application.applied_at)}
                  </div>
                </div>

                {application.portfolio_url ? (
                  <a
                    href={application.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" />
                    Ver portfolio enviado
                  </a>
                ) : null}

                <div className="mt-5 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Carta de apresentacao</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {application.cover_letter || "Sem carta de apresentacao informada."}
                  </p>
                </div>
              </article>
            ))
          : null}
      </div>
    </PrivateShell>
  )
}
