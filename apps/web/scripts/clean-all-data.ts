/**
 * Script to clean all user data from the database
 * This will remove all users, coaches, players, prospects, saved players, and notes
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { getPayload } from 'payload'
import config from '../payload.config'

async function cleanAllData() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('Starting data cleanup...\n')

  // Delete all saved players
  console.log('Deleting saved players...')
  const savedPlayers = await payload.find({
    collection: 'saved-players',
    limit: 1000,
  })
  for (const sp of savedPlayers.docs) {
    await payload.delete({ collection: 'saved-players', id: sp.id })
  }
  console.log(`✓ Deleted ${savedPlayers.docs.length} saved players\n`)

  // Delete all coach player notes
  console.log('Deleting coach player notes...')
  const notes = await payload.find({
    collection: 'coach-player-notes',
    limit: 1000,
  })
  for (const note of notes.docs) {
    await payload.delete({ collection: 'coach-player-notes', id: note.id })
  }
  console.log(`✓ Deleted ${notes.docs.length} notes\n`)

  // Delete all prospects
  console.log('Deleting prospects...')
  const prospects = await payload.find({
    collection: 'prospects',
    limit: 1000,
  })
  for (const prospect of prospects.docs) {
    await payload.delete({ collection: 'prospects', id: prospect.id })
  }
  console.log(`✓ Deleted ${prospects.docs.length} prospects\n`)

  // Delete all coaches
  console.log('Deleting coaches...')
  const coaches = await payload.find({
    collection: 'coaches',
    limit: 1000,
  })
  for (const coach of coaches.docs) {
    await payload.delete({ collection: 'coaches', id: coach.id })
  }
  console.log(`✓ Deleted ${coaches.docs.length} coaches\n`)

  // Delete all players
  console.log('Deleting players...')
  const players = await payload.find({
    collection: 'players',
    limit: 1000,
  })
  for (const player of players.docs) {
    await payload.delete({ collection: 'players', id: player.id })
  }
  console.log(`✓ Deleted ${players.docs.length} players\n`)

  // Delete all users (except admins)
  console.log('Deleting users (keeping admins)...')
  const users = await payload.find({
    collection: 'users',
    limit: 1000,
  })
  let deletedUsers = 0
  for (const user of users.docs) {
    // Skip admin users
    if (user.roles?.includes('admin')) {
      console.log(`  Skipping admin user: ${user.email}`)
      continue
    }
    await payload.delete({ collection: 'users', id: user.id })
    deletedUsers++
  }
  console.log(`✓ Deleted ${deletedUsers} users\n`)

  console.log('Database cleanup complete!')
  console.log('\nDon\'t forget to also delete users from Clerk dashboard:')
  console.log('https://dashboard.clerk.com/')

  process.exit(0)
}

cleanAllData().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
