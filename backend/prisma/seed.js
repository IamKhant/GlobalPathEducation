require('dotenv/config');

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

function toInt(value) {
  if (!value || value.trim() === '') return null;
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
}

function toFloat(value) {
  if (!value || value.trim() === '') return null;
  const cleaned = value.replace(/,/g, '');
  const number = Number.parseFloat(cleaned);
  return Number.isNaN(number) ? null : number;
}

async function main() {
  const csvPath = path.join(__dirname, 'ProgramList.csv');

  if (!fs.existsSync(csvPath)) {
    throw new Error('ProgramList.csv not found inside backend/prisma folder');
  }

  const fileContent = fs.readFileSync(csvPath, 'utf8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  await prisma.program.deleteMany();

  for (const row of records) {
    await prisma.program.create({
      data: {
        title: row.title,
        institution: row.institution,
        city: row.city || null,
        stateProvince: row.state_province || null,
        country: row.country,
        type: row.type,
        durationMonths: toInt(row.duration_months),
        tuitionFee: toFloat(row.tuition_fee),
        currency: row.currency || null,
        feeBasis: row.fee_basis || null,
        language: row.language || null,
        specialization: row.specialization || null,
        websiteUrl: row.website_url || null,
        description: row.description || null,
        notes: row.notes || null,
      },
    });
  }

  console.log(`Seeded ${records.length} programs successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });