import { prisma } from './prisma';

/**
 * Generates a unique Challan number formatted as ASI-XXXX
 * Random 4-digit number between 1000 and 9999
 */
export async function generateUniqueChallanNo(): Promise<string> {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000 - 9999
    const candidate = `ASI-${randomNum}`;

    const exists = await prisma.challan.findUnique({
      where: { challanNo: candidate },
    });

    if (!exists) {
      return candidate;
    }
  }

  // Fallback with timestamp if random slots get full
  return `ASI-${Date.now().toString().slice(-4)}`;
}

/**
 * Formats a Date object into Asia/Dhaka display date (e.g. "19/Oct/26")
 */
export function formatChallanDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Format in Asia/Dhaka timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });

  const parts = formatter.formatToParts(d);
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const month = parts.find((p) => p.type === 'month')?.value || 'Jan';
  const year = parts.find((p) => p.type === 'year')?.value || '26';

  return `${day}/${month}/${year}`;
}

export function getCurrentDhakaDate(): Date {
  return new Date();
}
