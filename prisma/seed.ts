import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.message.deleteMany({});
  await prisma.messageThread.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.listingImage.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});

  // 1. School
  const school = await prisma.school.create({
    data: {
      name: 'Derby Grammar School',
    },
  });

  // 2. Sample Users (Parents)
  const passwordHash = await bcrypt.hash('password123', 10);

  const parent1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      passwordHash,
      schoolId: school.id,
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      name: 'Mark Taylor',
      email: 'mark.t@example.com',
      passwordHash,
      schoolId: school.id,
    },
  });

  console.log('Created sample school and users:');
  console.log(`- Sarah Jenkins (sarah.j@example.com / password123)`);
  console.log(`- Mark Taylor (mark.t@example.com / password123)`);

  // 3. Sample Listings (8 items)
  const sampleListings = [
    {
      sellerId: parent1.id,
      schoolId: school.id,
      itemType: 'BLAZER',
      gender: 'BOYS',
      size: 'Chest 34in',
      condition: 'GOOD',
      listingType: 'SALE',
      priceInPence: 2500, // £25.00
      status: 'ACTIVE',
      images: ['/uploads/blazer_navy.svg'],
    },
    {
      sellerId: parent1.id,
      schoolId: school.id,
      itemType: 'JUMPER',
      gender: 'UNISEX',
      size: 'Age 11-12',
      condition: 'AS_NEW',
      listingType: 'SALE',
      priceInPence: 1200, // £12.00
      status: 'ACTIVE',
      images: ['/uploads/jumper_maroon.svg'],
    },
    {
      sellerId: parent2.id,
      schoolId: school.id,
      itemType: 'SKIRT',
      gender: 'GIRLS',
      size: 'Waist 26in',
      condition: 'GOOD',
      listingType: 'DONATION',
      priceInPence: 0,
      status: 'ACTIVE',
      images: ['/uploads/skirt_pleated.svg'],
    },
    {
      sellerId: parent2.id,
      schoolId: school.id,
      itemType: 'TROUSERS',
      gender: 'BOYS',
      size: 'Age 13-14',
      condition: 'FAIR',
      listingType: 'SALE',
      priceInPence: 800, // £8.00
      status: 'ACTIVE',
      images: ['/uploads/trousers_grey.svg'],
    },
    {
      sellerId: parent1.id,
      schoolId: school.id,
      itemType: 'PE_KIT',
      gender: 'UNISEX',
      size: 'Medium (Adult)',
      condition: 'AS_NEW',
      listingType: 'SALE',
      priceInPence: 1500, // £15.00
      status: 'ACTIVE',
      images: ['/uploads/pe_shirt.svg'],
    },
    {
      sellerId: parent2.id,
      schoolId: school.id,
      itemType: 'TIE',
      gender: 'UNISEX',
      size: 'Standard',
      condition: 'AS_NEW',
      listingType: 'DONATION',
      priceInPence: 0,
      status: 'ACTIVE',
      images: ['/uploads/school_tie.svg'],
    },
    {
      sellerId: parent1.id,
      schoolId: school.id,
      itemType: 'SHOES',
      gender: 'BOYS',
      size: 'UK Size 6',
      condition: 'GOOD',
      listingType: 'SALE',
      priceInPence: 1800, // £18.00
      status: 'ACTIVE',
      images: ['/uploads/school_shoes.svg'],
    },
    {
      sellerId: parent2.id,
      schoolId: school.id,
      itemType: 'COAT',
      gender: 'UNISEX',
      size: 'Age 12-13',
      condition: 'GOOD',
      listingType: 'SALE',
      priceInPence: 3000, // £30.00
      status: 'ACTIVE',
      images: ['/uploads/winter_coat.svg'],
    },
  ];

  for (const item of sampleListings) {
    const { images, ...data } = item;
    const listing = await prisma.listing.create({
      data,
    });
    for (let i = 0; i < images.length; i++) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: images[i],
          sortOrder: i,
        },
      });
    }
  }

  console.log(`Successfully seeded ${sampleListings.length} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
