"use client"

import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BriefcaseBusiness,
  FileText,
  Gauge,
  Info,
  LogOut,
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
    match: (pathname) => pathname.startsWith("/dashboard/business/jobs/"),
  },
  {
    label: "Minhas Vagas",
    href: "/dashboard/business",
    icon: BriefcaseBusiness,
    match: (pathname) => pathname === "/dashboard/business",
  },
  {
    label: "Candidatos",
    href: "/dashboard/business/candidates",
    icon: UserRound,
    match: (pathname) => pathname.startsWith("/dashboard/business/candidates"),
  },
  {
    label: "Perfil",
    href: "/dashboard/business/profile",
    icon: Settings,
    match: (pathname) => pathname.startsWith("/dashboard/business/profile"),
  },
  {
    label: "Sobre",
    href: "/dashboard/business/about",
    icon: Info,
    match: (pathname) => pathname.startsWith("/dashboard/business/about"),
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
    href: "/dashboard/seeker/applications",
    icon: FileText,
    match: (pathname) => pathname.startsWith("/dashboard/seeker/applications"),
  },
  {
    label: "Perfil",
    href: "/dashboard/seeker/profile",
    icon: Settings,
    match: (pathname) => pathname.startsWith("/dashboard/seeker/profile"),
  },
  {
    label: "Sobre",
    href: "/dashboard/seeker/about",
    icon: Info,
    match: (pathname) => pathname.startsWith("/dashboard/seeker/about"),
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
    session?.user?.company_name?.trim() || session?.user?.name?.trim() || "Perfil"
  const userInitials = buildProfileInitials(userName)
  const navItems = role === "business" ? businessNavItems : candidateNavItems
  const roleLabel =
    role === "business" ? "Painel do Recrutador" : "Painel do Candidato"

  function handleLogout() {
    removeAuthToken()
    toast.success("Sessão encerrada.")
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh overflow-x-clip bg-background text-foreground">
      <aside className="hidden h-screen w-64 shrink-0 border-r border-border/80 bg-card lg:sticky lg:top-0 lg:flex lg:flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
            ITBA Empregos
          </Link>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            {roleLabel}
          </p>
        </div>

        <nav className="flex-grow space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.match(pathname)

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
        <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-card px-3 py-3 backdrop-blur sm:px-6 lg:px-8">
          <h2 className="min-w-0 text-xs leading-5 text-muted-foreground sm:text-sm">
            {roleLabel} / <span className="font-semibold text-foreground">{breadcrumb}</span>
          </h2>

          <div className="flex min-w-0 items-center gap-3 self-start sm:self-auto">
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-semibold leading-none">{userName}</p>
              <p className="mt-1 text-xs leading-none text-muted-foreground">
                {role === "business" ? "Empresa" : "Candidato"}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-grow bg-background p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.match(pathname)

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs sm:px-4 sm:text-sm",
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
