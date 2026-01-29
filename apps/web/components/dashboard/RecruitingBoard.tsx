'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { PlayerTableRow } from '@/components/ui/PlayerTableRow'
import { ProspectTableRow } from '@/components/ui/ProspectTableRow'
import { updateBoardOrder, type BoardOrderItem } from '@/actions/board-actions'
import type { Player, CoachProspect } from '@/payload-types'
import Link from 'next/link'
import { P } from '../ui/typography'

export type BoardItem = {
  type: 'prospect' | 'player'
  id: number
  data: Player | CoachProspect
}

interface RecruitingBoardProps {
  initialItems: BoardItem[]
  needsOrderSync: boolean
}

const INITIAL_VISIBLE_COUNT = 20
const LOAD_MORE_COUNT = 20

export function RecruitingBoard({ initialItems, needsOrderSync }: RecruitingBoardProps) {
  const [items, setItems] = useState<BoardItem[]>(initialItems)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [isSaving, setIsSaving] = useState(false)

  // Sync order to server if needed (migration handling)
  useEffect(() => {
    if (needsOrderSync && initialItems.length > 0) {
      const order: BoardOrderItem[] = initialItems.map((item) => ({
        type: item.type,
        id: item.id,
      }))
      updateBoardOrder(order).catch(console.error)
    }
  }, [needsOrderSync, initialItems])

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destIndex = result.destination.index

    if (sourceIndex === destIndex) return

    // Optimistic update
    const newItems = Array.from(items)
    const [removed] = newItems.splice(sourceIndex, 1)
    if (removed) newItems.splice(destIndex, 0, removed)
    setItems(newItems)

    // Save to server
    setIsSaving(true)
    try {
      const newOrder: BoardOrderItem[] = newItems.map((item) => ({
        type: item.type,
        id: item.id,
      }))
      await updateBoardOrder(newOrder)
    } catch (error) {
      console.error('Failed to save board order:', error)
      // Revert on error
      setItems(items)
    } finally {
      setIsSaving(false)
    }
  }, [items])

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, items.length))
  }

  const visibleItems = items.slice(0, visibleCount)
  const remainingCount = items.length - visibleCount

  if (items.length === 0) {
    return (
      <div className='rounded-lg bg-accent border border-accent-card p-8 text-center'>
        <P className='mb-4'>
          Your recruiting board is empty. Save a player or add a prospect to get started.
        </P>
        <div className='flex justify-center gap-3'>
          <Link
            href='/players'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4'
          >
            Find Players
          </Link>
          <Link
            href='/prospects/new'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4'
          >
            Add Prospect
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='relative'>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='recruiting-board'>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='rounded-lg border bg-card divide-y'
            >
              {visibleItems.map((item, index) => (
                <Draggable
                  key={`${item.type}-${item.id}`}
                  draggableId={`${item.type}-${item.id}`}
                  index={index}
                  isDragDisabled={isSaving}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group/row flex items-stretch transition-shadow ${
                        snapshot.isDragging
                          ? 'shadow-lg bg-background ring-2 ring-primary/20 rounded-lg z-50'
                          : ''
                      }`}
                      style={provided.draggableProps.style}
                    >
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-center w-8 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground transition-opacity ${
                          snapshot.isDragging
                            ? 'opacity-100'
                            : 'opacity-100 md:opacity-0 md:group-hover/row:opacity-100'
                        }`}
                      >
                        <GripVertical className='w-4 h-4' />
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        {item.type === 'player' ? (
                          <PlayerTableRow player={item.data as Player} />
                        ) : (
                          <ProspectTableRow prospect={item.data as CoachProspect} />
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Load More Button */}
      {remainingCount > 0 && (
        <div className='mt-4 text-center'>
          <Button
            variant='outline'
            onClick={handleLoadMore}
            className='w-full sm:w-auto'
          >
            Load more ({remainingCount} remaining)
          </Button>
        </div>
      )}

      {/* Item Count */}
      <div className='mt-3 text-sm text-muted-foreground text-center'>
        Showing {Math.min(visibleCount, items.length)} of {items.length} recruits
      </div>
    </div>
  )
}
