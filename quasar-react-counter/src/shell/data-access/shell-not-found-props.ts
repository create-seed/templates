export interface ShellNotFoundLink {
  description: string
  title: string
  to: string
}

export interface ShellNotFoundProps {
  description?: string
  links?: ShellNotFoundLink[]
  title?: string
}
