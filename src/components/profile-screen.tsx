"use client"

import { useRef, useState } from "react"
import { Building2, Download, FileText, Globe, Mail, Phone, Save, Upload, UserRound } from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import { api } from "@/app/axios/instance"
import { useUpdateProfileMutation, type AuthUser } from "@/hooks/use-auth-mutations"
import { getAuthSession, updateAuthSessionUser } from "@/lib/auth-token"

type ProfileScreenProps = {
  role: "candidate" | "business"
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

function buildInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function isValidResume(file: File) {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  if (!validTypes.includes(file.type)) {
    return "Envie um arquivo PDF, DOC ou DOCX."
  }

  if (file.size > 5 * 1024 * 1024) {
    return "O currículo deve ter no máximo 5MB."
  }

  return null
}

function buildUpdatedUser(currentUser: AuthUser, updates: AuthUser) {
  return {
    ...currentUser,
    ...updates,
  }
}

export function ProfileScreen({ role }: ProfileScreenProps) {
  const session = getAuthSession()
  const sessionUser = session?.user
  const isBusiness = role === "business"
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const updateProfileMutation = useUpdateProfileMutation()

  const [currentUser, setCurrentUser] = useState<AuthUser>(sessionUser ?? {})
  const [name, setName] = useState(sessionUser?.name ?? "")
  const [email, setEmail] = useState(sessionUser?.email ?? "")
  const [phone, setPhone] = useState(sessionUser?.phone ?? "")
  const [companyName, setCompanyName] = useState(sessionUser?.company_name ?? sessionUser?.name ?? "")
  const [website, setWebsite] = useState(sessionUser?.website ?? "")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeLabel, setResumeLabel] = useState<string>(sessionUser?.resume_original_name ?? "")
  const [isDownloadingResume, setIsDownloadingResume] = useState(false)

  const displayName = isBusiness ? companyName.trim() || name.trim() : name.trim()
  const title = isBusiness ? "Perfil da empresa" : "Meu perfil"
  const description = isBusiness
    ? "Atualize as informações principais da sua empresa para manter seu painel consistente."
    : "Mantenha seus dados de contato e currículo atualizados para facilitar o retorno das empresas."

  function syncUserState(updatedUser: AuthUser) {
    setCurrentUser(updatedUser)
    setName(updatedUser.name ?? "")
    setEmail(updatedUser.email ?? "")
    setPhone(updatedUser.phone ?? "")
    setCompanyName(updatedUser.company_name ?? updatedUser.name ?? "")
    setWebsite(updatedUser.website ?? "")
    setResumeFile(null)
    setResumeLabel(updatedUser.resume_original_name ?? "")

    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""
    }
  }


  function validateForm() {
    if (isBusiness) {
      if (companyName.trim().length < 2) {
        return "Informe o nome da empresa."
      }

      if (!email.trim()) {
        return "Informe o e-mail corporativo."
      }

      if (website.trim()) {
        try {
          new URL(website.trim())
        } catch {
          return "Informe um site válido."
        }
      }

      return null
    }

    if (name.trim().length < 2) {
      return "Informe seu nome completo."
    }

    if (!email.trim()) {
      return "Informe seu e-mail."
    }

    if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone.trim())) {
      return "Informe um celular válido."
    }

    if (resumeFile) {
      return isValidResume(resumeFile)
    }

    return null
  }

  async function handleSavedResumeDownload() {
    if (!currentUser.resume_url) {
      toast.error("Currículo não disponível para download.")
      return
    }

    try {
      setIsDownloadingResume(true)

      const response = await api.get<Blob>("/auth/resume", {
        responseType: "blob",
      })

      const contentDisposition = response.headers["content-disposition"]
      const fileNameMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
      const fileName = decodeURIComponent(
        fileNameMatch?.[1] ||
          fileNameMatch?.[2] ||
          currentUser.resume_original_name ||
          "curriculo"
      )

      const objectUrl = window.URL.createObjectURL(response.data)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsDownloadingResume(false)
    }
  }

  function handleResumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setResumeFile(null)
      setResumeLabel(currentUser.resume_original_name ?? "")
      return
    }

    const validationMessage = isValidResume(file)

    if (validationMessage) {
      toast.error(validationMessage)
      event.target.value = ""
      setResumeFile(null)
      setResumeLabel(currentUser.resume_original_name ?? "")
      return
    }

    setResumeFile(file)
    setResumeLabel(file.name)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errorMessage = validateForm()

    if (errorMessage) {
      toast.error(errorMessage)
      return
    }

    if (!sessionUser) {
      toast.error("Sessão não encontrada.")
      return
    }

    try {
      const updatedUser = await updateProfileMutation.mutateAsync(
        isBusiness
          ? {
              role: "business",
              companyName,
              email,
              website,
            }
          : {
              role: "candidate",
              name,
              email,
              phone,
              resume: resumeFile,
            }
      )

      const mergedUser = buildUpdatedUser(currentUser, updatedUser)
      updateAuthSessionUser(mergedUser)
      syncUserState(mergedUser)
      toast.success("Perfil atualizado com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <PrivateShell
      role={role}
      title={title}
      description={description}
      breadcrumb="Perfil"
    >
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {isBusiness ? (
                <div className="md:col-span-2">
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Ex.: Acme Tecnologia"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={isBusiness ? "contato@empresa.com" : "você@email.com"}
                />
              </div>

              {isBusiness ? (
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://suaempresa.com.br"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="phone">Celular</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              )}

              {!isBusiness ? (
                <div className="md:col-span-2">
                  <Label htmlFor="resume">Currículo</Label>
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-3 sm:p-4">
                    <input
                      ref={resumeInputRef}
                      id="resume"
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={handleResumeChange}
                    />
                    <label
                      htmlFor="resume"
                      className="flex cursor-pointer flex-col items-start gap-3 text-sm text-foreground sm:flex-row sm:items-center"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Upload className="size-4" />
                      </span>
                      <span>
                        {resumeLabel || "Selecione um novo currículo"}
                      </span>
                    </label>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Formatos aceitos: PDF, DOC ou DOCX com até 5MB.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                <Save className="size-4" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {buildInitials(displayName || email || "Perfil")}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {displayName || "Perfil sem identificacao"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isBusiness ? "Conta empresarial" : "Conta de candidato"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                {isBusiness ? <Building2 className="size-4" /> : <UserRound className="size-4" />}
                <span>{displayName || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                <Mail className="size-4" />
                <span>{email || "Não informado"}</span>
              </div>
              {isBusiness ? (
                <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <Globe className="size-4" />
                  <span className="break-all">{website || "Website não informado"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <Phone className="size-4" />
                  <span className="break-all">{phone || "Celular não informado"}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {isBusiness ? "Presenca digital" : "Documentos"}
            </h3>
            {isBusiness ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Mantenha o site da empresa atualizado para transmitir mais confiança aos candidatos durante a candidatura.
              </p>
            ) : (
              <div className="mt-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <FileText className="size-4" />
                  Currículo cadastrado
                </div>
                <p className="mt-2 break-all leading-6">
                  {currentUser.resume_original_name || "Nenhum currículo foi enviado no cadastro."}
                </p>
                {currentUser.resume_url ? (
                  <button
                    type="button"
                    onClick={handleSavedResumeDownload}
                    disabled={isDownloadingResume}
                    className="mt-3 inline-flex items-center gap-2 text-primary hover:underline disabled:opacity-60"
                  >
                    <Download className="size-4" />
                    {isDownloadingResume ? "Baixando currículo..." : "Abrir currículo salvo"}
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PrivateShell>
  )
}
