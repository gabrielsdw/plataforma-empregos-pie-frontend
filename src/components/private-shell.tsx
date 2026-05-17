"use client"

import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BriefcaseBusiness,
  FileText,
  Gauge,
  LogOut,
  Mail,
  Plus,
  Settings,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { getAuthSession, removeAuthToken } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

type PrivateShellRole = "candidate" | "business"

type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  match: (pathname: string) => boolean
}

type PrivateShellProps = {
  role: PrivateShellRole
  title: string
  description: string
  breadcrumb: string
  children: ReactNode
}

const businessNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/business",
    icon: Gauge,
    match: (pathname) => pathname === "/dashboard/business",
  },
  {
    label: "Publicar Vaga",
    href: "/dashboard/business/jobs/new",
    icon: Plus,
    match: (pathname) => pathname.startsWith("/dashboard/business/jobs/new"),
  },
  {
    label: "Minhas Vagas",
    href: "#",
    icon: BriefcaseBusiness,
    match: () => false,
  },
  {
    label: "Candidatos",
    href: "#",
    icon: UserRound,
    match: () => false,
  },
  {
    label: "Perfil da Empresa",
    href: "#",
    icon: Settings,
    match: () => false,
  },
]

const candidateNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/seeker",
    icon: Gauge,
    match: (pathname) => pathname === "/dashboard/seeker",
  },
  {
    label: "Minhas candidaturas",
    href: "#",
    icon: FileText,
    match: () => false,
  },
  {
    label: "Mensagens",
    href: "#",
    icon: Mail,
    match: () => false,
  },
  {
    label: "Configuracoes",
    href: "#",
    icon: Settings,
    match: () => false,
  },
]

function buildProfileInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function PrivateShell({
  role,
  title,
  description,
  breadcrumb,
  children,
}: PrivateShellProps) {
  const session = getAuthSession()
  const pathname = usePathname()
  const router = useRouter()

  const userName =
    session?.user?.name?.trim() ||
    (role === "business" ? "Empresa autenticada" : "Candidato autenticado")
  const userInitials = buildProfileInitials(userName)
  const navItems = role === "business" ? businessNavItems : candidateNavItems
  const roleLabel =
    role === "business" ? "Painel do Recrutador" : "Painel do Candidato"

  function handlePlaceholderClick(label: string) {
    toast.warning(`${label} ainda nao foi implementado.`)
  }

  function handleLogout() {
    removeAuthToken()
    toast.success("Sessao encerrada.")
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="hidden h-screen w-64 shrink-0 border-r border-border/80 bg-card lg:flex lg:flex-col lg:sticky lg:top-0">
        <div className="p-6">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
            ITBA Empregos
          </Link>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            {roleLabel}
          </p>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.match(pathname)

            if (item.href === "#") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePlaceholderClick(item.label)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/80 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-card px-6 backdrop-blur lg:px-8">
          <h2 className="text-sm text-muted-foreground">
            {roleLabel} /{" "}
            <span className="font-semibold text-foreground">{breadcrumb}</span>
          </h2>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none">{userName}</p>
              <p className="mt-1 text-xs leading-none text-muted-foreground">
                {role === "business" ? "Empresa autenticada" : "Perfil autenticado"}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-grow bg-background p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.match(pathname)

                if (item.href === "#") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handlePlaceholderClick(item.label)}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm",
                      isActive
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
