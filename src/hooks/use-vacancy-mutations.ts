"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"

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

export type VacancyBusiness = {
  id: number
  name: string | null
  company_name: string | null
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
  created_at?: string
  updated_at?: string
  business?: VacancyBusiness | null
}

export const businessVacanciesQueryKey = ["business-vacancies"] as const
export const publishedVacanciesQueryKey = ["published-vacancies"] as const

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

async function listBusinessVacanciesRequest() {
  const response = await api.get<ApiEnvelope<VacancyResponse[]>>("/vacancies")

  return response.data.data
}

async function listPublishedVacanciesRequest() {
  const response = await api.get<ApiEnvelope<VacancyResponse[]>>(
    "/vacancies/published"
  )

  return response.data.data
}

export function useBusinessVacanciesQuery(
  options?: Omit<
    UseQueryOptions<
      VacancyResponse[],
      unknown,
      VacancyResponse[],
      typeof businessVacanciesQueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: businessVacanciesQueryKey,
    queryFn: listBusinessVacanciesRequest,
    ...options,
  })
}

export function usePublishedVacanciesQuery(
  options?: Omit<
    UseQueryOptions<
      VacancyResponse[],
      unknown,
      VacancyResponse[],
      typeof publishedVacanciesQueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: publishedVacanciesQueryKey,
    queryFn: listPublishedVacanciesRequest,
    ...options,
  })
}

export function useCreateVacancyMutation(
  options?: UseMutationOptions<VacancyResponse, unknown, CreateVacancyInput>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: createVacancyRequest,
    async onSuccess(data, variables, context) {
      await queryClient.invalidateQueries({
        queryKey: businessVacanciesQueryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: publishedVacanciesQueryKey,
      })

      await options?.onSuccess?.(data, variables, context)
    },
  })
}
