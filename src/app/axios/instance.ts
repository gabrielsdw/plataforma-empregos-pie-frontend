import axios, { type AxiosError } from "axios"

import { getAuthToken, removeAuthToken } from "@/lib/auth-token"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeAuthToken()

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)
