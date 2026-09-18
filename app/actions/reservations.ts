'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function reserveListingAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const listingId = formData.get('listingId') as string;
  if (!listingId) redirect('/listings');

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    redirect('/listings');
  }

  // Cannot reserve own listing
  if (listing.sellerId === user.id) {
    redirect(`/listings/${listingId}?error=own_listing`);
  }

  // Must be ACTIVE
  if (listing.status !== 'ACTIVE') {
    redirect('/listings?error=already_reserved');
  }

  // Create reservation and message thread in a transaction
  const thread = await prisma.$transaction(async (tx) => {
    // Lock listing status to RESERVED
    await tx.listing.update({
      where: { id: listingId },
      data: { status: 'RESERVED' },
    });

    const reservation = await tx.reservation.create({
      data: {
        listingId,
        buyerId: user.id,
        status: 'ACTIVE',
      },
    });

    const messageThread = await tx.messageThread.create({
      data: {
        reservationId: reservation.id,
        listingId,
        buyerId: user.id,
        sellerId: listing.sellerId,
        isClosed: false,
      },
    });

    return messageThread;
  });

  redirect(`/messages/${thread.id}`);
}

export async function cancelReservationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const reservationId = formData.get('reservationId') as string;
  if (!reservationId) redirect('/my-items');

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      listing: true,
      messageThread: true,
    },
  });

  if (!reservation) redirect('/my-items');

  // Must be buyer or seller
  if (reservation.buyerId !== user.id && reservation.listing.sellerId !== user.id) {
    throw new Error("You don't have access to this item.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update reservation status to CANCELLED
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });

    // 2. Return listing to ACTIVE status
    await tx.listing.update({
      where: { id: reservation.listingId },
      data: { status: 'ACTIVE' },
    });

    // 3. Close message thread
    if (reservation.messageThread) {
      await tx.messageThread.update({
        where: { id: reservation.messageThread.id },
        data: { isClosed: true },
      });
    }
  });

  redirect('/my-items?msg=reservation_cancelled');
}

export async function completeReservationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const listingId = formData.get('listingId') as string;
  if (!listingId) redirect('/my-items');

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      reservations: {
        where: { status: 'ACTIVE' },
        include: { messageThread: true },
      },
    },
  });

  if (!listing || listing.sellerId !== user.id) {
    throw new Error("You don't have access to this item.");
  }

  const activeReservation = listing.reservations[0];

  await prisma.$transaction(async (tx) => {
    // 1. Set listing to COMPLETED
    await tx.listing.update({
      where: { id: listingId },
      data: { status: 'COMPLETED' },
    });

    // 2. Set reservation to COMPLETED
    if (activeReservation) {
      await tx.reservation.update({
        where: { id: activeReservation.id },
        data: { status: 'COMPLETED' },
      });

      // 3. Close message thread
      if (activeReservation.messageThread) {
        await tx.messageThread.update({
          where: { id: activeReservation.messageThread.id },
          data: { isClosed: true },
        });
      }
    }
  });

  redirect('/my-items?msg=marked_completed');
}
