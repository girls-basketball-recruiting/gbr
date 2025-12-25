import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
// import { Media } from './collections/Media'
import { Players } from './collections/Players'
import { Coaches } from './collections/Coaches'
import { CoachPlayerNotes } from './collections/CoachPlayerNotes'
import { CoachSavedPlayers } from './collections/CoachSavedPlayers'
import { Tournaments } from './collections/Tournaments'
import { CoachProspects } from './collections/CoachProspects'
import { Colleges } from './collections/Colleges'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    // Media,
    Players,
    Coaches,
    Colleges,
    CoachPlayerNotes,
    CoachProspects,
    CoachSavedPlayers,
    Tournaments,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  sharp,
  plugins: [
    mcpPlugin({
      collections: {
        coaches: {
          enabled: true,
        },
        'coach-player-notes': {
          enabled: true,
        },
        'coach-prospects': {
          enabled: true,
        },
        'coach-saved-players': {
          enabled: true,
        },
        colleges: {
          enabled: true,
        },
        players: {
          enabled: true,
        },
        tournaments: {
          enabled: true,
        },
        users: {
          enabled: true,
        },
      },
    }),
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})