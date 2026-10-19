import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChallanExcel } from '@/lib/excel-export';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { slNo: 'asc' },
        },
      },
    });

    if (!challan) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    const buffer = await generateChallanExcel({
      challanNo: challan.challanNo,
      name: challan.name,
      address: challan.address,
      refNo: challan.refNo,
      fromName: challan.fromName,
      isReturnable: challan.isReturnable,
      senderSign: challan.senderSign,
      date: challan.date,
      totalQty: challan.totalQty,
      totalYdsKg: challan.totalYdsKg,
      notes: challan.notes,
      items: challan.items.map((i) => ({
        slNo: i.slNo,
        particular: i.particular,
        qty: i.qty,
        unit: i.unit,
        ydsKg: i.ydsKg,
        ydsUnit: i.ydsUnit,
      })),
    });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CHALLAN-${challan.challanNo}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error('Excel download error:', err);
    return NextResponse.json({ error: 'Failed to generate Excel' }, { status: 500 });
  }
}
