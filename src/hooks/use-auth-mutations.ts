"use client"

import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { z } from "zod"

import { api } from "@/app/axios/instance"
import {
  businessSignupSchema,
  loginSchema,
  seekerSignupSchema,
} from "@/hooks/auth-form-schemas"
import { persistAuthSession } from "@/lib/auth-token"

export type LoginInput = z.infer<typeof loginSchema>
type ApiEnvelope<T> = {
  data: T
  message?: string
  statusCode?: number
  errors?: Record<string, string[] | string> | null
}

export type AuthTokenResponse = {
  access_token: string
  token_type: "bearer"
  expires_in: number
  user?: {
    id?: string | number
    name?: string
    email?: string
    phone?: string | null
    role?: "candidate" | "business"
    company_name?: string | null
    website?: string | null
    resume_path?: string | null
  }
}

export type SeekerSignupInput = z.infer<typeof seekerSignupSchema>
export type SeekerSignupResponse = AuthTokenResponse

export type BusinessSignupInput = z.infer<typeof businessSignupSchema>
export type BusinessSignupResponse = AuthTokenResponse

const authRoutes = {
  login: "/auth/login",
  seekerSignup: "/auth/register/seeker",
  businessSignup: "/auth/register/business",
} as const

async function loginRequest(input: LoginInput) {
  const parsed = loginSchema.parse(input)
  const response = await api.post<ApiEnvelope<AuthTokenResponse>>(
    authRoutes.login,
    {
      email: parsed.email,
      password: parsed.password,
      audience: parsed.audience,
    }
  )
  persistAuthSession(response.data.data)
  return response.data.data
}

async function seekerSignupRequest(input: SeekerSignupInput) {
  const parsed = seekerSignupSchema.parse(input)
  const formData = new FormData()

  formData.append("name", parsed.name)
  formData.append("email", parsed.email)
  formData.append("phone", parsed.phone)
  formData.append("password", parsed.password)
  formData.append("password_confirmation", parsed.passwordConfirmation)

  if (parsed.resume) {
    formData.append("resume", parsed.resume)
  }

  const response = await api.post<ApiEnvelope<SeekerSignupResponse>>(
    authRoutes.seekerSignup,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  persistAuthSession(response.data.data)
  return response.data.data
}

async function businessSignupRequest(input: BusinessSignupInput) {
  const parsed = businessSignupSchema.parse(input)
  const response = await api.post<ApiEnvelope<BusinessSignupResponse>>(
    authRoutes.businessSignup,
    {
      company_name: parsed.companyName,
      cnpj: parsed.cnpj,
      email: parsed.email,
      website: parsed.website || null,
      password: parsed.password,
      password_confirmation: parsed.passwordConfirmation,
      terms_accepted: parsed.termsAccepted,
    }
  )

  persistAuthSession(response.data.data)
  return response.data.data
}

export function useLoginMutation(
  options?: UseMutationOptions<AuthTokenResponse, unknown, LoginInput>
) {
  return useMutation({
    mutationFn: loginRequest,
    ...options,
  })
}

export function useSeekerSignupMutation(
  options?: UseMutationOptions<SeekerSignupResponse, unknown, SeekerSignupInput>
) {
  return useMutation({
    mutationFn: seekerSignupRequest,
    ...options,
  })
}

export function useBusinessSignupMutation(
  options?: UseMutationOptions<
    BusinessSignupResponse,
    unknown,
    BusinessSignupInput
  >
) {
  return useMutation({
    mutationFn: businessSignupRequest,
    ...options,
  })
}
