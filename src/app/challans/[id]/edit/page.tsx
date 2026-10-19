import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ChallanForm from '@/components/ChallanForm';

export default async function EditChallanPage({
  params,
}: {
  params: { id: string };
}) {
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
          Only administrators can edit Challans.
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

  const challan = await prisma.challan.findUnique({
    where: { id: params.id },
    include: {
      items: {
        orderBy: { slNo: 'asc' },
      },
    },
  });

  if (!challan) {
    notFound();
  }

  return (
    <ChallanForm
      isEdit={true}
      initialData={{
        id: challan.id,
        challanNo: challan.challanNo,
        name: challan.name,
        address: challan.address,
        refNo: challan.refNo,
        fromName: challan.fromName,
        isReturnable: challan.isReturnable,
        senderSign: challan.senderSign,
        notes: challan.notes,
        date: challan.date,
        items: challan.items.map((i) => ({
          slNo: i.slNo,
          particular: i.particular,
          qty: i.qty,
          unit: i.unit,
          ydsKg: i.ydsKg,
          ydsUnit: i.ydsUnit,
        })),
      }}
    />
  );
}
