import { CheckIcon } from './CheckIcon'

interface FeatureListProps {
  items: string[]
  iconColor: string
}

export function FeatureList({ items, iconColor }: FeatureListProps) {
  return (
    <ul className='text-left space-y-2'>
      {items.map((item, index) => (
        <li key={index} className='flex items-start'>
          <CheckIcon className={`w-5 h-5 ${iconColor} mr-2 mt-0.5 shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  )
}
