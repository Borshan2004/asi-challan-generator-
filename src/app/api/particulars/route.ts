import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const suggestions = await prisma.particularSuggestion.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Particular name is required' }, { status: 400 });
    }

    const count = await prisma.particularSuggestion.count();
    const created = await prisma.particularSuggestion.upsert({
      where: { name: name.trim() },
      update: {},
      create: {
        name: name.trim(),
        order: count + 1,
      },
    });

    return NextResponse.json({ suggestion: created });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
  }
}
