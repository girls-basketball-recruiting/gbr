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
import { hash } from 'ohash'
import type { College } from '@/payload-types'

interface CollegeComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  onSelect?: (college: College | null) => void
  placeholder?: string
  disabled?: boolean
}

const RESULT_LIMIT = 50 // Limit visible results for performance

export function CollegeCombobox({
  value = '',
  onValueChange,
  onSelect,
  placeholder = 'Select college...',
  disabled = false,
}: CollegeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const { colleges, isLoading, searchColleges, enableFetch } = useColleges()

  // Trigger lazy fetch when this component mounts
  React.useEffect(() => {
    enableFetch()
  }, [enableFetch])

  // Debounced search query (300ms)
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Hash values for memoization
  const debouncedQueryHash = React.useMemo(() => hash(debouncedQuery), [debouncedQuery])
  const collegesHash = React.useMemo(() => hash(colleges), [colleges])

  // Memoized filtered colleges with result limit
  const filteredColleges = React.useMemo(() => {
    const results = searchColleges(debouncedQuery)
    return results.slice(0, RESULT_LIMIT)
    // Using hash for deep equality
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQueryHash, collegesHash, searchColleges])

  const selectedCollege = React.useMemo(
    () =>
      colleges.find(
        college => college.school.toLowerCase() === value.toLowerCase()
      ),
    // Using hash for deep equality
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collegesHash, colleges, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className='w-100 p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search colleges...'
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery ? 'No college found.' : 'Start typing to search...'}
            </CommandEmpty>
            <CommandGroup>
              {filteredColleges.map(college => (
                <CommandItem
                  key={college.id}
                  value={college.school}
                  onSelect={currentValue => {
                    const isDeselecting =
                      currentValue.toLowerCase() === value.toLowerCase()

                    // Call legacy onValueChange if provided
                    if (onValueChange) {
                      onValueChange(isDeselecting ? '' : college.school)
                    }

                    // Call new onSelect with full college object
                    if (onSelect) {
                      onSelect(isDeselecting ? null : college)
                    }

                    setOpen(false)
                    setSearchQuery('') // Reset search on selection
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.toLowerCase() === college.school.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
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
