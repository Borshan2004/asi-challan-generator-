import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ChallanPrintPreview from '@/components/ChallanPrintPreview';

export default async function ChallanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
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
    <ChallanPrintPreview
      challan={challan}
      currentUserRole={session.role}
    />
  );
}
