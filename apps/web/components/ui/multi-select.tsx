'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import { Checkbox } from '@workspace/ui/components/checkbox'

export interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items',
  className,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found.',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  // const handleClear = (e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   onChange([])
  // }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className='hover:bg-white'>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            className
          )}
        >
          <div className='flex gap-1 flex-wrap'>
            {selected.length === 0 ? (
              <span className='text-muted-foreground'>{placeholder}</span>
            ) : selected.length === 1 ? (
              <span>{selectedOptions[0]?.label}</span>
            ) : (
              <span>
                {selected.length} selected
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Checkbox checked={isSelected} />
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
