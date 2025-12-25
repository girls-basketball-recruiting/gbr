import { Suspense } from 'react'
import { ProfileView } from './ProfileView'
import { PageLoadingState } from '@/components/PageLoadingState'

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoadingState message='Loading profile...' />}>
      <ProfileView />
    </Suspense>
  )
}
