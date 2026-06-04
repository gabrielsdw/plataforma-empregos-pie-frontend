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

export type VacancyStatus = "draft" | "published" | "closed"

export type ApplicationStatus = "applied"

export type CreateVacancyInput = VacancyFormInput & {
  status: "draft" | "published"
}

export type UpdateVacancyInput = VacancyFormInput & {
  id: number
  status: "draft" | "published"
}

export type CloseVacancyInput = {
  id: number
}

export type ApplyToVacancyInput = {
  vacancyId: number
  phone: string
  portfolioUrl?: string
  coverLetter: string
}

export type DownloadApplicantResumeInput = {
  applicationId: number
  fallbackFileName?: string | null
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
  status: VacancyStatus
  published_at: string | null
  created_at?: string
  updated_at?: string
  business?: VacancyBusiness | null
  applications_count?: number
  has_applied?: boolean
}

export type VacancyApplicant = {
  id: number
  name: string
  email: string
  phone: string | null
  resume_path: string | null
  resume_original_name?: string | null
  resume_url?: string | null
}

export type VacancyApplicationResponse = {
  id: number
  phone: string | null
  portfolio_url: string | null
  cover_letter: string | null
  status: ApplicationStatus
  applied_at: string | null
  created_at?: string
  updated_at?: string
  candidate?: VacancyApplicant | null
  vacancy?: {
    id: number
    title: string
    business_id: number
    location?: string
    employment_type?: VacancyResponse["employment_type"]
    status?: VacancyStatus
    published_at?: string | null
    business?: VacancyBusiness | null
  } | null
}

export const businessVacanciesQueryKey = ["business-vacancies"] as const
export const publishedVacanciesQueryKey = ["published-vacancies"] as const
export const businessApplicantsQueryKey = ["business-applicants"] as const
export const seekerApplicationsQueryKey = ["seeker-applications"] as const

export function businessVacancyQueryKey(vacancyId: number) {
  return ["business-vacancy", vacancyId] as const
}

function buildVacancyPayload(input: VacancyFormInput, status: "draft" | "published") {
  const parsed = vacancyFormSchema.parse(input)

  return {
    title: parsed.title,
    employment_type: parsed.employmentType,
    location: parsed.location,
    salary_min: parsed.salaryMin ? Number(parsed.salaryMin) : null,
    salary_max: parsed.salaryMax ? Number(parsed.salaryMax) : null,
    description: parsed.description,
    requirements: parsed.requirements,
    status,
  }
}

async function createVacancyRequest(input: CreateVacancyInput) {
  const response = await api.post<ApiEnvelope<VacancyResponse>>(
    "/vacancies",
    buildVacancyPayload(input, input.status)
  )

  return response.data.data
}

async function updateVacancyRequest(input: UpdateVacancyInput) {
  const response = await api.put<ApiEnvelope<VacancyResponse>>(
    `/vacancies/${input.id}`,
    buildVacancyPayload(input, input.status)
  )

  return response.data.data
}

async function closeVacancyRequest(input: CloseVacancyInput) {
  const response = await api.patch<ApiEnvelope<VacancyResponse>>(
    `/vacancies/${input.id}/close`
  )

  return response.data.data
}

async function applyToVacancyRequest(input: ApplyToVacancyInput) {
  const response = await api.post<ApiEnvelope<VacancyApplicationResponse>>(
    `/vacancies/${input.vacancyId}/apply`,
    {
      phone: input.phone,
      portfolio_url: input.portfolioUrl || null,
      cover_letter: input.coverLetter,
    }
  )

  return response.data.data
}

async function downloadApplicantResumeRequest(input: DownloadApplicantResumeInput) {
  const response = await api.get<Blob>(
    `/vacancies/applications/${input.applicationId}/resume`,
    {
      responseType: "blob",
    }
  )

  const contentDisposition = response.headers["content-disposition"]
  const fileNameMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
  const fileName = decodeURIComponent(
    fileNameMatch?.[1] || fileNameMatch?.[2] || input.fallbackFileName || "curriculo"
  )

  return {
    blob: response.data,
    fileName,
  }
}

