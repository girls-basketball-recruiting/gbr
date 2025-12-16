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

interface ProgramsTableProps {
  programs: any[]
}

const divisionLabels: Record<string, string> = {
  d1: 'NCAA D1',
  d2: 'NCAA D2',
  d3: 'NCAA D3',
  naia: 'NAIA',
  juco: 'JUCO',
  other: 'Other',
}

export function ProgramsTable({ programs }: ProgramsTableProps) {
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
              className='font-medium text-blue-600 dark:text-blue-400 hover:underline'
            >
              {school}
            </Link>
            {hasCoach && (
              <BadgeCheck className='w-4 h-4 text-blue-500 dark:text-blue-400' />
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
          <span className='text-slate-600 dark:text-slate-400'>
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
          <span className='text-slate-600 dark:text-slate-400'>
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
          <span className='text-slate-600 dark:text-slate-400 capitalize'>
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
          <span className='text-slate-600 dark:text-slate-400'>{conference}</span>
        ) : null
      },
    },
  ]

  const table = useReactTable({
    data: programs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'>
      <Table>
        <TableHeader>
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
                className='hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
