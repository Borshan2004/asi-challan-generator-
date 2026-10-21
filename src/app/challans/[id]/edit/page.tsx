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

  // Both ADMIN and USER can edit challans

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