async function listBusinessVacanciesRequest() {
  const response = await api.get<ApiEnvelope<VacancyResponse[]>>("/vacancies")

  return response.data.data
}

async function getBusinessVacancyRequest(vacancyId: number) {
  const response = await api.get<ApiEnvelope<VacancyResponse>>(
    `/vacancies/${vacancyId}`
  )

  return response.data.data
}

async function listPublishedVacanciesRequest() {
  const response = await api.get<ApiEnvelope<VacancyResponse[]>>(
    "/vacancies/published"
  )

  return response.data.data
}

async function listBusinessApplicantsRequest() {
  const response = await api.get<ApiEnvelope<VacancyApplicationResponse[]>>(
    "/vacancies/applicants"
  )

  return response.data.data
}

async function listSeekerApplicationsRequest() {
  const response = await api.get<ApiEnvelope<VacancyApplicationResponse[]>>(
    "/vacancies/applications/me"
  )

  return response.data.data
}

async function invalidateVacancyQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  vacancyId?: number
) {
  await queryClient.invalidateQueries({
    queryKey: businessVacanciesQueryKey,
  })
  await queryClient.invalidateQueries({
    queryKey: publishedVacanciesQueryKey,
  })
  await queryClient.invalidateQueries({
    queryKey: businessApplicantsQueryKey,
  })
  await queryClient.invalidateQueries({
    queryKey: seekerApplicationsQueryKey,
  })

  if (vacancyId !== undefined) {
    await queryClient.invalidateQueries({
      queryKey: businessVacancyQueryKey(vacancyId),
    })
  }
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

export function useBusinessVacancyQuery(
  vacancyId: number,
  options?: Omit<
    UseQueryOptions<
      VacancyResponse,
      unknown,
      VacancyResponse,
      ReturnType<typeof businessVacancyQueryKey>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: businessVacancyQueryKey(vacancyId),
    queryFn: () => getBusinessVacancyRequest(vacancyId),
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

export function useBusinessApplicantsQuery(
  options?: Omit<
    UseQueryOptions<
      VacancyApplicationResponse[],
      unknown,
      VacancyApplicationResponse[],
      typeof businessApplicantsQueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: businessApplicantsQueryKey,
    queryFn: listBusinessApplicantsRequest,
    ...options,
  })
}

export function useSeekerApplicationsQuery(
  options?: Omit<
    UseQueryOptions<
      VacancyApplicationResponse[],
      unknown,
      VacancyApplicationResponse[],
      typeof seekerApplicationsQueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: seekerApplicationsQueryKey,
    queryFn: listSeekerApplicationsRequest,
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
    async onSuccess(data, variables, onMutateResult, context) {
      await invalidateVacancyQueries(queryClient, data.id)
      await options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useUpdateVacancyMutation(
  options?: UseMutationOptions<VacancyResponse, unknown, UpdateVacancyInput>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: updateVacancyRequest,
    async onSuccess(data, variables, onMutateResult, context) {
      await invalidateVacancyQueries(queryClient, data.id)
      await options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useCloseVacancyMutation(
  options?: UseMutationOptions<VacancyResponse, unknown, CloseVacancyInput>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: closeVacancyRequest,
    async onSuccess(data, variables, onMutateResult, context) {
      await invalidateVacancyQueries(queryClient, data.id)
      await options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useApplyToVacancyMutation(
  options?: UseMutationOptions<
    VacancyApplicationResponse,
    unknown,
    ApplyToVacancyInput
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: applyToVacancyRequest,
    async onSuccess(data, variables, onMutateResult, context) {
      await invalidateVacancyQueries(queryClient, variables.vacancyId)
      await options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useDownloadApplicantResumeMutation(
  options?: UseMutationOptions<
    { blob: Blob; fileName: string },
    unknown,
    DownloadApplicantResumeInput
  >
) {
  return useMutation({
    mutationFn: downloadApplicantResumeRequest,
    ...options,
  })
}
