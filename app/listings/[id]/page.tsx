import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { ITEM_TYPES, GENDERS, CONDITIONS } from '@/lib/types';
import { reserveListingAction, completeReservationAction } from '@/app/actions/reservations';
import { removeListingAction } from '@/app/actions/listings';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ListingDetailPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const { id } = await params;
  const { error } = await searchParams;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      reservations: {
        where: { status: 'ACTIVE' },
        include: { messageThread: true },
      },
    },
  });

  if (!listing || listing.status === 'REMOVED') {
    notFound();
  }

  const isSeller = user?.id === listing.sellerId;
  const activeReservation = listing.reservations[0];
  const isBuyerWhoReserved = activeReservation?.buyerId === user?.id;

  const itemTypeLabel = ITEM_TYPES.find((t) => t.value === listing.itemType)?.label || listing.itemType;
  const conditionLabel = CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition;
  const genderLabel = GENDERS.find((g) => g.value === listing.gender)?.label || listing.gender;

  return (
    <div style={{ maxWidth: '640px', margin: '1rem auto' }}>
      <Link href="/listings" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to all listings
      </Link>

      {error === 'own_listing' && (
        <div className="alert alert-danger" role="alert">
          You can't reserve your own listing.
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Images Gallery */}
        <div style={{ backgroundColor: '#e2e8f0', width: '100%', maxHeight: '420px', overflow: 'hidden', textAlign: 'center' }}>
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0].url}
              alt={itemTypeLabel}
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>No Image</div>
          )}
        </div>

        {/* Thumbnail gallery if multiple */}
        {listing.images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-subtle)' }}>
            {listing.images.map((img, idx) => (
              <img
                key={img.id}
                src={img.url}
                alt={`Photo ${idx + 1}`}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            ))}
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ marginBottom: '0.25rem' }}>{itemTypeLabel}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Listed by {listing.seller.name} • Derby Grammar School
              </p>
            </div>

            <div>
              {listing.status === 'ACTIVE' && (
                listing.listingType === 'DONATION' ? (
                  <span className="badge badge-donation" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>Free Donation</span>
                ) : (
                  <span className="badge badge-sale" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                    £{(listing.priceInPence / 100).toFixed(2)}
                  </span>
                )
              )}
              {listing.status === 'RESERVED' && (
                <span className="badge badge-reserved" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>Reserved</span>
              )}
              {listing.status === 'COMPLETED' && (
                <span className="badge badge-completed" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>Completed</span>
              )}
            </div>
          </div>

          {/* Structured Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>SIZE</span>
              <strong style={{ fontSize: '1.05rem' }}>{listing.size}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>GENDER</span>
              <strong style={{ fontSize: '1.05rem' }}>{genderLabel}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>CONDITION</span>
              <strong style={{ fontSize: '1.05rem' }}>{conditionLabel}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>PRICE / TYPE</span>
              <strong style={{ fontSize: '1.05rem' }}>
                {listing.listingType === 'DONATION' ? 'Free Donation' : `£${(listing.priceInPence / 100).toFixed(2)}`}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* 1. Buyer & Active: Reserve */}
            {!isSeller && listing.status === 'ACTIVE' && (
              <form action={reserveListingAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button type="submit" className="btn btn-primary btn-block" style={{ fontSize: '1.1rem', padding: '0.85rem' }}>
                  Reserve Item
                </button>
              </form>
            )}

            {/* 2. Seller & Active: Edit / Remove */}
            {isSeller && listing.status === 'ACTIVE' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href={`/listings/${listing.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>
                  Edit Listing
                </Link>
                <form action={removeListingAction} style={{ flex: 1 }} onSubmit={(e) => {
                  if (!confirm('Are you sure you want to remove this listing?')) e.preventDefault();
                }}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="btn btn-danger btn-block">
                    Remove Listing
                  </button>
                </form>
              </div>
            )}

            {/* 3. Reserved State Actions */}
            {listing.status === 'RESERVED' && (
              <>
                {isBuyerWhoReserved && activeReservation?.messageThread && (
                  <Link href={`/messages/${activeReservation.messageThread.id}`} className="btn btn-primary btn-block">
                    💬 View Message Thread with Seller
                  </Link>
                )}

                {isSeller && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeReservation?.messageThread && (
                      <Link href={`/messages/${activeReservation.messageThread.id}`} className="btn btn-secondary btn-block">
                        💬 Open Conversation with Buyer
                      </Link>
                    )}
                    <form action={completeReservationAction}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <button type="submit" className="btn btn-primary btn-block">
                        Mark as Handover Completed
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
