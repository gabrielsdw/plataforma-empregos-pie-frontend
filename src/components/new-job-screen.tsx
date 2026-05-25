"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Lightbulb, Rocket } from "lucide-react"
import { toast } from "sonner"

import { PrivateShell } from "@/components/private-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getFirstZodErrorMessage } from "@/hooks/auth-form-schemas"
import { vacancyFormSchema } from "@/hooks/job-form-schemas"
import { getApiErrorMessage } from "@/hooks/use-api-error"
import { useCreateVacancyMutation } from "@/hooks/use-vacancy-mutations"

const successTips = [
  "Seja claro e objetivo no título. Evite jargões internos da empresa.",
  "Detalhe os beneficios oferecidos e o contexto do time para aumentar a taxa de resposta.",
  "Especifique claramente se a vaga e presencial, hibrida ou remota.",
]

export function NewJobScreen() {
  const [submitIntent, setSubmitIntent] = useState<"draft" | "published">(
    "published"
  )
  const createVacancyMutation = useCreateVacancyMutation()
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

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
      await createVacancyMutation.mutateAsync({
        ...parsed.data,
        status: submitIntent,
      })

      toast.success(
        submitIntent === "draft"
          ? "Rascunho salvo com sucesso."
          : "Vaga publicada com sucesso."
      )
      router.push("/dashboard/business")
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const isPending = createVacancyMutation.isPending

  return (
    <PrivateShell
      role="business"
      title="Publicar Nova Vaga"
      description="Preencha as informações detalhadas para atrair os melhores talentos para sua empresa."
      breadcrumb="Publicar Vaga"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="rounded-2xl border border-border/80 bg-card py-0 shadow-sm lg:col-span-8">
          <CardContent className="p-6 lg:p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
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
                      placeholder="Ex: Desenvolvedor Front-end Senior"
                      className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
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
                        defaultValue=""
                        required
                      >
                        <option disabled value="">
                          Selecione...
                        </option>
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
                        placeholder="Ex: Sao Paulo, SP (ou Remoto)"
                        className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
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
                        placeholder="Ex: 5000"
                        className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
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
                        placeholder="Ex: 8000"
                        className="h-12 rounded-lg border border-border/80 bg-background px-4 py-3"
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
                      placeholder="Liste as habilidades técnicas e comportamentais necessárias..."
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col justify-end gap-4 border-t border-border/80 pt-6 sm:flex-row">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setSubmitIntent("draft")}
                  className="rounded-lg normal-case tracking-normal"
                >
                  {isPending && submitIntent === "draft"
                    ? "Salvando..."
                    : "Salvar Rascunho"}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  onClick={() => setSubmitIntent("published")}
                  className="rounded-lg normal-case tracking-normal"
                >
                  {isPending && submitIntent === "published"
                    ? "Publicando..."
                    : "Publicar Vaga"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-2xl border border-border/80 bg-muted/50 py-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="size-5 text-primary" />
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  Dicas de Sucesso
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
