import { Suspense } from 'react'
import { ProfileEditContent } from './ProfileEditContent'
import { PageLoadingState } from '@/components/PageLoadingState'

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<PageLoadingState message='Loading profile...' />}>
      <ProfileEditContent />
    </Suspense>
  )
}
