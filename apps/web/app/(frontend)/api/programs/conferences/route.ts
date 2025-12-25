import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { sql } from 'drizzle-orm'

/**
 * Get unique conferences from colleges
 */
export const GET = handleApiError(async () => {
  const { db, tables } = await getDb()

  // Get distinct conferences ordered alphabetically
  const result = await db
    .selectDistinct({ conference: tables.colleges.conference })
    .from(tables.colleges)
    .where(sql`${tables.colleges.conference} IS NOT NULL AND ${tables.colleges.conference} != ''`)
    .orderBy(tables.colleges.conference)

  const conferences = result.map(row => ({
    value: row.conference,
    label: row.conference,
  }))

  return apiSuccess({ conferences })
})
