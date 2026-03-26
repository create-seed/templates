import type { OrganizationSelectOption } from '../data-access/use-organization-select-options'

interface OrganizationUiSelectProps {
  ariaLabel: string
  disabled?: boolean
  onValueChange: (organizationId: string) => void
  options: OrganizationSelectOption[]
  placeholder: string
  value: string
}

export function OrganizationUiSelect({
  ariaLabel,
  disabled = false,
  onValueChange,
  options,
  placeholder,
  value,
}: OrganizationUiSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onChange={(event) => {
        onValueChange(event.target.value)
      }}
      value={value}
    >
      <option disabled value="">
        {placeholder}
      </option>
      {options.map((option) => {
        return (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        )
      })}
    </select>
  )
}
