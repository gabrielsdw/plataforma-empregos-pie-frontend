"use client"

import { useMutation, type UseMutationOptions } from "@tanstack/react-query"

import { api } from "@/app/axios/instance"
import {
  type VacancyFormInput,
  vacancyFormSchema,
} from "@/hooks/job-form-schemas"

type ApiEnvelope<T> = {
  data: T
  message?: string
  statusCode?: number
  errors?: Record<string, string[] | string> | null
}

export type CreateVacancyInput = VacancyFormInput & {
  status: "draft" | "published"
}

export type VacancyResponse = {
  id: number
  title: string
  employment_type: "clt" | "pj" | "estagio" | "temporario"
  location: string
  salary_min: string | null
  salary_max: string | null
  description: string
  requirements: string
  status: "draft" | "published"
  published_at: string | null
}

async function createVacancyRequest(input: CreateVacancyInput) {
  const parsed = vacancyFormSchema.parse(input)

  const response = await api.post<ApiEnvelope<VacancyResponse>>("/vacancies", {
    title: parsed.title,
    employment_type: parsed.employmentType,
    location: parsed.location,
    salary_min: parsed.salaryMin ? Number(parsed.salaryMin) : null,
    salary_max: parsed.salaryMax ? Number(parsed.salaryMax) : null,
    description: parsed.description,
    requirements: parsed.requirements,
    status: input.status,
  })

  return response.data.data
}

export function useCreateVacancyMutation(
  options?: UseMutationOptions<VacancyResponse, unknown, CreateVacancyInput>
) {
  return useMutation({
    mutationFn: createVacancyRequest,
    ...options,
  })
}
