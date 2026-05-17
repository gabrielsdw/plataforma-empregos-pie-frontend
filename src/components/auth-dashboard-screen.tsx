"use client"

import {
  BriefcaseBusiness,
  FileText,
  Hourglass,
  Mail,
  UserRound,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthDashboardScreenProps = {
  role: "candidate" | "business"
}

type DashboardMetric = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

type DashboardJob = {
  title: string
  location: string
  contract: string
  applicants: string
}

type DashboardApplicant = {
  name: string
  role: string
  initials: string
}

const businessMetrics: DashboardMetric[] = [
  { label: "Vagas ativas", value: "12", icon: BriefcaseBusiness },
  { label: "Total de candidatos", value: "348", icon: Users },
  { label: "Em entrevista", value: "24", icon: Mail },
  { label: "Tempo de contratacao", value: "18d", icon: Hourglass },
]

const seekerMetrics: DashboardMetric[] = [
  { label: "Candidaturas enviadas", value: "18", icon: FileText },
  { label: "Empresas salvas", value: "7", icon: BriefcaseBusiness },
  { label: "Mensagens novas", value: "5", icon: Mail },
  { label: "Entrevistas agendadas", value: "3", icon: Hourglass },
]

const businessJobs: DashboardJob[] = [
  {
    title: "Designer UX Senior",
    location: "Sao Paulo, SP",
    contract: "Tempo integral",
    applicants: "42 candidatos",
  },
  {
    title: "Engenheiro Frontend React",
    location: "Remoto",
    contract: "Tempo integral",
    applicants: "89 candidatos",
  },
]

const seekerJobs: DashboardJob[] = [
  {
    title: "Product Designer Pleno",
    location: "Hibrido",
    contract: "Aplicado ha 2 dias",
    applicants: "Triagem em andamento",
  },
  {
    title: "Frontend Engineer",
    location: "Remoto",
    contract: "Entrevista marcada",
    applicants: "Aguardando retorno",
  },
]

const businessApplicants: DashboardApplicant[] = [
  { name: "Sarah Jenkins", role: "Designer UX", initials: "SJ" },
  { name: "Michael Ross", role: "Engenheiro Frontend", initials: "MR" },
]

const seekerApplicants: DashboardApplicant[] = [
  { name: "Orbit Labs", role: "Atualizacao de processo", initials: "OL" },
  { name: "Nova Digital", role: "Novo convite para entrevista", initials: "ND" },
]

export function AuthDashboardScreen({ role }: AuthDashboardScreenProps) {
  const metrics = role === "business" ? businessMetrics : seekerMetrics
  const jobs = role === "business" ? businessJobs : seekerJobs
  const applicants = role === "business" ? businessApplicants : seekerApplicants
  const pageTitle =
    role === "business" ? "Painel do Empregador" : "Painel do Candidato"
  const pageDescription =
    role === "business"
      ? "Gerencie seu funil de recrutamento, vagas ativas e novas candidaturas."
      : "Acompanhe candidaturas, convites e sua presenca nas vagas em andamento."
  const profileLabel =
    role === "business" ? "Perfil da empresa" : "Perfil profissional"
  const progress = role === "business" ? 85 : 78

  function handlePlaceholderClick(label: string) {
    toast.warning(`${label} ainda nao foi implementado.`)
  }

  return (
    <PrivateShell
      role={role}
      title={pageTitle}
      description={pageDescription}
      breadcrumb="Dashboard"
    >
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </span>
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="text-3xl font-semibold tracking-tight">
                {metric.value}
              </p>
            </article>
          )
        })}
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {role === "business"
                  ? "Listagens ativas"
                  : "Oportunidades em andamento"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {role === "business"
                  ? "Edite vagas, acompanhe volume e acione seu processo seletivo."
                  : "Veja o status das vagas que ja fazem parte do seu processo."}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handlePlaceholderClick(
                  role === "business"
                    ? "Ver todas as vagas"
                    : "Ver todas as candidaturas"
                )
              }
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <article
                key={job.title}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{job.location}</span>
                      <span>{job.contract}</span>
                    </div>
                    <div className="mt-4 inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {job.applicants}
                    </div>
                  </div>

                  <div className="flex gap-5 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => handlePlaceholderClick(`Editar ${job.title}`)}
                      className="text-primary transition-opacity hover:opacity-80"
                    >
                      {role === "business" ? "Editar" : "Detalhes"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePlaceholderClick(
                          role === "business"
                            ? `Encerrar ${job.title}`
                            : `Atualizar ${job.title}`
                        )
                      }
                      className="text-destructive transition-opacity hover:opacity-80"
                    >
                      {role === "business" ? "Encerrar vaga" : "Atualizar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                {role === "business"
                  ? "Candidaturas recentes"
                  : "Movimentacoes recentes"}
              </h2>
            </div>

            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                      {applicant.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {applicant.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                handlePlaceholderClick(
                  role === "business" ? "Ver todo o funil" : "Ver atualizacoes"
                )
              }
              className="mt-6 w-full rounded-xl py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              {role === "business" ? "Ver todo o funil" : "Ver atualizacoes"}
            </button>
          </section>

          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight">
                {profileLabel}
              </h2>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preenchimento</span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handlePlaceholderClick("Editar perfil")}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className: "w-full rounded-xl normal-case tracking-normal",
                })
              )}
            >
              Editar perfil
            </button>
          </section>
        </aside>
      </div>
    </PrivateShell>
  )
}
