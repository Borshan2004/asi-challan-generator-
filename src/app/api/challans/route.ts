import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateUniqueChallanNo, getCurrentDhakaDate } from '@/lib/challan-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (search) {
      where.OR = [
        { challanNo: { contains: search } },
        { name: { contains: search } },
        { address: { contains: search } },
        { refNo: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const challans = await prisma.challan.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, username: true },
        },
        items: {
          orderBy: { slNo: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ challans });
  } catch (err: any) {
    console.error('Fetch challans error:', err);
    return NextResponse.json({ error: 'Failed to fetch challans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create challans' }, { status: 403 });
    }

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

    // Auto-generate random unique Challan No (ASI-XXXX)
    const challanNo = await generateUniqueChallanNo();

    // Auto-set Date from Server Clock (Asia/Dhaka) - strictly cannot be modified by client
    const date = getCurrentDhakaDate();

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

    const newChallan = await prisma.challan.create({
      data: {
        challanNo,
        name: name.trim(),
        address: address.trim(),
        refNo: refNo ? refNo.trim() : null,
        fromName: fromName.trim(),
        isReturnable: Boolean(isReturnable),
        senderSign: senderSign.trim(),
        date,
        totalQty,
        totalYdsKg: Math.round(totalYdsKg * 100) / 100,
        notes: notes.trim(),
        createdById: session.userId,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, challan: newChallan });
  } catch (err: any) {
    console.error('Create challan error:', err);
    return NextResponse.json({ error: 'Failed to create challan' }, { status: 500 });
  }
}
