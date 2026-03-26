import { Loader2 } from 'lucide-react'
import { type SubmitEvent, useEffect, useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import { Input } from '@bun-platform/ui/components/input'

interface AdminOrganizationSettingsUiFormValues {
  logo: string
  name: string
  slug: string
}

interface AdminOrganizationSettingsUiFormProps {
  initialValues: AdminOrganizationSettingsUiFormValues
  isPending: boolean
  onSubmit: (values: AdminOrganizationSettingsUiFormValues) => Promise<boolean>
}

export function AdminOrganizationSettingsUiForm(props: AdminOrganizationSettingsUiFormProps) {
  const { initialValues, isPending, onSubmit } = props
  const [formValues, setFormValues] = useState(initialValues)

  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues.logo, initialValues.name, initialValues.slug])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(formValues)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <label className="text-sm" htmlFor="organization-detail-name">
          Name
        </label>
        <Input
          id="organization-detail-name"
          onChange={(event) =>
            setFormValues((currentValues) => ({
              ...currentValues,
              name: event.target.value,
            }))
          }
          required
          value={formValues.name}
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm" htmlFor="organization-detail-slug">
          Slug
        </label>
        <Input
          id="organization-detail-slug"
          onChange={(event) =>
            setFormValues((currentValues) => ({
              ...currentValues,
              slug: event.target.value,
            }))
          }
          required
          value={formValues.slug}
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm" htmlFor="organization-detail-logo">
          Logo URL
        </label>
        <Input
          id="organization-detail-logo"
          onChange={(event) =>
            setFormValues((currentValues) => ({
              ...currentValues,
              logo: event.target.value,
            }))
          }
          value={formValues.logo}
        />
      </div>
      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
