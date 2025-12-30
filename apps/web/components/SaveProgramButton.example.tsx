/**
 * SaveProgramButton - Usage Examples
 *
 * This file demonstrates how to use the SaveProgramButton component
 * in various scenarios.
 */

import { SaveProgramButton } from './SaveProgramButton'
import { isProgramSaved } from '@/actions/player-program-actions'

/**
 * Example 1: Basic usage on a college program page
 * - Checks if program is already saved
 * - Shows button with default styling
 */
export async function CollegeProgramPage({ collegeId }: { collegeId: number }) {
  const saved = await isProgramSaved(collegeId)

  return (
    <div>
      <h1>Duke University</h1>
      <SaveProgramButton
        collegeId={collegeId}
        collegeName="Duke University"
        initialIsSaved={saved}
      />
    </div>
  )
}

/**
 * Example 2: Small button variant (no text, icon only)
 * - Good for tight spaces, cards, or lists
 */
export async function CollegeProgramCard({
  collegeId,
  collegeName
}: {
  collegeId: number
  collegeName: string
}) {
  const saved = await isProgramSaved(collegeId)

  return (
    <div className="card">
      <h3>{collegeName}</h3>
      <SaveProgramButton
        collegeId={collegeId}
        collegeName={collegeName}
        initialIsSaved={saved}
        size="sm"
      />
    </div>
  )
}

/**
 * Example 3: Custom styling with className
 */
export async function CustomStyledButton({
  collegeId,
  collegeName
}: {
  collegeId: number
  collegeName: string
}) {
  const saved = await isProgramSaved(collegeId)

  return (
    <SaveProgramButton
      collegeId={collegeId}
      collegeName={collegeName}
      initialIsSaved={saved}
      className="w-full justify-center"
      size="lg"
    />
  )
}

/**
 * Example 4: In a program listing/table
 */
export async function ProgramsTable({
  programs
}: {
  programs: Array<{ id: number; name: string }>
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Program</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {programs.map(async (program) => {
          const saved = await isProgramSaved(program.id)

          return (
            <tr key={program.id}>
              <td>{program.name}</td>
              <td>
                <SaveProgramButton
                  collegeId={program.id}
                  collegeName={program.name}
                  initialIsSaved={saved}
                  size="sm"
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/**
 * Example 5: With default variant (filled background)
 */
export async function ProgramHero({
  collegeId,
  collegeName
}: {
  collegeId: number
  collegeName: string
}) {
  const saved = await isProgramSaved(collegeId)

  return (
    <div className="hero">
      <h1>{collegeName}</h1>
      <div className="actions">
        <SaveProgramButton
          collegeId={collegeId}
          collegeName={collegeName}
          initialIsSaved={saved}
          variant="default"
        />
      </div>
    </div>
  )
}

/**
 * Example 6: Client-side usage without initial check
 * - When you don't need to pre-check saved status
 * - Button will start in unsaved state
 */
export function ClientSideUsage({
  collegeId,
  collegeName
}: {
  collegeId: number
  collegeName: string
}) {
  return (
    <SaveProgramButton
      collegeId={collegeId}
      collegeName={collegeName}
      // initialIsSaved defaults to false
    />
  )
}
