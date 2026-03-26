import { useCallback } from 'react'

const ORGANIZATION_ACTIVE_COOKIE_NAME = 'bun_platform_active_organization_id'
const ORGANIZATION_ACTIVE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie.split('; ').find((entry) => {
    return entry.startsWith(`${name}=`)
  })

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(name.length + 1))
}

function writeCookieValue(name: string, value: string) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` + `max-age=${ORGANIZATION_ACTIVE_COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

function removeCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`
}

export function useOrganizationActiveCookie() {
  const clearOrganizationActiveCookie = useCallback(() => {
    removeCookieValue(ORGANIZATION_ACTIVE_COOKIE_NAME)
  }, [])

  const getOrganizationActiveCookie = useCallback(() => {
    return readCookieValue(ORGANIZATION_ACTIVE_COOKIE_NAME)
  }, [])

  const setOrganizationActiveCookie = useCallback((organizationId: string) => {
    writeCookieValue(ORGANIZATION_ACTIVE_COOKIE_NAME, organizationId)
  }, [])

  return {
    clearOrganizationActiveCookie,
    getOrganizationActiveCookie,
    setOrganizationActiveCookie,
  }
}
