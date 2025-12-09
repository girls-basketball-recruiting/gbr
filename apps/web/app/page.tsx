import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="min-h-svh">
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton><Button size="sm" variant="outline">Sign In</Button></SignInButton>
          <SignUpButton><Button size="sm">Sign Up</Button></SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Girls Basketball Recruiting Database</h1>
          <p>Helping student-athletes connect with college coaches</p>
        </div>
      </div>
    </div>
  )
}
