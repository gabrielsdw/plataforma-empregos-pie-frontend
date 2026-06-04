"use client"

import { useState, type FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle2, Lightbulb } from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getFirstZodErrorMessage } from "@/hooks/auth-form-schemas"
import { vacancyFormSchema } from "@/hooks/job-form-schemas"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import {
  useBusinessVacancyQuery,
  useUpdateVacancyMutation,
} from "@/hooks/use-vacancy-mutations"

const successTips = [
  "Ajuste o titulo para refletir senioridade, stack e contexto da vaga.",
  "Revise a descrição para manter a oportunidade atualizada e competitiva.",
  "Ao republicar uma vaga encerrada, confira salário, localidade e requisitos.",
]

export function EditJobScreen() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const vacancyId = Number(params.id)
  const [submitIntent, setSubmitIntent] = useState<"draft" | "published">(
    "published"
  )

  const vacancyQuery = useBusinessVacancyQuery(vacancyId, {
    enabled: Number.isFinite(vacancyId),
  })
  const updateVacancyMutation = useUpdateVacancyMutation()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!vacancyQuery.data) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const parsed = vacancyFormSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      employmentType: String(formData.get("employmentType") ?? ""),
      location: String(formData.get("location") ?? ""),
      salaryMin: String(formData.get("salaryMin") ?? ""),
      salaryMax: String(formData.get("salaryMax") ?? ""),
      description: String(formData.get("description") ?? ""),
      requirements: String(formData.get("requirements") ?? ""),
    })

    if (!parsed.success) {
      toast.warning(getFirstZodErrorMessage(parsed.error))
      return
    }

    try {
      await updateVacancyMutation.mutateAsync({
        id: vacancyQuery.data.id,
        ...parsed.data,
        status: submitIntent,
      })

      toast.success(
        submitIntent === "draft"
          ? "Rascunho atualizado com sucesso."
          : vacancyQuery.data.status === "closed"
            ? "Vaga reaberta e publicada com sucesso."
            : "Vaga atualizada com sucesso."
      )
      router.push("/dashboard/business")
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  if (vacancyQuery.isLoading) {
    return (
      <PrivateShell
        role="business"
        title="Editar Vaga"
        description="Carregando os dados da vaga para edição."
        breadcrumb="Editar Vaga"
      >
        <Card className="rounded-2xl border border-border/80 bg-card py-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Carregando vaga...</p>
          </CardContent>
        </Card>
      </PrivateShell>
    )
  }

  if (vacancyQuery.isError || !vacancyQuery.data) {
    return (
      <PrivateShell
        role="business"
        title="Editar Vaga"
        description="Não foi possível carregar a vaga solicitada."
        breadcrumb="Editar Vaga"
      >
        <Card className="rounded-2xl border border-destructive/30 bg-card py-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              Não foi possível carregar os dados da vaga para edição.
            </p>
          </CardContent>
        </Card>
      </PrivateShell>
    )
  }

  const vacancy = vacancyQuery.data
  const isPending = updateVacancyMutation.isPending
  const publishActionLabel =
    vacancy.status === "closed" ? "Reabrir e Publicar" : "Salvar e Publicar"

  return (
    <PrivateShell
      role="business"
      title="Editar Vaga"
      description="Atualize as informações da vaga e ajuste o status de publicação conforme necessário."
      breadcrumb="Editar Vaga"
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
        <Card className="rounded-2xl border border-border/80 bg-card py-0 shadow-sm lg:col-span-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form key={vacancy.id} className="space-y-8" onSubmit={handleSubmit}>
              <section className="space-y-6">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    Informações Principais
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Titulo da Vaga *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={vacancy.title}
                      placeholder="Ex: Desenvolvedor Front-end Senior"
                      className="h-12 w-full rounded-lg border border-border/80 bg-background px-4 py-3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="employmentType"
                        className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                      >
                        Tipo de Contratacao *
                      </Label>
                      <select
                        id="employmentType"
                        name="employmentType"
                        className="h-12 w-full rounded-lg border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                        defaultValue={vacancy.employment_type}
                        required
                      >
                        <option value="clt">CLT</option>
                        <option value="pj">PJ</option>
                        <option value="estagio">Estágio</option>
                        <option value="temporario">Temporário</option>
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="location"
                        className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                      >
                        Localidade *
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        defaultValue={vacancy.location}
                        placeholder="Ex: Sao Paulo, SP (ou Remoto)"
                        className="h-12 w-full rounded-lg border border-border/80 bg-background px-4 py-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="salaryMin"
                        className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                      >
                        Faixa Salarial Minima (R$)
                      </Label>
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        defaultValue={vacancy.salary_min ?? ""}
                        placeholder="Ex: 5000"
                        className="h-12 w-full rounded-lg border border-border/80 bg-background px-4 py-3"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="salaryMax"
                        className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                      >
                        Faixa Salarial Maxima (R$)
                      </Label>
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        defaultValue={vacancy.salary_max ?? ""}
                        placeholder="Ex: 8000"
                        className="h-12 w-full rounded-lg border border-border/80 bg-background px-4 py-3"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    Detalhes da Vaga
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Descrição da Vaga *
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      defaultValue={vacancy.description}
                      placeholder="Descreva as responsabilidades, o dia a dia e o impacto dessa função..."
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="requirements"
                      className="mb-2 block text-sm font-medium normal-case tracking-normal text-foreground"
                    >
                      Requisitos *
                    </Label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      rows={5}
                      defaultValue={vacancy.requirements}
                      placeholder="Liste as habilidades técnicas e comportamentais necessárias..."
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col justify-end gap-3 border-t border-border/80 pt-5 sm:flex-row sm:gap-4 sm:pt-6">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setSubmitIntent("draft")}
                  className="w-full rounded-lg normal-case tracking-normal sm:w-auto"
                >
                  {isPending && submitIntent === "draft"
                    ? "Salvando..."
                    : "Salvar como Rascunho"}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  onClick={() => setSubmitIntent("published")}
                  className="w-full rounded-lg normal-case tracking-normal sm:w-auto"
                >
                  {isPending && submitIntent === "published"
                    ? "Publicando..."
                    : publishActionLabel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-2xl border border-border/80 bg-muted/50 py-0 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="size-5 text-primary" />
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  Dicas de Edicao
                </h3>
              </div>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {successTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateShell>
  )
}
