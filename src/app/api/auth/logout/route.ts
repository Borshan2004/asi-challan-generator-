import { NextResponse } from 'next/server';
import { removeSession } from '@/lib/auth';

export async function POST() {
  await removeSession();
  return NextResponse.json({ success: true });
}
