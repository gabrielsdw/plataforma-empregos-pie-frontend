import type { AuthTokenResponse } from "@/hooks/use-auth-mutations"

const AUTH_STORAGE_KEY = "pie.auth"

type StoredAuthSession = Pick<
  AuthTokenResponse,
  "access_token" | "token_type" | "expires_in" | "user"
> & {
  stored_at: number
}

function readStoredAuthSession() {
  if (typeof window === "undefined") {
    return null
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function getAuthToken() {
  return readStoredAuthSession()?.access_token ?? null
}

export function getAuthSession() {
  return readStoredAuthSession()
}

export function persistAuthSession(session: AuthTokenResponse) {
  if (typeof window === "undefined") {
    return
  }

  const payload: StoredAuthSession = {
    access_token: session.access_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    user: session.user,
    stored_at: Date.now(),
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
}

export function updateAuthSessionUser(user: NonNullable<AuthTokenResponse["user"]>) {
  if (typeof window === "undefined") {
    return
  }

  const currentSession = readStoredAuthSession()

  if (!currentSession) {
    return
  }

  const payload: StoredAuthSession = {
    ...currentSession,
    user,
    stored_at: Date.now(),
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
}

export function removeAuthToken() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
