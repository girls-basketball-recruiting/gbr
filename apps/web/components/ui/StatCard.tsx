import { Card } from '@workspace/ui/components/card'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
      <div className='text-center'>
        <p className='text-slate-600 dark:text-slate-400 text-sm mb-2'>{label}</p>
        <p className='text-4xl font-bold text-slate-900 dark:text-white'>{value}</p>
      </div>
    </Card>
  )
}
