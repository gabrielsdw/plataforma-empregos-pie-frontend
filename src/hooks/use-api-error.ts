import { isAxiosError } from "axios"

type ApiErrorShape = {
  message?: string
  error?: string
  errors?: Record<string, string[] | string>
}

export function getApiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Não foi possível concluir a requisição."
  }

  const payload = error.response?.data as ApiErrorShape | undefined

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error
  }

  const firstError = payload?.errors
    ? Object.values(payload.errors).flat().find((value) => typeof value === "string")
    : undefined

  if (typeof firstError === "string" && firstError.trim()) {
    return firstError
  }

  return "Não foi possível concluir a requisição."
}
