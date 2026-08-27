import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      seller: { select: { id: true, name: true, email: true } },
      school: true,
      reservations: {
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!listing) return notFound();

  // Check on read if it's expired
  let isActive = listing.status === 'ACTIVE';
  if (listing.status === 'RESERVED' && listing.reservations.length > 0) {
    const activeReservation = listing.reservations[0];
    if (activeReservation.expiresAt < new Date()) {
      isActive = true;
    }
  }

  const isSeller = session?.user?.email === listing.seller.email;

  async function reserveListing() {
    "use server";
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) throw new Error("Not logged in");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48h expiry

    await prisma.$transaction([
      prisma.reservation.create({
        data: {
          listingId: listing!.id,
          buyerId: (userSession.user as any).id,
          expiresAt,
          status: 'PENDING'
        }
      }),
      prisma.listing.update({
        where: { id: listing!.id },
        data: { status: 'RESERVED' }
      })
    ]);

    revalidatePath(`/listings/${listing!.id}`);
    revalidatePath(`/listings`);
  }

  async function completeReservation() {
    "use server";
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) throw new Error("Not logged in");

    const pendingReservation = await prisma.reservation.findFirst({
      where: { listingId: listing!.id, status: 'PENDING' }
    });

    if (!pendingReservation) throw new Error("No pending reservation");

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: pendingReservation.id },
        data: { status: 'CONFIRMED', confirmedAt: new Date() }
      }),
      prisma.listing.update({
        where: { id: listing!.id },
        data: { status: 'COMPLETED' }
      })
    ]);

    revalidatePath(`/listings/${listing!.id}`);
    revalidatePath(`/listings`);
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2 bg-gray-100 min-h-[300px] flex items-center justify-center p-4">
          {listing.images.length > 0 ? (
            <img src={listing.images[0].url} alt="Listing" className="max-w-full max-h-[400px] object-contain rounded" />
          ) : (
            <div className="text-gray-400">No Image Provided</div>
          )}
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
              {listing.listingType} • {listing.condition.replace('_', ' ')}
            </div>
            <h1 className="block mt-1 text-3xl leading-tight font-bold text-black">
              {listing.itemType}
            </h1>
            <p className="mt-2 text-gray-500">{listing.school.name}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-bold text-gray-900 block">Gender</span>
                {listing.gender}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Size</span>
                {listing.size}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Seller</span>
                {listing.seller.name}
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${isActive ? 'bg-green-500' : listing.status === 'COMPLETED' ? 'bg-gray-500' : 'bg-orange-500'}`}>
                  {isActive ? 'ACTIVE' : listing.status}
                </span>
              </div>
            </div>

            <div className="mt-6 text-3xl font-bold text-gray-900">
              {listing.listingType === 'SALE' ? `£${(listing.priceInPence / 100).toFixed(2)}` : 'FREE'}
            </div>
          </div>

          <div className="mt-8">
            {!session && (
              <p className="text-sm text-gray-500 italic">Please log in to reserve this item.</p>
            )}
            
            {session && !isSeller && isActive && (
              <form action={reserveListing}>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700">
                  Reserve Item (48 hours)
                </button>
              </form>
            )}

            {session && isSeller && listing.status === 'RESERVED' && !isActive && (
              <div className="bg-orange-50 p-4 border border-orange-200 rounded">
                <p className="text-sm text-orange-800 mb-3 font-medium">This item is currently reserved. Have you completed the exchange with the buyer?</p>
                <form action={completeReservation}>
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                    Mark as Completed
                  </button>
                </form>
              </div>
            )}
            
            {session && isSeller && isActive && (
              <div className="text-sm text-gray-500 italic">You are the seller of this item.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
