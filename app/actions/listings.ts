'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

export interface ListingFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function saveUploadFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    if (!file || file.size === 0) continue;

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Photos must be JPEG, PNG or WebP and under 5MB.');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Photos must be JPEG, PNG or WebP and under 5MB.');
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    urls.push(`/uploads/${filename}`);
  }

  return urls;
}

export async function createListingAction(prevState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const itemType = (formData.get('itemType') as string) || '';
  const gender = (formData.get('gender') as string) || '';
  const size = (formData.get('size') as string || '').trim();
  const condition = (formData.get('condition') as string) || '';
  const listingType = (formData.get('listingType') as string) || '';
  const rawPrice = (formData.get('price') as string || '').trim();
  const photoFiles = formData.getAll('photos') as File[];

  const fieldErrors: Record<string, string> = {};

  if (!itemType) fieldErrors.itemType = 'Select an item type.';
  if (!gender) fieldErrors.gender = 'Select a gender.';
  if (!size || size.length > 30) fieldErrors.size = 'Size must be between 1 and 30 characters.';
  if (!condition) fieldErrors.condition = 'Select item condition.';
  if (!listingType) fieldErrors.listingType = 'Select listing type.';

  let priceInPence = 0;
  if (listingType === 'SALE') {
    const numPrice = parseFloat(rawPrice);
    if (isNaN(numPrice) || numPrice < 0.50 || numPrice > 500) {
      fieldErrors.price = 'Price must be between £0.50 and £500.00.';
    } else {
      priceInPence = Math.round(numPrice * 100);
    }
  } else if (listingType === 'DONATION') {
    if (rawPrice && parseFloat(rawPrice) > 0) {
      return { error: "Donation listings can't have a price." };
    }
    priceInPence = 0;
  }

  // Filter out empty file inputs if any
  const validFiles = photoFiles.filter(f => f && f.size > 0);
  if (validFiles.length === 0) {
    return { error: 'Add at least one photo of the item.' };
  }
  if (validFiles.length > 5) {
    return { error: 'You can upload a maximum of 5 photos.' };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let imageUrls: string[] = [];
  try {
    imageUrls = await saveUploadFiles(validFiles);
  } catch (err: any) {
    return { error: err.message || 'Photos must be JPEG, PNG or WebP and under 5MB.' };
  }

  if (imageUrls.length === 0) {
    return { error: 'Add at least one photo of the item.' };
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      schoolId: user.schoolId,
      itemType,
      gender,
      size,
      condition,
      listingType,
      priceInPence,
      status: 'ACTIVE',
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      },
    },
  });

  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(listingId: string, prevState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const existingListing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!existingListing || existingListing.sellerId !== user.id) {
    return { error: "You don't have access to this item." };
  }

  if (existingListing.status !== 'ACTIVE') {
    return { error: 'Only ACTIVE listings can be edited.' };
  }

  const itemType = (formData.get('itemType') as string) || '';
  const gender = (formData.get('gender') as string) || '';
  const size = (formData.get('size') as string || '').trim();
  const condition = (formData.get('condition') as string) || '';
  const listingType = (formData.get('listingType') as string) || '';
  const rawPrice = (formData.get('price') as string || '').trim();
  const photoFiles = formData.getAll('photos') as File[];

  const fieldErrors: Record<string, string> = {};

  if (!itemType) fieldErrors.itemType = 'Select an item type.';
  if (!gender) fieldErrors.gender = 'Select a gender.';
  if (!size || size.length > 30) fieldErrors.size = 'Size must be between 1 and 30 characters.';
  if (!condition) fieldErrors.condition = 'Select item condition.';
  if (!listingType) fieldErrors.listingType = 'Select listing type.';

  let priceInPence = 0;
  if (listingType === 'SALE') {
    const numPrice = parseFloat(rawPrice);
    if (isNaN(numPrice) || numPrice < 0.50 || numPrice > 500) {
      fieldErrors.price = 'Price must be between £0.50 and £500.00.';
    } else {
      priceInPence = Math.round(numPrice * 100);
    }
  } else if (listingType === 'DONATION') {
    if (rawPrice && parseFloat(rawPrice) > 0) {
      return { error: "Donation listings can't have a price." };
    }
    priceInPence = 0;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const validFiles = photoFiles.filter(f => f && f.size > 0);
  let newImageUrls: string[] = [];
  if (validFiles.length > 0) {
    try {
      newImageUrls = await saveUploadFiles(validFiles);
    } catch (err: any) {
      return { error: err.message || 'Photos must be JPEG, PNG or WebP and under 5MB.' };
    }
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      itemType,
      gender,
      size,
      condition,
      listingType,
      priceInPence,
    },
  });

  if (newImageUrls.length > 0) {
    await prisma.listingImage.deleteMany({ where: { listingId } });
    for (let i = 0; i < newImageUrls.length; i++) {
      await prisma.listingImage.create({
        data: {
          listingId,
          url: newImageUrls[i],
          sortOrder: i,
        },
      });
    }
  }

  redirect(`/listings/${listingId}`);
}

export async function removeListingAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const listingId = formData.get('listingId') as string;
  if (!listingId) return;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing || listing.sellerId !== user.id) {
    throw new Error("You don't have access to this item.");
  }

  // Soft delete: status = REMOVED
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'REMOVED' },
  });

  redirect('/my-items?msg=removed');
}
