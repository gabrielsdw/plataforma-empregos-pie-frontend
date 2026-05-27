"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileText,
  Hourglass,
  Mail,
  MapPin,
  Search,
  Send,
  UserRound,
  WalletCards,
} from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import {
  type VacancyResponse,
  useApplyToVacancyMutation,
  useBusinessApplicantsQuery,
  useBusinessVacanciesQuery,
  useCloseVacancyMutation,
  usePublishedVacanciesQuery,
} from "@/hooks/use-vacancy-mutations"
import { getAuthSession } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

type AuthDashboardScreenProps = {
  role: "candidate" | "business"
}

type DashboardMetric = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

const seekerMetrics: DashboardMetric[] = [
  { label: "Candidaturas enviadas", value: "18", icon: FileText },
  { label: "Empresas salvas", value: "7", icon: BriefcaseBusiness },
  { label: "Mensagens novas", value: "5", icon: Mail },
  { label: "Entrevistas agendadas", value: "3", icon: Hourglass },
]

const employmentTypeLabels: Record<VacancyResponse["employment_type"], string> = {
  clt: "CLT",
  pj: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
}

function buildInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) {
    return digits.length === 0 ? "" : `(${digits}`
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function isValidApplicationForm(phone: string, portfolioUrl: string, coverLetter: string) {
  const phoneIsValid = /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone.trim())

  if (!phoneIsValid) {
    return "Informe um telefone valido."
  }

  if (portfolioUrl.trim()) {
    try {
      new URL(portfolioUrl.trim())
    } catch {
      return "Informe um link de portfolio valido."
    }
  }

  if (coverLetter.trim().length < 20) {
    return "Escreva uma carta de apresentação com pelo menos 20 caracteres."
  }

  return null
}

function getBusinessMetrics(vacancies: VacancyResponse[]): DashboardMetric[] {
  const publishedCount = vacancies.filter((vacancy) => vacancy.status === "published").length
  const draftCount = vacancies.filter((vacancy) => vacancy.status === "draft").length
  const salaryCount = vacancies.filter(
    (vacancy) => vacancy.salary_min !== null || vacancy.salary_max !== null
  ).length
  const remoteCount = vacancies.filter((vacancy) =>
    vacancy.location.toLowerCase().includes("remoto")
  ).length

  return [
    { label: "Vagas publicadas", value: String(publishedCount), icon: BriefcaseBusiness },
    { label: "Rascunhos", value: String(draftCount), icon: FileText },
    { label: "Com salário", value: String(salaryCount), icon: Mail },
    { label: "Remotas", value: String(remoteCount), icon: Hourglass },
  ]
}

function formatVacancyDate(value: string | null) {
  if (!value) {
    return "Ainda não publicada"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
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

function formatSalaryRange(vacancy: VacancyResponse) {
  if (vacancy.salary_min === null && vacancy.salary_max === null) {
    return "Salário a combinar"
  }

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })

  if (vacancy.salary_min !== null && vacancy.salary_max !== null) {
    return `${formatter.format(Number(vacancy.salary_min))} - ${formatter.format(Number(vacancy.salary_max))}`
  }

  if (vacancy.salary_min !== null) {
    return `A partir de ${formatter.format(Number(vacancy.salary_min))}`
  }

  return `Ate ${formatter.format(Number(vacancy.salary_max))}`
}

function formatApplicationsCount(count: number | undefined) {
  const total = count ?? 0

  return total === 1 ? "1 candidato" : `${total} candidatos`
}

function getVacancyBadgeLabel(vacancy: VacancyResponse) {
  if (vacancy.status === "draft") {
    return "Rascunho"
  }

  if (vacancy.status === "closed") {
    return "Vaga encerrada"
  }

  return `Publicada em ${formatVacancyDate(vacancy.published_at)}`
}

function getVacancyCompanyName(vacancy: VacancyResponse) {
  return vacancy.business?.company_name || vacancy.business?.name || "Empresa parceira"
}

