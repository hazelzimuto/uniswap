import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { ITEM_TYPES, CONDITIONS } from '@/lib/types';
import { removeListingAction } from '@/app/actions/listings';
import { cancelReservationAction, completeReservationAction } from '@/app/actions/reservations';

interface Props {
  searchParams: Promise<{
    msg?: string;
  }>;
}

export default async function MyItemsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const { msg } = await searchParams;

  const myListings = await prisma.listing.findMany({
    where: {
      sellerId: user!.id,
      status: { not: 'REMOVED' },
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
      reservations: {
        where: { status: 'ACTIVE' },
        include: { messageThread: true, buyer: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const myReservations = await prisma.reservation.findMany({
    where: {
      buyerId: user!.id,
    },
    include: {
      listing: {
        include: {
          seller: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      },
      messageThread: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Items</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Manage your listings and reserved uniform items.
      </p>

      {msg === 'removed' && (
        <div className="alert alert-success">Listing was successfully removed.</div>
      )}
      {msg === 'reservation_cancelled' && (
        <div className="alert alert-success">Reservation cancelled. The item is back in the active browse pool.</div>
      )}
      {msg === 'marked_completed' && (
        <div className="alert alert-success">Handover marked as completed! Thank you.</div>
      )}

      {/* SECTION 1: My Listings */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Listings ({myListings.length})</h2>
          <Link href="/listings/new" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
            + List New Item
          </Link>
        </div>

        {myListings.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't listed any items yet.</p>
            <Link href="/listings/new" className="btn btn-secondary">
              List an Item Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myListings.map((item) => {
              const itemTypeLabel = ITEM_TYPES.find((t) => t.value === item.itemType)?.label || item.itemType;
              const conditionLabel = CONDITIONS.find((c) => c.value === item.condition)?.label || item.condition;
              const image = item.images[0]?.url || '/uploads/blazer_navy.svg';
              const activeRes = item.reservations[0];

              return (
                <div key={item.id} className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <img
                    src={image}
                    alt={itemTypeLabel}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e2e8f0' }}
                  />

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Link href={`/listings/${item.id}`} style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {itemTypeLabel}
                      </Link>
                      {item.status === 'ACTIVE' && <span className="badge badge-active">Active</span>}
                      {item.status === 'RESERVED' && <span className="badge badge-reserved">Reserved</span>}
                      {item.status === 'COMPLETED' && <span className="badge badge-completed">Completed</span>}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Size: {item.size} • {conditionLabel} • {item.listingType === 'DONATION' ? 'Free Donation' : `£${(item.priceInPence / 100).toFixed(2)}`}
                    </div>

                    {item.status === 'RESERVED' && activeRes && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '0.35rem', fontWeight: 600 }}>
                        Reserved by {activeRes.buyer.name}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.status === 'ACTIVE' && (
                      <>
                        <Link href={`/listings/${item.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Edit
                        </Link>
                        <form action={removeListingAction} onSubmit={(e) => {
                          if (!confirm('Are you sure you want to remove this listing?')) e.preventDefault();
                        }}>
                          <input type="hidden" name="listingId" value={item.id} />
                          <button type="submit" className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            Remove
                          </button>
                        </form>
                      </>
                    )}

                    {item.status === 'RESERVED' && activeRes && (
                      <>
                        {activeRes.messageThread && (
                          <Link href={`/messages/${activeRes.messageThread.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            💬 Message Buyer
                          </Link>
                        )}
                        <form action={completeReservationAction}>
                          <input type="hidden" name="listingId" value={item.id} />
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            Mark Completed
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: My Reservations */}
      <section>
        <h2>My Reservations ({myReservations.length})</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Items you have claimed and locked from other buyers.
        </p>

        {myReservations.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>You haven't reserved any items yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myReservations.map((res) => {
              const listing = res.listing;
              const itemTypeLabel = ITEM_TYPES.find((t) => t.value === listing.itemType)?.label || listing.itemType;
              const image = listing.images[0]?.url || '/uploads/blazer_navy.svg';

              return (
                <div key={res.id} className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <img
                    src={image}
                    alt={itemTypeLabel}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e2e8f0' }}
                  />

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Link href={`/listings/${listing.id}`} style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {itemTypeLabel}
                      </Link>
                      {res.status === 'ACTIVE' && <span className="badge badge-reserved">Reserved</span>}
                      {res.status === 'COMPLETED' && <span className="badge badge-completed">Completed</span>}
                      {res.status === 'CANCELLED' && <span className="badge badge-completed">Cancelled</span>}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Seller: {listing.seller.name} • Size: {listing.size} • {listing.listingType === 'DONATION' ? 'Free Donation' : `£${(listing.priceInPence / 100).toFixed(2)}`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {res.messageThread && (
                      <Link href={`/messages/${res.messageThread.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        💬 Open Messages
                      </Link>
                    )}

                    {res.status === 'ACTIVE' && (
                      <form action={cancelReservationAction} onSubmit={(e) => {
                        if (!confirm('Are you sure you want to cancel this reservation? The item will return to the active browse pool.')) e.preventDefault();
                      }}>
                        <input type="hidden" name="reservationId" value={res.id} />
                        <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                          Cancel Reservation
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
