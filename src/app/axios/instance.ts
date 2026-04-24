import axios, { type AxiosError } from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Central place to normalize Laravel error payloads later.
    return Promise.reject(error)
  }
)

