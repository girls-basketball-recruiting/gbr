import { MutedText } from './ui/typography/MutedText'

export function AuthenticatedFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='py-6 px-4 mt-auto'>
      <div className='text-center text-sm'>
        <MutedText className='text-sm'>
          © {currentYear} Girls Basketball Recruiting. All rights reserved.
        </MutedText>
      </div>
    </footer>
  )
}
