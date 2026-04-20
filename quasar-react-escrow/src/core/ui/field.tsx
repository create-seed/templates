'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { useMemo } from 'react'

import { Label } from '@/core/ui/label'
import { Separator } from '@/core/ui/separator'
import { cn } from '@/core/util/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-4 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
        className,
      )}
      data-slot="field-group"
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: { variant?: 'label' | 'legend' } & React.ComponentProps<'legend'>) {
  return (
    <legend
      className={cn('mb-2 font-medium data-[variant=label]:text-xs/relaxed data-[variant=legend]:text-sm', className)}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      data-slot="field-set"
      {...props}
    />
  )
}

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-destructive', {
  defaultVariants: {
    orientation: 'vertical',
  },
  variants: {
    orientation: {
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
    },
  },
})

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      className={cn(fieldVariants({ orientation }), className)}
      data-orientation={orientation}
      data-slot="field"
      role="group"
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('group/field-content flex flex-1 flex-col gap-0.5 leading-snug', className)}
      data-slot="field-content"
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-left text-xs/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      data-slot="field-description"
      {...props}
    />
  )
}

function FieldError({
  children,
  className,
  errors,
  ...props
}: {
  errors?: Array<{ message?: string } | undefined>
} & React.ComponentProps<'div'>) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      className={cn('text-xs/relaxed font-normal text-destructive', className)}
      data-slot="field-error"
      role="alert"
      {...props}
    >
      {content}
    </div>
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-2 dark:has-data-checked:bg-primary/10',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
} & React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative -my-2 h-5 text-xs/relaxed group-data-[variant=outline]/field-group:-mb-2', className)}
      data-content={!!children}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-fit items-center gap-2 text-xs/relaxed leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
