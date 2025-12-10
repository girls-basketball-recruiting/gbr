import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

import { getPayloadUser } from '@/lib/getPayloadUser'
import { syncClerkUser } from '@/lib/syncClerkUser'

export default async function PayloadUserInfo() {
  const clerkUser = await currentUser()

  // Sync the user to PayloadCMS if they don't exist yet
  const payloadUser = clerkUser ? await syncClerkUser() : null

  const { payloadConfig } = await getPayloadUser()

  return (
    <>
      {clerkUser && (
        <div className='space-y-2'>
          <h1 className='text-xl'>
            Welcome back,{' '}
            {clerkUser.firstName || clerkUser.emailAddresses?.[0]?.emailAddress}
          </h1>
          {payloadUser && (
            <div className='text-sm text-muted-foreground'>
              <p>Roles: {payloadUser.roles?.join(', ')}</p>
              <p>PayloadCMS User ID: {payloadUser.id}</p>
              <a
                href='https://payloadcms.com/docs'
                rel='noopener noreferrer'
                target='_blank'
                className='text-blue-500 hover:underline'
              >
                PayloadCMS Documentation
              </a>
            </div>
          )}
        </div>
      )}
      <div className='flex gap-4 mt-4'>
        {payloadUser?.roles?.includes('admin') && (
          <a
            href={payloadConfig?.routes.admin}
            rel='noopener noreferrer'
            target='_blank'
            className='text-blue-500 hover:underline'
          >
            Go to admin panel
          </a>
        )}
      </div>
    </>
  )
}
