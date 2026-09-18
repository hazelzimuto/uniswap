import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { ITEM_TYPES } from '@/lib/types';

export default async function MessagesListPage() {
  const user = await getCurrentUser();

  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [
        { buyerId: user!.id },
        { sellerId: user!.id },
      ],
    },
    include: {
      buyer: true,
      seller: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1>Messages</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Conversations between parents to arrange payment and handover.
      </p>

      {threads.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <h3>You have no conversations.</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Reserve an item or have another parent reserve your item to start a conversation.
          </p>
          <Link href="/listings" className="btn btn-primary">
            Browse Uniform Items
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {threads.map((thread) => {
            const isBuyer = thread.buyerId === user!.id;
            const otherUser = isBuyer ? thread.seller : thread.buyer;
            const itemTypeLabel = ITEM_TYPES.find((t) => t.value === thread.listing.itemType)?.label || thread.listing.itemType;
            const image = thread.listing.images[0]?.url || '/uploads/blazer_navy.svg';
            const lastMessage = thread.messages[0];

            return (
              <Link key={thread.id} href={`/messages/${thread.id}`} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={image}
                  alt={itemTypeLabel}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e2e8f0' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '1.05rem' }}>{itemTypeLabel} (Size: {thread.listing.size})</strong>
                    {lastMessage && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    With {otherUser.name} ({isBuyer ? 'Seller' : 'Buyer'})
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMessage ? (
                      `${lastMessage.senderId === user!.id ? 'You: ' : ''}${lastMessage.body}`
                    ) : (
                      <em>No messages yet. Click to start.</em>
                    )}
                  </p>
                </div>

                {thread.isClosed && (
                  <span className="badge badge-completed" style={{ fontSize: '0.75rem' }}>Closed</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
