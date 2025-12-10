import { CheckIcon } from './CheckIcon'

interface FeatureListProps {
  items: string[]
  iconColor?: string
}

export function FeatureList({ items, iconColor = 'text-slate-500' }: FeatureListProps) {
  return (
    <ul className='text-left space-y-2 text-slate-400'>
      {items.map((item, index) => (
        <li key={index} className='flex items-start'>
          <CheckIcon className={`w-5 h-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  )
}
