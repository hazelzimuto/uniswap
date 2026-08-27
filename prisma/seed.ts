import { PrismaClient, ItemType, Gender, Condition, ListingType, ListingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.reservation.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // Create School
  const school = await prisma.school.create({
    data: { name: 'Derby Grammar School' },
  });
  console.log(`Created school: ${school.name}`);

  // Create User
  const passwordHash = await bcrypt.hash('password123', 10);
  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash,
      name: 'Test Seller',
      schoolId: school.id,
      isAdmin: false,
    },
  });
  console.log(`Created user: ${seller.email}`);

  // Create Listings
  const listingsData = [
    { itemType: ItemType.BLAZER, gender: Gender.BOYS, size: '32', condition: Condition.GOOD, listingType: ListingType.SALE, priceInPence: 1500 },
    { itemType: ItemType.JUMPER, gender: Gender.UNISEX, size: 'M', condition: Condition.AS_NEW, listingType: ListingType.SALE, priceInPence: 800 },
    { itemType: ItemType.SKIRT, gender: Gender.GIRLS, size: '10', condition: Condition.FAIR, listingType: ListingType.DONATION, priceInPence: 0 },
    { itemType: ItemType.TROUSERS, gender: Gender.BOYS, size: '30L', condition: Condition.GOOD, listingType: ListingType.SALE, priceInPence: 1200 },
    { itemType: ItemType.SHIRT, gender: Gender.UNISEX, size: '14', condition: Condition.GOOD, listingType: ListingType.SALE, priceInPence: 500 },
    { itemType: ItemType.TIE, gender: Gender.UNISEX, size: 'One Size', condition: Condition.AS_NEW, listingType: ListingType.DONATION, priceInPence: 0 },
    { itemType: ItemType.PE_KIT, gender: Gender.GIRLS, size: 'S', condition: Condition.GOOD, listingType: ListingType.SALE, priceInPence: 1000 },
    { itemType: ItemType.SHOES, gender: Gender.BOYS, size: '8', condition: Condition.FAIR, listingType: ListingType.SALE, priceInPence: 2000 },
    { itemType: ItemType.COAT, gender: Gender.UNISEX, size: 'L', condition: Condition.GOOD, listingType: ListingType.SALE, priceInPence: 2500 },
    { itemType: ItemType.TRACKSUIT, gender: Gender.UNISEX, size: 'M', condition: Condition.AS_NEW, listingType: ListingType.SALE, priceInPence: 1800 },
  ];

  for (const data of listingsData) {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        sellerId: seller.id,
        schoolId: school.id,
        status: ListingStatus.ACTIVE,
      },
    });
    // Add mock image
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: 'https://placehold.co/400x400/png',
        sortOrder: 1,
      }
    });
  }
  
  console.log(`Created ${listingsData.length} listings`);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
