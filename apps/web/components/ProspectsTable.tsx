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
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { CoachProspect } from '@/payload-types'

interface ProspectsTableProps {
  prospects: CoachProspect[]
}

export function ProspectsTable({ prospects }: ProspectsTableProps) {
  const columns: ColumnDef<CoachProspect>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.getValue('firstName') as string
        const lastName = row.original.lastName
        return (
          <Link
            href={`/prospects/${row.original.id}`}
            className='font-medium text-purple-600 dark:text-purple-400 hover:underline'
          >
            {firstName} {lastName}
          </Link>
        )
      },
    },
    {
      accessorKey: 'graduationYear',
      header: 'Class',
      cell: ({ row }) => {
        const year = row.getValue('graduationYear') as string
        return <span className='text-slate-600 dark:text-slate-400'>{year}</span>
      },
    },
    {
      accessorKey: 'primaryPosition',
      header: 'Position',
      cell: ({ row }) => {
        const position = row.getValue('primaryPosition') as string
        return position ? (
          <span className='text-slate-600 dark:text-slate-400'>
            {getPositionLabel(position)}
          </span>
        ) : null
      },
    },
    {
      accessorKey: 'heightInInches',
      header: 'Height',
      cell: ({ row }) => {
        const heightInInches = row.getValue('heightInInches') as number
        return heightInInches ? (
          <span className='text-slate-600 dark:text-slate-400'>{formatHeight(heightInInches)}</span>
        ) : null
      },
    },
    {
      accessorKey: 'highSchool',
      header: 'School',
      cell: ({ row }) => {
        const school = row.getValue('highSchool') as string
        return school ? (
          <span className='text-slate-600 dark:text-slate-400'>{school}</span>
        ) : null
      },
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const city = row.original.city
        const state = row.original.state
        if (!city && !state) return null
        return (
          <span className='text-slate-600 dark:text-slate-400'>
            {city}
            {city && state && ', '}
            {state}
          </span>
        )
      },
    },
    {
      accessorKey: 'weightedGpa',
      header: 'GPA',
      cell: ({ row }) => {
        const gpa = row.getValue('weightedGpa') as number
        return gpa ? (
          <span className='text-slate-600 dark:text-slate-400'>
            {gpa.toFixed(2)}
          </span>
        ) : null
      },
    },
  ]

  const table = useReactTable({
    data: prospects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='w-full border rounded-md overflow-hidden'>
      <Table>
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
                No prospects found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
