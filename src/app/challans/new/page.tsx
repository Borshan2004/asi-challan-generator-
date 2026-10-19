import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ChallanForm from '@/components/ChallanForm';

export default async function NewChallanPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded-lg border border-amber-200 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-2">
          Your account has <strong>View & Download Only</strong> permissions.
          Only administrators can create or edit Challans.
        </p>
        <div className="mt-4">
          <a
            href="/challans"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold"
          >
            Return to All Challans
          </a>
        </div>
      </div>
    );
  }

  return <ChallanForm />;
}
