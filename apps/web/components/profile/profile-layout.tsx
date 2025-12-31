import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

interface ProfileLayoutProps {
  isSubscribed: boolean;
  role: 'player' | 'coach';
  currentPeriodEnd: string | null;
  children: React.ReactNode;
}

export function ProfileLayout({ isSubscribed, role, currentPeriodEnd, children }: ProfileLayoutProps) {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-semibold text-slate-900 dark:text-white mb-1'>
              Your Profile
            </h1>
            <p className='text-slate-600 dark:text-slate-400 text-sm'>
              This is how programs, coaches, and other players see your profile
            </p>
          </div>
          <Link href='/profile/edit'>
            <Button variant='outline' className='cursor-pointer'>
              Edit Profile
            </Button>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
