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
import { Badge } from '@workspace/ui/components/badge'
import { Users, CalendarCheck2Icon } from 'lucide-react'
import { formatDateLocationRange } from '@/lib/format-date-location'
import type { Tournament } from '@/payload-types'

interface TournamentsTableProps {
  tournaments: (Tournament & { attendeeCount?: number })[]
  attendingIds?: number[]
  isAuthenticated?: boolean
}

export function TournamentsTable({
  tournaments,
  attendingIds = [],
  isAuthenticated = false,
}: TournamentsTableProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isUpcoming = (endDate: string) => {
    const end = new Date(endDate)
    return end >= today
  }

  const columns: ColumnDef<Tournament & { attendeeCount?: number }>[] = [
    {
      accessorKey: 'name',
      header: 'Tournament',
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        const upcoming = isUpcoming(row.original.endDate)
        const isAttending = attendingIds.includes(row.original.id)
        return (
          <div className='flex items-center gap-2'>
            <Link
              href={`/tournaments/${row.original.id}`}
              className='font-medium text-blue-600 dark:text-blue-400 hover:underline'
            >
              {name}
            </Link>
            {isAttending && (
              <Badge variant='outline' className='text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30'>
                <CalendarCheck2Icon className='w-3 h-3 mr-1' />
                Attending
              </Badge>
            )}
            {!upcoming && (
              <Badge variant='secondary' className='text-xs'>
                Past
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'dates',
      header: 'Date & Location',
      cell: ({ row }) => {
        return (
          <span className='text-slate-600 dark:text-slate-400'>
            {formatDateLocationRange(
              row.original.startDate.toString(),
              row.original.endDate.toString(),
              row.original.city,
              row.original.state
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ row }) => {
        const state = row.getValue('state') as string
        return (
          <span className='text-slate-600 dark:text-slate-400'>{state}</span>
        )
      },
    },
    // Only show attendee count for authenticated users
    ...(isAuthenticated
      ? [
          {
            accessorKey: 'attendeeCount',
            header: 'Players',
            cell: ({ row }: { row: any }) => {
              const count = row.getValue('attendeeCount') as number
              return (
                <div className='flex items-center gap-1.5 text-slate-600 dark:text-slate-400'>
                  <Users className='w-4 h-4' />
                  <span>{count ?? 0}</span>
                </div>
              )
            },
          },
        ]
      : []),
  ]

  const table = useReactTable({
    data: tournaments,
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
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const upcoming = isUpcoming(row.original.endDate)
              const isAttending = attendingIds.includes(row.original.id)
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    isAttending
                      ? 'bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500 hover:bg-green-100 dark:hover:bg-green-950/40'
                      : !upcoming
                        ? 'opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No tournaments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
