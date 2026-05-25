import { z } from "zod"

export const vacancyFormSchema = z
  .object({
    title: z.string().trim().min(3, "Informe o titulo da vaga."),
    employmentType: z.enum(["clt", "pj", "estagio", "temporario"], {
      message: "Selecione o tipo de contratacao.",
    }),
    location: z.string().trim().min(2, "Informe a localidade da vaga."),
    salaryMin: z.string().trim().optional().transform((value) => value || ""),
    salaryMax: z.string().trim().optional().transform((value) => value || ""),
    description: z.string().trim().min(20, "Descreva melhor a vaga."),
    requirements: z.string().trim().min(20, "Informe os requisitos da vaga."),
  })
  .superRefine((data, ctx) => {
    const salaryMin = data.salaryMin ? Number(data.salaryMin) : null
    const salaryMax = data.salaryMax ? Number(data.salaryMax) : null

    if (salaryMin !== null && Number.isNaN(salaryMin)) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMin"],
        message: "Informe um salário mínimo válido.",
      })
    }

    if (salaryMax !== null && Number.isNaN(salaryMax)) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Informe um salário máximo válido.",
      })
    }

    if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "O salário máximo deve ser maior ou igual ao mínimo.",
      })
    }
  })

export type VacancyFormInput = z.infer<typeof vacancyFormSchema>
