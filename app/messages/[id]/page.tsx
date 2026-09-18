import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { ITEM_TYPES } from '@/lib/types';
import { sendMessageAction } from '@/app/actions/messages';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const { id } = await params;
  const { error } = await searchParams;

  const thread = await prisma.messageThread.findUnique({
    where: { id },
    include: {
      buyer: true,
      seller: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      },
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  const isParticipant = thread.buyerId === user!.id || thread.sellerId === user!.id;
  if (!isParticipant) {
    throw new Error("You don't have access to this item.");
  }

  const isBuyer = thread.buyerId === user!.id;
  const otherUser = isBuyer ? thread.seller : thread.buyer;
  const itemTypeLabel = ITEM_TYPES.find((t) => t.value === thread.listing.itemType)?.label || thread.listing.itemType;
  const listingImage = thread.listing.images[0]?.url || '/uploads/blazer_navy.svg';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <Link href="/messages" style={{ fontSize: '0.9rem' }}>
          ← Back to all messages
        </Link>
        <Link href={`/listings/${thread.listingId}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          View Listing Details →
        </Link>
      </div>

      <div className="thread-container">
        {/* Thread Header Banner */}
        <div style={{ padding: '0.75rem 1rem', background: '#ffffff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={listingImage}
            alt={itemTypeLabel}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              {itemTypeLabel} (Size: {thread.listing.size})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Handover with <strong>{otherUser.name}</strong> ({isBuyer ? 'Seller' : 'Buyer'}) • {thread.listing.listingType === 'DONATION' ? 'Free Donation' : `£${(thread.listing.priceInPence / 100).toFixed(2)}`}
            </div>
          </div>
          {thread.isClosed && (
            <span className="badge badge-completed">Closed</span>
          )}
        </div>

        {/* Mandatory Payment/Delivery Notice Banner */}
        <div className="disclaimer-banner">
          ⚠️ <span>Payment and delivery are arranged directly between the two parents, and UniSwap is not involved in either.</span>
        </div>

        {error === 'closed' && (
          <div className="alert alert-danger" style={{ margin: '0.5rem 1rem 0 1rem' }}>
            This conversation is closed.
          </div>
        )}

        {/* Messages List */}
        <div className="messages-list">
          {thread.messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No messages yet. Send a message to arrange payment and handover.
            </div>
          ) : (
            thread.messages.map((msg) => {
              const isMine = msg.senderId === user!.id;
              return (
                <div
                  key={msg.id}
                  className={`message-bubble ${isMine ? 'message-mine' : 'message-other'}`}
                >
                  <div className="message-sender">{isMine ? 'You' : msg.sender.name}</div>
                  <div>{msg.body}</div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Footer */}
        <div className="thread-footer">
          {thread.isClosed ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem 0' }}>
              This conversation is closed.
            </div>
          ) : (
            <form action={sendMessageAction} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="hidden" name="threadId" value={thread.id} />
              <input
                type="text"
                name="body"
                className="form-control"
                placeholder="Write a message to arrange handover..."
                required
                maxLength={1000}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
