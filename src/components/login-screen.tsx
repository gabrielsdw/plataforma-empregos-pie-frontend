"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getFirstZodErrorMessage,
  loginSchema,
} from "@/hooks/auth-form-schemas"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import { useLoginMutation } from "@/hooks/use-auth-mutations"
import { cn } from "@/lib/utils"

type Audience = "candidate" | "employer"

const navigationItems = [
  "Buscar Vagas",
  "Empresas",
  "Anunciar Vaga",
  "Recursos",
]

export function LoginScreen() {
  const [audience, setAudience] = useState<Audience>("candidate")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const loginMutation = useLoginMutation()

  const isCandidate = audience === "candidate"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      audience,
    })

    if (!parsed.success) {
      toast.warning(getFirstZodErrorMessage(parsed.error))
      return
    }

    try {
      const response = await loginMutation.mutateAsync(parsed.data)

      toast.success("Login realizado com sucesso.")
      form.reset()
      router.push(
        response.user?.role === "business"
          ? "/dashboard/business"
          : "/dashboard/seeker"
      )
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                IT
              </span>
              <span className="text-lg font-semibold tracking-tight">
                ITBA Empregos
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "normal-case tracking-normal text-sm",
              })}
            >
              Entrar
            </Link>
            <Link
              href={isCandidate ? "/signup/seeker" : "/signup/business"}
              className={buttonVariants({
                size: "sm",
                className: "normal-case tracking-normal text-sm",
              })}
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] items-center px-6 py-10 md:min-h-[calc(100svh-4rem)] md:px-8 md:py-16">
        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16">
          <section className="md:col-span-7">
            <div className="flex max-w-2xl flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <BriefcaseBusiness className="size-3.5" />
                Conexão profissional
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  O Arquiteto Confiável para suas Necessidades de Contratação.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Uma plataforma de alta densidade e engenharia de precisão
                  projetada para conectar talentos de alto nível a empresas
                  líderes de mercado sem esforço.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Perfis organizados",
                  "Busca de vagas objetiva",
                  "Fluxo pronto para empresas",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground"
                  >
                    <span className="size-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="md:col-span-5">
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
              <div
                role="tablist"
                aria-label="Escolha o tipo de acesso"
                className="grid grid-cols-2 border-b border-border/70 bg-muted/30"
              >
                <button
                  type="button"
                  role="tab"
                  id="candidate-tab"
                  aria-controls="login-panel"
                  aria-selected={isCandidate}
                  onClick={() => setAudience("candidate")}
                  className={cn(
                    "border-b-2 px-4 py-4 text-center text-sm font-semibold transition-colors",
                    isCandidate
                      ? "border-primary bg-background text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  )}
                >
                  Candidato
                </button>
                <button
                  type="button"
                  role="tab"
                  id="employer-tab"
                  aria-controls="login-panel"
                  aria-selected={!isCandidate}
                  onClick={() => setAudience("employer")}
                  className={cn(
                    "border-b-2 px-4 py-4 text-center text-sm font-semibold transition-colors",
                    !isCandidate
                      ? "border-primary bg-background text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  )}
                >
                  Empregador
                </button>
              </div>

              <div
                id="login-panel"
                role="tabpanel"
                aria-labelledby={isCandidate ? "candidate-tab" : "employer-tab"}
                className="p-6 md:p-8"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Bem-vindo de volta
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {isCandidate
                      ? "Faça login para gerenciar seu perfil profissional."
                      : "Acesse o painel da sua empresa para gerenciar vagas e candidatos."}
                  </p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium normal-case tracking-normal"
                    >
                      E-mail Profissional
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="nome@empresa.com"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium normal-case tracking-normal"
                      >
                        Senha
                      </Label>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-12 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="h-12 w-full justify-center rounded-lg normal-case tracking-normal text-sm font-semibold"
                  >
                    <span>
                      {loginMutation.isPending
                        ? "Entrando..."
                        : isCandidate
                          ? "Entrar na Conta"
                          : "Entrar no Painel"}
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>

                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  {isCandidate ? "Não tem uma conta?" : "Ainda não cadastrou sua empresa?"}{" "}
                  <Link
                    href={isCandidate ? "/signup/seeker" : "/signup/business"}
                    className="font-medium text-primary hover:underline"
                  >
                    {isCandidate ? "Cadastre-se agora" : "Cadastre sua empresa"}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
