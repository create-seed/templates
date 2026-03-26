export function resolveRpcUrl(baseUrl: string, rpcPath: string) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedRpcPath = rpcPath.startsWith('/') ? rpcPath : `/${rpcPath}`

  return `${normalizedBaseUrl}${normalizedRpcPath}`
}
