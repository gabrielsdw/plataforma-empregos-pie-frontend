"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  Globe,
  LockKeyhole,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  businessSignupSchema,
  getFirstZodErrorMessage,
} from "@/hooks/auth-form-schemas"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import { useBusinessSignupMutation } from "@/hooks/use-auth-mutations"

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

const previewImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAhOiJOjPzQ3Ths5GJ6BU2gsae3IuJ-Vfc7XY30EbGY1Nbyl64XT5s-y2kIkTQTMIqkUaVJjb-XzrWEkOsErGk4I2hSINdPxon3Pq0NA7_ZtZVgERL8CX0gpTMad0Uqv9ec04xytbJlHs-J0ssehzhRW-AAlLBXd1jDx47TlWdpMmisrVEhfEJX4mdA9UKuD9ZPBZgQSNYtMNJMvlZfjYJjwyynAkbPa9a8UYO-YISF0Df8M3T7XkDS1ShWfv0ZbT3ZMVDO8XzZcyFa"

export function BusinessSignupScreen() {
  const signupMutation = useBusinessSignupMutation()
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] = useState(false)

  function handleCnpjChange(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = formatCnpj(event.currentTarget.value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = businessSignupSchema.safeParse({
      companyName: String(formData.get("company-name") ?? ""),
      cnpj: String(formData.get("cnpj") ?? ""),
      email: String(formData.get("email") ?? ""),
      website: String(formData.get("website") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("confirm-password") ?? ""),
      termsAccepted: formData.get("terms") === "on",
    })

    if (!parsed.success) {
      toast.warning(getFirstZodErrorMessage(parsed.error))
      return
    }

    try {
      await signupMutation.mutateAsync(parsed.data)

      toast.success("Empresa cadastrada com sucesso.")
      form.reset()
      router.push("/dashboard/business")
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="w-full border-b border-border/70 bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-primary">
            <Building2 className="size-5" />
            <span>ITBA Empregos</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex w-full max-w-[1280px] items-center justify-center lg:justify-start">
          <section className="w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 size-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-32 rounded-full bg-secondary/10 blur-2xl" />

              <div className="relative z-10 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-primary">
                  Cadastro de Empresa
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Comece a recrutar os melhores talentos hoje mesmo.
                </p>
              </div>

              <form className="relative z-10 mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="company-name"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Nome da Empresa
                    </Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="company-name"
                        name="company-name"
                        type="text"
                        placeholder="Ex: Tech Solutions Ltda"
                        autoComplete="organization"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="cnpj"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      CNPJ
                    </Label>
                    <div className="relative">
                      <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="cnpj"
                        name="cnpj"
                        type="text"
                        inputMode="numeric"
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        onChange={handleCnpjChange}
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      E-mail Corporativo
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="rh@suaempresa.com.br"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="website"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Site da Empresa (Opcional)
                    </Label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://www.suaempresa.com.br"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-12 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="confirm-password"
                      className="mb-1 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type={isPasswordConfirmationVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-12 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordConfirmationVisible((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={isPasswordConfirmationVisible ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                      >
                        {isPasswordConfirmationVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-sm leading-6 text-muted-foreground"
                  >
                    Eu concordo com os{" "}
                    <Link
                      href="/"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </label>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="h-12 w-full justify-center rounded-lg normal-case tracking-normal text-sm font-semibold"
                  >
                    {signupMutation.isPending
                      ? "Criando..."
                      : "Criar Conta Corporativa"}
                  </Button>
                </div>

              </form>

              <div className="relative z-10 mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link
                    href="/"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Entre
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block lg:ml-16 max-w-lg">
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/20 p-8">
              <div className="absolute inset-0">
                <Image
                  alt="Corporate team collaborating in a modern glass office space with natural sunlight, professional attire, optimistic atmosphere"
                  src={previewImage}
                  fill
                  sizes="(min-width: 1024px) 32rem, 100vw"
                  className="object-cover opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <BadgeCheck className="size-8 text-primary" />
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    O Arquiteto Confiável
                  </h2>
                </div>
                <p className="mb-6 text-lg leading-8 text-muted-foreground">
                  Junte-se a milhares de empresas que confiam no ITBA Empregos
                  para construir equipes excepcionais. Nossa plataforma oferece
                  ferramentas avançadas de recrutamento para otimizar seu
                  processo seletivo.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                      <BadgeCheck className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Alcance Qualificado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Conecte-se com candidatos de alto nível.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                      <BadgeCheck className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Gestão Eficiente
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Acompanhe candidatos de ponta a ponta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
