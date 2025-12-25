import { redirect } from 'next/navigation'
import { ProspectForm } from '@/components/ProspectForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { getAuthContext } from '@/lib/auth-context'

export default async function CreateProspectPage() {
  const { coachProfile } = await getAuthContext()

  if (!coachProfile) {
    redirect('/onboarding/coach')
  }

  return (
    <FormPageLayout
      title='Add New Prospect'
      description='Manually add a prospect to your recruiting board'
      maxWidth='md'
    >
      <ProspectForm coachId={coachProfile.id} />
    </FormPageLayout>
  )
}
