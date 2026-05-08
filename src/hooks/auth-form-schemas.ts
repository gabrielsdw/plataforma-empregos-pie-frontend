import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  audience: z.enum(["candidate", "employer"]),
})

export const seekerSignupSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .email("Informe um e-mail válido."),
    phone: z
      .string()
      .trim()
      .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Informe um celular válido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z
      .string()
      .min(8, "Confirme sua senha com pelo menos 8 caracteres."),
    resume: z.instanceof(File).nullable().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "A confirmação de senha não confere.",
  })

export const businessSignupSchema = z
  .object({
    companyName: z.string().trim().min(2, "Informe o nome da empresa."),
    cnpj: z
      .string()
      .trim()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "Informe um CNPJ válido."),
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail corporativo.")
      .email("Informe um e-mail válido."),
    website: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().url("Informe um site válido.").optional()
    ),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z
      .string()
      .min(8, "Confirme sua senha com pelo menos 8 caracteres."),
    termsAccepted: z
      .boolean()
      .refine((value) => value, { message: "Você precisa aceitar os termos." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "A confirmação de senha não confere.",
  })

export function getFirstZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos."
}
