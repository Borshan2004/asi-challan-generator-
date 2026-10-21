import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, username: true },
        },
        items: {
          orderBy: { slNo: 'asc' },
        },
      },
    });

    if (!challan) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    return NextResponse.json({ challan });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch challan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Both ADMIN and USER can edit challans

    const body = await request.json();
    const {
      name,
      address,
      refNo,
      fromName = 'Ms.Shamoly',
      isReturnable = true,
      senderSign = 'Srabon (01774-109199)',
      notes = '1) Receive the above goods in good condition.',
      items = [],
    } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and Address are required' }, { status: 400 });
    }

    // Calculate totals on server
    let totalQty = 0;
    let totalYdsKg = 0;

    const formattedItems = items
      .filter((item: any) => item.particular && item.particular.trim() !== '')
      .map((item: any, idx: number) => {
        const qty = parseInt(item.qty, 10) || 0;
        const ydsKg = parseFloat(item.ydsKg) || 0.0;
        totalQty += qty;
        totalYdsKg += ydsKg;

        return {
          slNo: idx + 1,
          particular: item.particular.trim(),
          qty: qty,
          unit: item.unit || 'Pcs',
          ydsKg: ydsKg,
          ydsUnit: item.ydsUnit || 'yds',
        };
      });

    // Delete existing items and recreate to maintain sequence
    await prisma.challanItem.deleteMany({
      where: { challanId: params.id },
    });

    const updated = await prisma.challan.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        address: address.trim(),
        refNo: refNo ? refNo.trim() : null,
        fromName: fromName.trim(),
        isReturnable: Boolean(isReturnable),
        senderSign: senderSign.trim(),
        notes: notes.trim(),
        totalQty,
        totalYdsKg: Math.round(totalYdsKg * 100) / 100,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: {
          orderBy: { slNo: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, challan: updated });
  } catch (err: any) {
    console.error('Update challan error:', err);
    return NextResponse.json({ error: 'Failed to update challan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await prisma.challan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Challan deleted successfully' });
  } catch (err: any) {
    console.error('Delete challan error:', err);
    return NextResponse.json({ error: 'Failed to delete challan' }, { status: 500 });
  }
}
