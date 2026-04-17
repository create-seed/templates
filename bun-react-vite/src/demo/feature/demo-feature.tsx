import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CopyIcon,
  Loader2Icon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  ShoppingBagIcon,
  TrashIcon,
} from 'lucide-react'
import { type CSSProperties, useCallback, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/core/ui/alert-dialog'
import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { ButtonGroup } from '@/core/ui/button-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card'
import { Checkbox } from '@/core/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/ui/dropdown-menu'
import { Field, FieldGroup } from '@/core/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/core/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/core/ui/item'
import { RadioGroup, RadioGroupItem } from '@/core/ui/radio-group'
import { Slider } from '@/core/ui/slider'
import { Switch } from '@/core/ui/switch'
import { Textarea } from '@/core/ui/textarea'

export function DemoFeature() {
  const [sliderValue, setSliderValue] = useState<number[]>([500])
  const handleSliderValueChange = useCallback((value: number | readonly number[]) => {
    if (typeof value === 'number') {
      setSliderValue([value])
    } else {
      setSliderValue([...value])
    }
  }, [])

  return (
    <div className="min-h-full w-full bg-muted px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-12 dark:bg-background">
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Style Overview</CardTitle>
              <CardDescription className="line-clamp-2">
                Designers love packing quirky glyphs into test phrases. This is a preview of the typography styles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3">
                {[
                  '--background',
                  '--foreground',
                  '--primary',
                  '--secondary',
                  '--muted',
                  '--accent',
                  '--border',
                  '--chart-1',
                  '--chart-2',
                  '--chart-3',
                  '--chart-4',
                  '--chart-5',
                ].map((variant) => (
                  <div className="flex flex-col flex-wrap items-center gap-2" key={variant}>
                    <div
                      className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                      style={
                        {
                          '--color': `var(${variant})`,
                        } as CSSProperties
                      }
                    />
                    <div className="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">{variant}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-8 place-items-center gap-4">
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <CopyIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <CircleAlertIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <TrashIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ShareIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ShoppingBagIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <MoreHorizontalIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <Loader2Icon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <PlusIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <MinusIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ArrowLeftIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ArrowRightIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <CheckIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ChevronDownIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <ChevronRightIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <SearchIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center rounded-md p-0 ring ring-border *:[svg]:size-4">
                  <SettingsIcon />
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="w-full">
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Two-factor authentication</ItemTitle>
                    <ItemDescription className="text-pretty xl:hidden 2xl:block">
                      Verify via email or phone number.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="hidden md:flex">
                    <Button size="sm" variant="secondary">
                      Enable
                    </Button>
                  </ItemActions>
                </Item>
              </div>
              <Slider
                aria-label="Slider"
                className="flex-1"
                max={1000}
                min={0}
                onValueChange={handleSliderValueChange}
                step={10}
                value={sliderValue}
              />
              <FieldGroup>
                <Field>
                  <InputGroup>
                    <InputGroupInput aria-label="Name" placeholder="Name" />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <SearchIcon />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field className="flex-1">
                  <Textarea aria-label="Message" className="resize-none" placeholder="Message" />
                </Field>
              </FieldGroup>
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <Badge>Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <RadioGroup className="ml-auto flex w-fit gap-3" defaultValue="apple">
                  <RadioGroupItem aria-label="Apple" value="apple" />
                  <RadioGroupItem aria-label="Banana" value="banana" />
                </RadioGroup>
                <div className="flex gap-3">
                  <Checkbox aria-label="Enabled" defaultChecked />
                  <Checkbox aria-label="Disabled" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="outline" />}>
                    <span className="hidden md:block">Alert Dialog</span>
                    <span className="block md:hidden">Dialog</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Do you want to allow the USB accessory to connect to this device and your data?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                      <AlertDialogAction>Allow</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <ButtonGroup>
                  <Button variant="outline">Button Group</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button aria-label="Open quick actions" size="icon" variant="outline" />}
                    >
                      <ChevronUpIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit" side="top">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                        <DropdownMenuItem>Block User</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                        <DropdownMenuItem>Share Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Report Conversation</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive">Delete Conversation</DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
                <Switch aria-label="Enable setting" className="ml-auto" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { DemoFeature as Component }
