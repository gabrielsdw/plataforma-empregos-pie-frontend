import { useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  FileUp,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getFirstZodErrorMessage,
  seekerSignupSchema,
} from "@/hooks/auth-form-schemas"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import { useSeekerSignupMutation } from "@/hooks/use-auth-mutations"

export function SeekerSignupScreen() {
  const signupMutation = useSeekerSignupMutation()
  const [localError, setLocalError] = useState<string | null>(null)

  const errorMessage = localError ?? (signupMutation.error ? getApiErrorMessage(signupMutation.error) : null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const resume = formData.get("file-upload")
    const parsed = seekerSignupSchema.safeParse({
      name: String(formData.get("nome") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("celular") ?? ""),
      password: String(formData.get("senha") ?? ""),
      passwordConfirmation: String(formData.get("confirmar-senha") ?? ""),
      resume: resume instanceof File && resume.size > 0 ? resume : null,
    })

    if (!parsed.success) {
      setLocalError(getFirstZodErrorMessage(parsed.error))
      return
    }

    try {
      await signupMutation.mutateAsync(parsed.data)

      form.reset()
    } catch {
      // Mutation state already carries the error message.
    }
  }

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-[600px]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-[30px]">
              ITBA Empregos
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              O Arquiteto Confiável do seu futuro profissional.
            </p>
          </div>

          <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Cadastro de Candidato
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Preencha seus dados para começar a se candidatar às melhores vagas.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="nome"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Nome Completo
                    </Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        autoComplete="name"
                        placeholder="João da Silva"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="joao@exemplo.com"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="celular"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Celular
                    </Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="celular"
                        name="celular"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(11) 99999-9999"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <Label
                      htmlFor="senha"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="senha"
                        name="senha"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <Label
                      htmlFor="confirmar-senha"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmar-senha"
                        name="confirmar-senha"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-12 rounded-lg border border-border/80 bg-background pl-10 pr-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground">
                      Currículo (Opcional agora)
                    </Label>
                    <div className="rounded-lg border-2 border-dashed border-border/80 bg-muted/30 px-6 py-6 text-center transition-colors hover:border-primary hover:bg-muted/40">
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex cursor-pointer flex-col items-center gap-2"
                      >
                        <FileUp className="size-8 text-muted-foreground transition-colors" />
                        <span className="text-sm font-medium text-primary">
                          Faça upload de um arquivo
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ou arraste e solte
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX até 5MB
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="h-12 w-full justify-center rounded-lg normal-case tracking-normal text-sm font-semibold"
                  >
                    {signupMutation.isPending ? "Criando..." : "Criar Conta"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>

                {errorMessage ? (
                  <p className="text-center text-sm text-destructive" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
              </form>

              <div className="mt-6 text-center">
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
        </div>
      </div>
    </main>
  )
}
