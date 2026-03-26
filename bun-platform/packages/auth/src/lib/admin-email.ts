export function isAdminEmail(email: string, patterns: readonly string[]) {
  const normalizedEmail = email.toLowerCase()

  return patterns.some((pattern) => {
    const normalizedPattern = pattern.toLowerCase()

    return normalizedPattern.startsWith('*@')
      ? normalizedEmail.endsWith(normalizedPattern.slice(1))
      : normalizedPattern === normalizedEmail
  })
}
