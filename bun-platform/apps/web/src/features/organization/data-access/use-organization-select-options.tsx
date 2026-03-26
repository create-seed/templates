interface OrganizationSelectOptionSource {
  id: string
  name: string
}

export interface OrganizationSelectOption {
  id: string
  name: string
}

export function useOrganizationSelectOptions(
  organizations?: OrganizationSelectOptionSource[],
): OrganizationSelectOption[] {
  return (
    organizations?.map((organization) => {
      return {
        id: organization.id,
        name: organization.name,
      }
    }) ?? []
  )
}
