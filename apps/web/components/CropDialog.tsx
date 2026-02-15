'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Slider } from '@workspace/ui/components/slider'
import { ZoomIn, ZoomOut, Crop } from 'lucide-react'
import { cropImage } from '@/lib/crop-image'

interface CroppedAreaPixels {
  x: number
  y: number
  width: number
  height: number
}

interface CropDialogProps {
  open: boolean
  imageSrc: string
  aspect?: number
  onConfirm: (croppedBlob: Blob, previewUrl: string) => void
  onCancel: () => void
}

export function CropDialog({
  open,
  imageSrc,
  aspect = 1,
  onConfirm,
  onCancel,
}: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const onCropComplete = useCallback(
    (_croppedArea: unknown, pixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(pixels)
    },
    []
  )

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    try {
      const blob = await cropImage(imageSrc, croppedAreaPixels)
      const previewUrl = URL.createObjectURL(blob)
      onConfirm(blob, previewUrl)
    } catch {
      // Fall back to original if crop fails
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      onConfirm(blob, imageSrc)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className='sm:max-w-lg p-0 gap-0 overflow-hidden'>
        <DialogHeader className='px-5 pt-5 pb-3'>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <Crop className='w-4 h-4' />
            Crop Photo
          </DialogTitle>
        </DialogHeader>

        {/* Crop area */}
        <div className='relative w-full aspect-square bg-black/95'>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape='round'
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={1}
            maxZoom={3}
            objectFit='contain'
            style={{
              containerStyle: {
                borderRadius: 0,
              },
              cropAreaStyle: {
                border: '2px solid rgba(255,255,255,0.6)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        {/* Zoom control */}
        <div className='px-5 py-4 flex items-center gap-3'>
          <ZoomOut className='w-4 h-4 text-muted-foreground shrink-0' />
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={([value]) => value !== undefined && setZoom(value)}
            className='flex-1'
          />
          <ZoomIn className='w-4 h-4 text-muted-foreground shrink-0' />
        </div>

        <DialogFooter className='px-5 pb-5 pt-0'>
          <Button variant='outline' onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving || !croppedAreaPixels}>
            {isSaving ? 'Cropping...' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
