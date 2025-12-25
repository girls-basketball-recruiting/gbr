import { redirect } from 'next/navigation'

export default function SignOutPage() {
  // Immediately redirect to trigger sign out
  redirect('/api/auth/signout')
}
