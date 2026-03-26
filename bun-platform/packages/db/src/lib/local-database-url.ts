const LOCAL_DATABASE_HOSTS = ['127.0.0.1', '::1', 'localhost'] as const
const LOCAL_NETWORK_DATABASE_PROTOCOLS = ['http:', 'https:', 'libsql:', 'ws:', 'wss:'] as const

export function isLocalDatabaseUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl)
    const hostname = url.hostname.replace(/^\[(.*)\]$/, '$1').toLowerCase()

    if (url.protocol === 'file:') {
      return hostname.length === 0 || LOCAL_DATABASE_HOSTS.includes(hostname as (typeof LOCAL_DATABASE_HOSTS)[number])
    }

    if (!LOCAL_NETWORK_DATABASE_PROTOCOLS.includes(url.protocol as (typeof LOCAL_NETWORK_DATABASE_PROTOCOLS)[number])) {
      return false
    }

    return LOCAL_DATABASE_HOSTS.includes(hostname as (typeof LOCAL_DATABASE_HOSTS)[number])
  } catch {
    return false
  }
}
