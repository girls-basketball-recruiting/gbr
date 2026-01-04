'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'
import { SaveProgramButton } from './SaveProgramButton'

interface ProgramsTableProps {
  programs: any[]
  savedProgramIds?: Set<number>
  isPlayer?: boolean
}

export function ProgramsTable({ programs, savedProgramIds = new Set(), isPlayer = false }: ProgramsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'school',
      header: 'School',
      cell: ({ row }) => {
        const school = row.getValue('school') as string
        const hasCoach = row.original.hasCoach
        return (
          <div className='flex items-center gap-2'>
            <Link
              href={`/programs/${row.original.id}`}
              className='font-medium text-primary hover:underline'
            >
              {school}
            </Link>
            {hasCoach && (
              <BadgeCheck className='w-4 h-4' />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'division',
      header: 'Division',
      cell: ({ row }) => {
        const division = row.getValue('division') as string
        return (
          <span>
            {divisionLabels[division] || division}
          </span>
        )
      },
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const city = row.original.city
        const state = row.original.state
        return (
          <span>
            {city}, {state}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <span className='capitalize'>
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'conference',
      header: 'Conference',
      cell: ({ row }) => {
        const conference = row.getValue('conference') as string
        return conference ? (
          <span>{conference}</span>
        ) : null
      },
    },
  ]

  // Add actions column only for players
  if (isPlayer) {
    columns.push({
      id: 'actions',
      header: 'Save',
      cell: ({ row }) => {
        const program = row.original
        const isSaved = savedProgramIds.has(program.id)
        return (
          <SaveProgramButton
            collegeId={program.id}
            collegeName={program.school}
            initialIsSaved={isSaved}
            size="sm"
            variant="outline"
          />
        )
      },
    })
  }

  const table = useReactTable({
    data: programs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='w-full max-w-full rounded-md border overflow-x-scroll'>
      <Table className='w-full'>
        <TableHeader className='pointer-events-none'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No programs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
