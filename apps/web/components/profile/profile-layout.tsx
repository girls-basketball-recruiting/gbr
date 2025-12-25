import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { SubscriptionCard } from '@/components/SubscriptionCard';

interface ProfileLayoutProps {
  isSubscribed: boolean;
  role: 'player' | 'coach';
  currentPeriodEnd: string | null;
  children: React.ReactNode;
}

export function ProfileLayout({ isSubscribed, role, currentPeriodEnd, children }: ProfileLayoutProps) {
  return (
    <div className='p-8'>
      <div className='max-w-5xl mx-auto'>
        {/* Edit Profile Button */}
        <div className='mb-4 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>My Profile</h1>
          <Link href='/profile/edit'>
            <Button variant='outline'>
              Edit Profile
            </Button>
          </Link>
        </div>

        <SubscriptionCard
          isSubscribed={isSubscribed}
          role={role}
          currentPeriodEnd={currentPeriodEnd}
        />

        {children}
      </div>
    </div>
  );
}