function getTextParagraphs(value: string) {
  return value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function getTextList(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
}

function isNewVacancy(vacancy: VacancyResponse) {
  if (!vacancy.published_at) {
    return false
  }

  const publishedTime = new Date(vacancy.published_at).getTime()
  const now = Date.now()
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

  return now - publishedTime <= sevenDaysInMs
}

function getVacancyExcerpt(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (normalized.length <= 180) {
    return normalized
  }

  return `${normalized.slice(0, 177)}...`
}

type VacancyWorkMode = "all" | "remote" | "hybrid" | "onsite"

function getVacancyWorkMode(location: string): Exclude<VacancyWorkMode, "all"> {
  const normalized = location.toLowerCase()

  if (normalized.includes("remoto") || normalized.includes("remote") || normalized.includes("home office")) {
    return "remote"
  }

  if (normalized.includes("hibrid")) {
    return "hybrid"
  }

  return "onsite"
}

function getVacancyPrimarySalary(vacancy: VacancyResponse) {
  if (vacancy.salary_max !== null) {
    return Number(vacancy.salary_max)
  }

  if (vacancy.salary_min !== null) {
    return Number(vacancy.salary_min)
  }

  return null
}

export function AuthDashboardScreen({ role }: AuthDashboardScreenProps) {
  const session = getAuthSession()
  const isBusiness = role === "business"
  const [candidateSearch, setCandidateSearch] = useState("")
  const [candidateEmploymentTypeFilter, setCandidateEmploymentTypeFilter] = useState<
    "all" | VacancyResponse["employment_type"]
  >("all")
  const [candidateWorkModeFilter, setCandidateWorkModeFilter] =
    useState<VacancyWorkMode>("all")
  const [candidateMinimumSalary, setCandidateMinimumSalary] = useState("")
  const [candidateShowAppliedOnly, setCandidateShowAppliedOnly] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
  const [vacancyToClose, setVacancyToClose] = useState<VacancyResponse | null>(null)
  const [vacancyToApply, setVacancyToApply] = useState<VacancyResponse | null>(null)
  const [applicationPhone, setApplicationPhone] = useState("")
  const [applicationPortfolio, setApplicationPortfolio] = useState("")
  const [applicationCoverLetter, setApplicationCoverLetter] = useState("")

  const {
    data: businessVacancies = [],
    isLoading: isLoadingBusinessVacancies,
    isError: hasBusinessVacanciesError,
  } = useBusinessVacanciesQuery({
    enabled: isBusiness,
  })
  const {
    data: publishedVacancies = [],
    isLoading: isLoadingPublishedVacancies,
    isError: hasPublishedVacanciesError,
  } = usePublishedVacanciesQuery({
    enabled: !isBusiness,
  })
  const {
    data: businessApplicants = [],
    isLoading: isLoadingBusinessApplicants,
    isError: hasBusinessApplicantsError,
  } = useBusinessApplicantsQuery({
    enabled: isBusiness,
  })
  const closeVacancyMutation = useCloseVacancyMutation()
  const applyToVacancyMutation = useApplyToVacancyMutation()

  const metrics = isBusiness ? getBusinessMetrics(businessVacancies) : seekerMetrics
  const pageTitle = isBusiness ? "Painel do Empregador" : "Busca de Vagas"
  const pageDescription = isBusiness
    ? "Gerencie seu funil de recrutamento, vagas ativas e novas candidaturas."
    : "Explore as vagas publicadas e acompanhe os detalhes da oportunidade selecionada."
  const profileLabel = isBusiness ? "Perfil da empresa" : "Perfil profissional"
  const progress = isBusiness ? 85 : 78
  const candidateName = session?.user?.name?.trim() || "Candidato"
  const candidateEmail = session?.user?.email?.trim() || ""

  const normalizedCandidateSearch = candidateSearch.trim().toLowerCase()
  const candidateMinimumSalaryValue = candidateMinimumSalary.trim()
    ? Number(candidateMinimumSalary)
    : null

  const filteredPublishedVacancies = publishedVacancies.filter((vacancy) => {
    if (normalizedCandidateSearch) {
      const searchableContent = [
        vacancy.title,
        vacancy.location,
        getVacancyCompanyName(vacancy),
        vacancy.description,
        vacancy.requirements,
      ]
        .join(" ")
        .toLowerCase()

      if (!searchableContent.includes(normalizedCandidateSearch)) {
        return false
      }
    }

    if (
      candidateEmploymentTypeFilter !== "all" &&
      vacancy.employment_type !== candidateEmploymentTypeFilter
    ) {
      return false
    }

    if (
      candidateWorkModeFilter !== "all" &&
      getVacancyWorkMode(vacancy.location) !== candidateWorkModeFilter
    ) {
      return false
    }

    if (candidateShowAppliedOnly && !vacancy.has_applied) {
      return false
    }

    if (candidateMinimumSalaryValue !== null) {
      const primarySalary = getVacancyPrimarySalary(vacancy)

      if (primarySalary === null || primarySalary < candidateMinimumSalaryValue) {
        return false
      }
    }

    return true
  })

  const selectedPublishedVacancy = filteredPublishedVacancies.find(
    (vacancy) => vacancy.id === selectedVacancyId
  ) ?? filteredPublishedVacancies[0] ?? null

  function handlePlaceholderClick(label: string) {
    toast.warning(`${label} ainda não foi implementado.`)
  }

  function handleClearCandidateFilters() {
    setCandidateSearch("")
    setCandidateEmploymentTypeFilter("all")
    setCandidateWorkModeFilter("all")
    setCandidateMinimumSalary("")
    setCandidateShowAppliedOnly(false)
  }

  function handleOpenApplyModal(vacancy: VacancyResponse) {
    if (vacancy.has_applied || applyToVacancyMutation.isPending) {
      return
    }

    setVacancyToApply(vacancy)
    setApplicationPhone(formatPhone(session?.user?.phone || ""))
    setApplicationPortfolio("")
    setApplicationCoverLetter("")
  }

  function handleCloseApplyModal() {
    if (applyToVacancyMutation.isPending) {
      return
    }

    setVacancyToApply(null)
  }

  async function handleSubmitApplication() {
    if (!vacancyToApply) {
      return
    }

    const validationMessage = isValidApplicationForm(
      applicationPhone,
      applicationPortfolio,
      applicationCoverLetter
    )

    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    try {
      await applyToVacancyMutation.mutateAsync({
        vacancyId: vacancyToApply.id,
        phone: applicationPhone.trim(),
        portfolioUrl: applicationPortfolio.trim(),
        coverLetter: applicationCoverLetter.trim(),
      })
      setVacancyToApply(null)
      toast.success("Candidatura enviada com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function handleCloseVacancyRequest(vacancy: VacancyResponse) {
    if (vacancy.status === "closed" || closeVacancyMutation.isPending) {
      return
    }

    setVacancyToClose(vacancy)
  }

  function handleCancelCloseVacancy() {
    if (closeVacancyMutation.isPending) {
      return
    }

    setVacancyToClose(null)
  }

  async function handleConfirmCloseVacancy() {
    if (!vacancyToClose) {
      return
    }

    try {
      await closeVacancyMutation.mutateAsync({ id: vacancyToClose.id })
      setVacancyToClose(null)
      toast.success("Vaga encerrada com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function renderBusinessVacancies() {
    if (isLoadingBusinessVacancies) {
      return (
        <article className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Carregando vagas publicadas...</p>
        </article>
      )
    }

    if (hasBusinessVacanciesError) {
      return (
        <article className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
          <p className="text-sm text-destructive">
            Não foi possível carregar as vagas publicadas da empresa.
          </p>
        </article>
      )
    }

    if (businessVacancies.length === 0) {
      return (
        <article className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Nenhuma vaga publicada ainda</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Assim que você publicar uma vaga, ela aparecerá aqui no dashboard.
          </p>
        </article>
      )
    }

    return businessVacancies.map((vacancy) => {
      const isClosingCurrentVacancy =
        closeVacancyMutation.isPending && closeVacancyMutation.variables?.id === vacancy.id

      return (
        <article
          key={vacancy.id}
          className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{vacancy.title}</h3>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{vacancy.location}</span>
                <span>{employmentTypeLabels[vacancy.employment_type]}</span>
                <span>{formatSalaryRange(vacancy)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {getVacancyBadgeLabel(vacancy)}
                </span>
                <span className="inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {formatApplicationsCount(vacancy.applications_count)}
                </span>
              </div>
            </div>

            <div className="flex gap-5 text-sm font-medium">
              <Link
                href={`/dashboard/business/jobs/${vacancy.id}/edit`}
                className="text-primary transition-opacity hover:opacity-80"
              >
                Editar
              </Link>
              <button
                type="button"
                disabled={vacancy.status === "closed" || isClosingCurrentVacancy}
                onClick={() => handleCloseVacancyRequest(vacancy)}
                className={cn(
                  "transition-opacity",
                  vacancy.status === "closed"
                    ? "cursor-not-allowed text-muted-foreground"
                    : "text-destructive hover:opacity-80"
                )}
              >
                {isClosingCurrentVacancy
                  ? "Encerrando..."
                  : vacancy.status === "closed"
                    ? "Encerrada"
                    : "Encerrar vaga"}
              </button>
            </div>
          </div>
        </article>
      )
    })
  }

  function renderBusinessApplicants() {
    if (isLoadingBusinessApplicants) {
      return <p className="text-sm text-muted-foreground">Carregando candidatos...</p>
    }

    if (hasBusinessApplicantsError) {
      return (
        <p className="text-sm text-destructive">
          Não foi possível carregar os candidatos das suas vagas.
        </p>
      )
    }

    if (businessApplicants.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Ainda não há candidatos nas vagas publicadas.
        </p>
      )
    }

    return businessApplicants.slice(0, 8).map((application) => {
      const candidate = application.candidate
      const candidateNameLocal = candidate?.name ?? "Candidato"
      const vacancyTitle = application.vacancy?.title ?? "Vaga"

      return (
        <div key={application.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
              {buildInitials(candidateNameLocal)}
            </div>
            <div>
              <p className="text-sm font-medium">{candidateNameLocal}</p>
              <p className="text-xs text-muted-foreground">{vacancyTitle}</p>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {formatApplicationDate(application.applied_at)}
          </span>
        </div>
      )
    })
  }

  function renderCandidateVacancyDetails() {
    if (isLoadingPublishedVacancies) {
      return (
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Carregando detalhes da vaga...</p>
        </section>
      )
    }

    if (hasPublishedVacanciesError) {
      return (
        <section className="rounded-3xl border border-destructive/30 bg-card p-6 shadow-sm">
          <p className="text-sm text-destructive">
            Não foi possível carregar os detalhes das vagas publicadas.
          </p>
        </section>
      )
    }

    if (!selectedPublishedVacancy) {
      return (
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Nenhuma vaga selecionada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecione uma vaga da lista para visualizar mais detalhes.
          </p>
        </section>
      )
    }

    const descriptionParagraphs = getTextParagraphs(selectedPublishedVacancy.description)
    const requirementItems = getTextList(selectedPublishedVacancy.requirements)

    return (
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm xl:sticky xl:top-24">
        <div className="border-b border-border/80 bg-muted/30 p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {selectedPublishedVacancy.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {getVacancyCompanyName(selectedPublishedVacancy)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedPublishedVacancy.has_applied ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Candidatura enviada
                </span>
              ) : null}
              {isNewVacancy(selectedPublishedVacancy) ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Novo
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
              <MapPin className="size-4" />
              {selectedPublishedVacancy.location}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-primary">
              <WalletCards className="size-4" />
              {formatSalaryRange(selectedPublishedVacancy)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
              <BriefcaseBusiness className="size-4" />
              {employmentTypeLabels[selectedPublishedVacancy.employment_type]}
            </span>
          </div>

          <button
            type="button"
            disabled={selectedPublishedVacancy.has_applied || applyToVacancyMutation.isPending}
            onClick={() => handleOpenApplyModal(selectedPublishedVacancy)}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-opacity",
              selectedPublishedVacancy.has_applied
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            {selectedPublishedVacancy.has_applied ? "Candidatura enviada" : "Candidatar-se"}
            {!selectedPublishedVacancy.has_applied ? <ArrowRight className="size-4" /> : null}
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="text-lg font-semibold text-foreground">Sobre a vaga</h3>
            <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={`${selectedPublishedVacancy.id}-description-${index}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">Requisitos</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {requirementItems.map((item, index) => (
                <li
                  key={`${selectedPublishedVacancy.id}-requirement-${index}`}
                  className="flex gap-3"
                >
                  <span className="mt-2 size-1.5 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    )
  }

  if (!isBusiness) {
    return (
      <PrivateShell
        role={role}
        title={pageTitle}
        description={pageDescription}
        breadcrumb="Vagas"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Vagas publicadas
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Encontre oportunidades abertas e selecione uma vaga para ver os detalhes.
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                Mostrando {filteredPublishedVacancies.length} resultado(s)
              </span>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(180px,1fr))]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="Buscar vagas, empresas, requisitos ou localidade"
                  className="h-12 rounded-2xl border border-border/80 bg-background pl-10 pr-4"
                />
              </div>

              <select
                value={candidateEmploymentTypeFilter}
                onChange={(event) =>
                  setCandidateEmploymentTypeFilter(
                    event.target.value as "all" | VacancyResponse["employment_type"]
                  )
                }
                className="h-12 rounded-2xl border border-border/80 bg-background px-4 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos os tipos</option>
                <option value="clt">CLT</option>
                <option value="pj">PJ</option>
                <option value="estagio">Estágio</option>
                <option value="temporario">Temporário</option>
              </select>

              <select
                value={candidateWorkModeFilter}
                onChange={(event) =>
                  setCandidateWorkModeFilter(event.target.value as VacancyWorkMode)
                }
                className="h-12 rounded-2xl border border-border/80 bg-background px-4 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todas as modalidades</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
                <option value="onsite">Presencial</option>
              </select>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,1.2fr)_auto] xl:items-center">
              <Input
                type="number"
                min="0"
                value={candidateMinimumSalary}
                onChange={(event) => setCandidateMinimumSalary(event.target.value)}
                placeholder="Salário mínimo desejado"
                className="h-12 rounded-2xl border border-border/80 bg-background px-4"
              />

              <label className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={candidateShowAppliedOnly}
                  onChange={(event) => setCandidateShowAppliedOnly(event.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                Mostrar apenas vagas já candidatadas
              </label>

              <button
                type="button"
                onClick={handleClearCandidateFilters}
                className="rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Limpar filtros
              </button>
            </div>
          </section>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <section className="space-y-4">
              {isLoadingPublishedVacancies ? (
                <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                  <p className="text-sm text-muted-foreground">Carregando vagas publicadas...</p>
                </article>
              ) : null}

              {!isLoadingPublishedVacancies && hasPublishedVacanciesError ? (
                <article className="rounded-3xl border border-destructive/30 bg-card p-6 shadow-sm">
                  <p className="text-sm text-destructive">
                    Não foi possível carregar as vagas publicadas no momento.
                  </p>
                </article>
              ) : null}

              {!isLoadingPublishedVacancies &&
              !hasPublishedVacanciesError &&
              filteredPublishedVacancies.length === 0 ? (
                <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground">
                    Nenhuma vaga encontrada
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ajuste a busca para encontrar mais oportunidades publicadas.
                  </p>
                </article>
              ) : null}

              {!isLoadingPublishedVacancies &&
              !hasPublishedVacanciesError &&
              filteredPublishedVacancies.map((vacancy) => {
                const isActive = selectedPublishedVacancy?.id === vacancy.id

                return (
                  <button
                    key={vacancy.id}
                    type="button"
                    onClick={() => setSelectedVacancyId(vacancy.id)}
                    className={cn(
                      "relative block w-full overflow-hidden rounded-3xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                      isActive
                        ? "border-primary ring-2 ring-primary/15"
                        : "border-border/80"
                    )}
                  >
                    {isActive ? (
                      <span className="absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-primary" />
                    ) : null}

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {vacancy.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {getVacancyCompanyName(vacancy)}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-4" />
                            {vacancy.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {vacancy.has_applied ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Candidatado
                          </span>
                        ) : null}
                        {isNewVacancy(vacancy) ? (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Novo
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-2 text-primary">
                        <WalletCards className="size-4" />
                        {formatSalaryRange(vacancy)}
                      </span>
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <BriefcaseBusiness className="size-4" />
                        {employmentTypeLabels[vacancy.employment_type]}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {getVacancyExcerpt(vacancy.description)}
                    </p>
                  </button>
                )
              })}
          </section>

          <div className="space-y-4">
            <div className="hidden xl:block">{renderCandidateVacancyDetails()}</div>
            <div className="xl:hidden">{renderCandidateVacancyDetails()}</div>
          </div>
        </div>
      </div>

        {vacancyToApply ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="max-h-full w-full max-w-3xl overflow-auto rounded-2xl border border-border/80 bg-card shadow-xl">
              <div className="border-b border-border/80 px-6 py-5">
                <button
                  type="button"
                  onClick={handleCloseApplyModal}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowRight className="size-4 rotate-180" />
                  Voltar para a vaga
                </button>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {vacancyToApply.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness className="size-4" />
                    {getVacancyCompanyName(vacancyToApply)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {vacancyToApply.location}
                  </span>
                </div>
              </div>

              <div className="space-y-8 p-6">
                <section>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Informações Pessoais
                  </h3>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="candidateName">
                        Nome Completo
                      </label>
                      <Input
                        id="candidateName"
                        value={candidateName}
                        readOnly
                        className="h-12 cursor-not-allowed rounded-lg border border-border/80 bg-muted px-4 py-3 text-muted-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="candidateEmail">
                        E-mail
                      </label>
                      <Input
                        id="candidateEmail"
                        value={candidateEmail}
                        readOnly
                        className="h-12 cursor-not-allowed rounded-lg border border-border/80 bg-muted px-4 py-3 text-muted-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="candidatePhone">
                        Telefone
                      </label>
                      <Input
                        id="candidatePhone"
                        value={applicationPhone}
                        onChange={(event) => setApplicationPhone(formatPhone(event.target.value))}
                        placeholder="(11) 98765-4321"
                        maxLength={15}
                        className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="candidatePortfolio">
                        Link para Portfolio <span className="font-normal text-muted-foreground">(Opcional)</span>
                      </label>
                      <Input
                        id="candidatePortfolio"
                        value={applicationPortfolio}
                        onChange={(event) => setApplicationPortfolio(event.target.value)}
                        placeholder="https://"
                        className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
                      />
                    </div>
                  </div>
                </section>

                <div className="border-t border-border/80" />

                <section>
                  <h3 className="text-2xl font-semibold text-foreground">Carta de Apresentação</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Por que você é o candidato ideal para esta vaga?
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <textarea
                      id="coverLetter"
                      value={applicationCoverLetter}
                      onChange={(event) => setApplicationCoverLetter(event.target.value)}
                      placeholder="Descreva brevemente sua experiencia e motivacao..."
                      rows={6}
                      className="w-full resize-y rounded-lg border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-border/80 px-6 py-5">
                <button
                  type="button"
                  onClick={handleCloseApplyModal}
                  disabled={applyToVacancyMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={applyToVacancyMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applyToVacancyMutation.isPending ? "Enviando..." : "Enviar Candidatura"}
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </PrivateShell>
    )
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
                Vagas publicadas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe as vagas criadas pela sua empresa e o status de publicação.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlaceholderClick("Ver todas as vagas")}
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4">{renderBusinessVacancies()}</div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Candidaturas recentes
              </h2>
            </div>

            <div className="space-y-4">{renderBusinessApplicants()}</div>

            <Link
              href="/dashboard/business/candidates"
              className="mt-6 block w-full rounded-xl py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              Ver todos os candidatos
            </Link>
          </section>
        </aside>
      </div>

      {vacancyToClose ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Confirmar encerramento
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A vaga <span className="font-medium text-foreground">{vacancyToClose.title}</span>{" "}
              deixará de aparecer para candidatos. Deseja continuar?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={closeVacancyMutation.isPending}
                onClick={handleCancelCloseVacancy}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    className: "rounded-xl normal-case tracking-normal",
                  })
                )}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={closeVacancyMutation.isPending}
                onClick={handleConfirmCloseVacancy}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeVacancyMutation.isPending ? "Encerrando..." : "Encerrar vaga"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PrivateShell>
  )
}
