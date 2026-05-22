require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { extraPrograms } = require('./seed');

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  let created = 0;
  let skipped = 0;

  for (const program of extraPrograms) {
    const existing = await prisma.program.findFirst({
      where: {
        title: program.title,
        institution: program.institution,
        country: program.country,
        type: program.type,
      },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.program.create({ data: program });
    created += 1;
  }

  console.log(`Added ${created} extra programs. Skipped ${skipped} existing programs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
