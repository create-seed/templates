import { Input } from '@bun-platform/ui/components/input'

interface AdminOrganizationDirectoryUiSearchProps {
  onChange: (value: string) => void
  value: string
}

export function AdminOrganizationDirectoryUiSearch(props: AdminOrganizationDirectoryUiSearchProps) {
  const { onChange, value } = props

  return (
    <div className="max-w-md">
      <Input onChange={(event) => onChange(event.target.value)} placeholder="Search by name or slug" value={value} />
    </div>
  )
}
