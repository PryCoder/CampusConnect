import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const colleges = [
  { name: 'KJ Somaiya College of Engineering', slug: 'kjsomaiya', domain: 'somaiya.edu' },
  { name: 'IIT Bombay', slug: 'iitb', domain: 'iitb.ac.in' },
  { name: 'BITS Pilani', slug: 'bits', domain: 'pilani.bits-pilani.ac.in' },
  { name: 'VIT Vellore', slug: 'vit', domain: 'vitstudent.ac.in' },
  { name: 'NIT Trichy', slug: 'nitt', domain: 'gmail.com' },
  { name: 'IIIT Hyderabad', slug: 'iiith', domain: 'students.iiit.ac.in' },
  { name: 'COEP Pune', slug: 'coep', domain: 'coep.org.in' },
  { name: 'DTU Delhi', slug: 'dtu', domain: 'dtu.ac.in' },
  { name: 'Manipal Institute of Technology', slug: 'mit', domain: 'manipal.edu' },
  { name: 'SRM Institute', slug: 'srm', domain: 'srmist.edu.in' },
];

export async function seedColleges(prismaClient: PrismaClient) {
  for (const college of colleges) {
    await prismaClient.college.upsert({
      where: { slug: college.slug },
      update: {
        name: college.name,
        domain: college.domain,
      },
      create: college,
    });
  }
}

async function main() {
  await seedColleges(prisma);
  console.log(`✅ Seeded ${colleges.length} colleges`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}