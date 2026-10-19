const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const suggestions = [
  "Sample",
  "shirt",
  "pant",
  "shorts",
  "polo shirt",
  "T-shirt",
  "jacket",
  "hoddi",
  "hoddi jacket",
  "trim card",
  "shead band",
  "swatch",
  "fabric",
  "lab deep",
  "rib",
  "twil tape",
  "size sticker",
  "jeep sticker",
  "label sticker",
  "tag",
  "elastic",
  "drocoat",
  "chemical"
];

async function main() {
  console.log('Seeding database...');

  // Seed Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'System Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user ready:', admin.username);

  // Seed Normal user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      name: 'Standard Staff',
      passwordHash: userPassword,
      role: 'USER',
    },
  });
  console.log('Standard user ready:', user.username);

  // Seed the 23 Particular Suggestions
  for (let i = 0; i < suggestions.length; i++) {
    const item = suggestions[i];
    await prisma.particularSuggestion.upsert({
      where: { name: item },
      update: { order: i + 1 },
      create: {
        name: item,
        order: i + 1,
      },
    });
  }
  console.log(`Seeded ${suggestions.length} particular suggestions.`);

  // Seed a sample Challan if none exist
  const existingChallanCount = await prisma.challan.count();
  if (existingChallanCount === 0) {
    const sampleChallan = await prisma.challan.create({
      data: {
        challanNo: 'ASI-2087',
        name: 'Mr.Tutul',
        address: 'Mouchak knitting',
        refNo: 'ASI-501',
        fromName: 'Ms.Shamoly',
        isReturnable: true,
        senderSign: 'Srabon (01774-109199)',
        totalQty: 1,
        totalYdsKg: 0.0,
        notes: '1) Receive the above goods in good condition.',
        createdById: admin.id,
        items: {
          create: [
            {
              slNo: 1,
              particular: 'Orginal Sample (Polo Shirt)',
              qty: 1,
              unit: 'Pcs',
              ydsKg: 0.0,
              ydsUnit: 'yds',
            },
          ],
        },
      },
    });
    console.log('Sample Challan created:', sampleChallan.challanNo);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
