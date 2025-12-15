'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { useColleges } from '@/contexts/colleges-provider'
import { cn } from '@workspace/ui/lib/utils'

interface CollegeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function CollegeCombobox({
  value = '',
  onValueChange,
  placeholder = 'Select college...',
  disabled = false,
  required = false,
}: CollegeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { colleges, isLoading, fetchColleges } = useColleges()

  const selectedCollege = React.useMemo(
    () => colleges.find(
      (college) => college.school.toLowerCase() === value.toLowerCase(),
    ),
    [colleges, value]
  )

  // Lazy load colleges when popover is first opened
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && colleges.length === 0 && !isLoading) {
      fetchColleges()
    }
  }, [colleges.length, isLoading, fetchColleges])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            'Loading colleges...'
          ) : selectedCollege ? (
            <span className='truncate'>
              {selectedCollege.school}
              <span className='text-muted-foreground ml-2 text-xs'>
                ({selectedCollege.state})
              </span>
            </span>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search colleges...' />
          <CommandList>
            <CommandEmpty>No college found.</CommandEmpty>
            <CommandGroup>
              {colleges.map((college) => (
                <CommandItem
                  key={college.id}
                  value={college.school}
                  onSelect={(currentValue) => {
                    onValueChange(
                      currentValue.toLowerCase() === value.toLowerCase()
                        ? ''
                        : college.school,
                    )
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.toLowerCase() === college.school.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <div className='flex flex-col'>
                    <span className='font-medium'>{college.school}</span>
                    <span className='text-xs text-muted-foreground'>
                      {college.state} • {college.division.toUpperCase()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
