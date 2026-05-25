"use client"

import { useState } from "react"
import { Building2, FileText, Globe, Mail, Phone, Save, UserRound } from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function ProfileScreen({ role }: ProfileScreenProps) {
  const session = getAuthSession()
  const user = session?.user
  const isBusiness = role === "business"

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [companyName, setCompanyName] = useState(user?.company_name ?? user?.name ?? "")
  const [website, setWebsite] = useState(user?.website ?? "")
  const [isSaving, setIsSaving] = useState(false)

  const displayName = isBusiness ? companyName.trim() || name.trim() : name.trim()
  const title = isBusiness ? "Perfil da empresa" : "Meu perfil"
  const description = isBusiness
    ? "Atualize as informações principais da sua empresa para manter seu painel consistente."
    : "Mantenha seus dados de contato atualizados para facilitar o retorno das empresas."

  function resetForm() {
    setName(user?.name ?? "")
    setEmail(user?.email ?? "")
    setPhone(user?.phone ?? "")
    setCompanyName(user?.company_name ?? user?.name ?? "")
    setWebsite(user?.website ?? "")
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
          return "Informe um site valido."
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
      return "Informe um celular valido."
    }

    return null
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errorMessage = validateForm()

    if (errorMessage) {
      toast.error(errorMessage)
      return
    }

    if (!user) {
      toast.error("Sessão não encontrada.")
      return
    }

    setIsSaving(true)

    updateAuthSessionUser({
      ...user,
      name: isBusiness ? companyName.trim() : name.trim(),
      email: email.trim(),
      phone: isBusiness ? user.phone ?? null : phone.trim(),
      company_name: isBusiness ? companyName.trim() : user.company_name ?? null,
      website: isBusiness ? website.trim() || null : user.website ?? null,
    })

    setName(isBusiness ? companyName.trim() : name.trim())
    setEmail(email.trim())
    setPhone(isBusiness ? user.phone ?? "" : phone.trim())
    setCompanyName(isBusiness ? companyName.trim() : companyName)
    setWebsite(isBusiness ? website.trim() : website)
    setIsSaving(false)

    toast.success("Perfil atualizado com sucesso.")
  }

  return (
    <PrivateShell
      role={role}
      title={title}
      description={description}
      breadcrumb="Perfil"
    >
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
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
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving}>
                <Save className="size-4" />
                {isSaving ? "Salvando..." : "Salvar perfil"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                Restaurar dados
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
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
                  <span>{website || "Website não informado"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <Phone className="size-4" />
                  <span>{phone || "Celular não informado"}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
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
                  {user?.resume_path || "Nenhum currículo foi enviado no cadastro."}
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </PrivateShell>
  )
}
