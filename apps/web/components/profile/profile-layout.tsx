import { Alert, AlertTitle } from '@workspace/ui/components/alert'
import { Globe2Icon } from 'lucide-react'
import Link from 'next/link'

interface ProfileLayoutProps {
  role: 'player' | 'coach'
  children: React.ReactNode
}

export function ProfileLayout({ role, children }: ProfileLayoutProps) {
  return (
    <div className='max-w-4xl mx-auto'>
      <Alert className='mb-4'>
        <Globe2Icon />
        <AlertTitle className='flex flex-col xs:flex-row justify-between items-center gap-3'>
          {role === 'player' ? (
            <span>This is how programs, coaches, and other players see your profile.</span>
          ) : (
            <span>This is how players and other coaches see your profile.</span>
          )}
          <Link href='/profile/edit' className='text-primary hover:underline min-w-22'>Edit Profile &rarr;</Link>
        </AlertTitle>
      </Alert>

      {children}
    </div>
  )
}
