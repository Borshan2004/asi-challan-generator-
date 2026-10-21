import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ChallanForm from '@/components/ChallanForm';

export default async function NewChallanPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Both ADMIN and USER can create challans

  return <ChallanForm />;
}
