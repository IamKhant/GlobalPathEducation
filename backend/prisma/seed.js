require('dotenv/config');

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const extraPrograms = [
  {
    title: 'Bachelor of Information Technology',
    institution: 'RMIT University',
    city: 'Melbourne',
    stateProvince: 'Victoria',
    country: 'Australia',
    type: 'Bachelor',
    durationMonths: 36,
    tuitionFee: 42240,
    currency: 'AUD',
    feeBasis: 'annual',
    language: 'English',
    specialization: 'Software Development, Cybersecurity, Cloud Computing, Data Analytics, Web Development',
    websiteUrl: 'https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-information-technology-bp162',
    description: 'Undergraduate IT degree focused on practical computing skills, software development, and industry-ready technology foundations.',
  },
  {
    title: 'Bachelor of Computer Science',
    institution: 'University of Wollongong',
    city: 'Wollongong',
    stateProvince: 'New South Wales',
    country: 'Australia',
    type: 'Bachelor',
    durationMonths: 36,
    tuitionFee: 38304,
    currency: 'AUD',
    feeBasis: 'annual',
    language: 'English',
    specialization: 'Algorithms, Artificial Intelligence, Cybersecurity, Software Engineering, Big Data',
    websiteUrl: 'https://www.uow.edu.au/study/courses/bachelor-of-computer-science/',
    description: 'Computer science bachelor program covering programming, systems, data, and advanced computing areas.',
  },
  {
    title: 'Bachelor of Software Engineering',
    institution: 'University of Waikato',
    city: 'Hamilton',
    stateProvince: 'Waikato',
    country: 'New Zealand',
    type: 'Bachelor',
    durationMonths: 48,
    tuitionFee: 38250,
    currency: 'NZD',
    feeBasis: 'annual',
    language: 'English',
    specialization: 'Software Engineering, Mobile Development, Testing, Cloud Systems, Project Management',
    websiteUrl: 'https://www.waikato.ac.nz/study/qualifications/bachelor-of-engineering-with-honours/software-engineering/',
    description: 'Undergraduate software engineering pathway with project-based learning and engineering foundations.',
  },
  {
    title: 'Bachelor of Science in Computer Science',
    institution: 'University of Limerick',
    city: 'Limerick',
    stateProvince: 'Munster',
    country: 'Ireland',
    type: 'Bachelor',
    durationMonths: 48,
    tuitionFee: 20542,
    currency: 'EUR',
    feeBasis: 'annual',
    language: 'English',
    specialization: 'Programming, Data Structures, Software Engineering, Networks, Databases',
    websiteUrl: 'https://www.ul.ie/courses/bachelor-science-computer-science',
    description: 'Four-year computer science degree covering programming, systems, software development, and applied computing skills.',
  },
  {
    title: 'Bachelor of Computer Science',
    institution: 'Constructor University',
    city: 'Bremen',
    stateProvince: 'Bremen',
    country: 'Germany',
    type: 'Bachelor',
    durationMonths: 36,
    tuitionFee: 20000,
    currency: 'EUR',
    feeBasis: 'annual',
    language: 'English',
    specialization: 'Computer Science, AI, Software Engineering, Data Science, Algorithms',
    websiteUrl: 'https://constructor.university/programs/undergraduate-education/computer-science-bsc',
    description: 'English-taught computer science bachelor program in Germany with software, data, and algorithmic foundations.',
  },
  {
    title: 'Diploma of Information Technology',
    institution: 'TAFE NSW',
    city: 'Sydney',
    stateProvince: 'New South Wales',
    country: 'Australia',
    type: 'Diploma',
    durationMonths: 12,
    tuitionFee: 16000,
    currency: 'AUD',
    feeBasis: 'total',
    language: 'English',
    specialization: 'Networking, Programming, Cybersecurity, Databases, Web Development',
    websiteUrl: 'https://www.tafensw.edu.au/course-areas/information-and-communication-technology/courses/diploma-of-information-technology--ICT50220-01',
    description: 'Practical diploma pathway for students building job-ready IT, networking, programming, and support skills.',
  },
  {
    title: 'Diploma of Software Development',
    institution: 'Holmesglen Institute',
    city: 'Melbourne',
    stateProvince: 'Victoria',
    country: 'Australia',
    type: 'Diploma',
    durationMonths: 12,
    tuitionFee: 14500,
    currency: 'AUD',
    feeBasis: 'total',
    language: 'English',
    specialization: 'Software Development, JavaScript, Databases, Mobile Apps, Web Applications',
    websiteUrl: 'https://www.holmesglen.edu.au/explore-courses/information-technology-and-cyber-security/software-development/',
    description: 'Hands-on diploma focused on software development fundamentals and applied programming projects.',
  },
  {
    title: 'New Zealand Diploma in Web Development and Design',
    institution: 'Whitecliffe',
    city: 'Auckland',
    stateProvince: 'Auckland',
    country: 'New Zealand',
    type: 'Diploma',
    durationMonths: 12,
    tuitionFee: 22000,
    currency: 'NZD',
    feeBasis: 'total',
    language: 'English',
    specialization: 'Web Development, UX Design, JavaScript, Responsive Design, Digital Media',
    websiteUrl: 'https://www.whitecliffe.ac.nz/technology/it-programmes/nz-diploma-in-web-development-and-design-level-5',
    description: 'Applied diploma for students interested in web development, interface design, and digital product foundations.',
  },
  {
    title: 'Diploma in Information Technology',
    institution: 'INTI International University',
    city: 'Nilai',
    stateProvince: 'Negeri Sembilan',
    country: 'Malaysia',
    type: 'Diploma',
    durationMonths: 24,
    tuitionFee: 36560,
    currency: 'MYR',
    feeBasis: 'total',
    language: 'English',
    specialization: 'Programming, Systems Analysis, Databases, Networking, Web Development',
    websiteUrl: 'https://newinti.edu.my/programme/diploma-in-information-technology/',
    description: 'Diploma pathway covering practical IT fundamentals and progression options toward undergraduate technology study.',
  },
  {
    title: 'Diploma in Information Technology',
    institution: 'Asia Pacific University',
    city: 'Kuala Lumpur',
    stateProvince: 'Kuala Lumpur',
    country: 'Malaysia',
    type: 'Diploma',
    durationMonths: 24,
    tuitionFee: 43800,
    currency: 'MYR',
    feeBasis: 'total',
    language: 'English',
    specialization: 'Software Development, Databases, Networking, Multimedia, Information Systems',
    websiteUrl: 'https://www.apu.edu.my/our-courses/pre-university-studies/diploma-programmes/diploma-information-technology',
    description: 'Technology diploma focused on programming, database skills, systems fundamentals, and progression into computing degrees.',
  },
];

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

  await prisma.program.createMany({
    data: extraPrograms,
  });

  console.log(`Seeded ${records.length + extraPrograms.length} programs successfully.`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { extraPrograms };
