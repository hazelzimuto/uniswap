import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ITEM_TYPES, GENDERS, CONDITIONS, LISTING_TYPES } from '@/lib/types';
import { getCurrentUser } from '@/lib/session';

interface Props {
  searchParams: Promise<{
    itemType?: string;
    gender?: string;
    size?: string;
    condition?: string;
    listingType?: string;
    minPrice?: string;
    maxPrice?: string;
    error?: string;
  }>;
}

export default async function BrowseListingsPage({ searchParams }: Props) {
  await getCurrentUser(); // Ensured logged in by middleware
  const params = await searchParams;

  const {
    itemType,
    gender,
    size,
    condition,
    listingType,
    minPrice,
    maxPrice,
    error,
  } = params;

  // Build filter query
  const whereClause: any = {
    status: 'ACTIVE',
  };

  if (itemType) whereClause.itemType = itemType;
  if (gender) whereClause.gender = gender;
  if (condition) whereClause.condition = condition;
  if (listingType) whereClause.listingType = listingType;
  if (size && size.trim() !== '') {
    whereClause.size = { contains: size.trim() };
  }

  // Price range filtering (in pence)
  if (minPrice || maxPrice) {
    whereClause.priceInPence = {};
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      whereClause.priceInPence.gte = Math.round(parseFloat(minPrice) * 100);
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereClause.priceInPence.lte = Math.round(parseFloat(maxPrice) * 100);
    }
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const hasActiveFilters = Boolean(
    itemType || gender || size || condition || listingType || minPrice || maxPrice
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1>Browse Uniforms</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Derby Grammar School second-hand uniform items available now.
          </p>
        </div>
        <Link href="/listings/new" className="btn btn-primary">
          + List an Item
        </Link>
      </div>

      {error === 'already_reserved' && (
        <div className="alert alert-danger" role="alert">
          This item has just been reserved by someone else.
        </div>
      )}

      {/* Filter Panel */}
      <div className="filter-panel">
        <form method="GET" action="/listings">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Filter Listings</h2>
            {hasActiveFilters && (
              <Link href="/listings" style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                Clear filters
              </Link>
            )}
          </div>

          <div className="filter-grid">
            {/* Item Type */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Item Type</label>
              <select name="itemType" defaultValue={itemType || ''} className="form-control" style={{ padding: '0.5rem' }}>
                <option value="">All Item Types</option>
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Gender</label>
              <select name="gender" defaultValue={gender || ''} className="form-control" style={{ padding: '0.5rem' }}>
                <option value="">All Genders</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Condition</label>
              <select name="condition" defaultValue={condition || ''} className="form-control" style={{ padding: '0.5rem' }}>
                <option value="">All Conditions</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Listing Type</label>
              <select name="listingType" defaultValue={listingType || ''} className="form-control" style={{ padding: '0.5rem' }}>
                <option value="">Sale & Donation</option>
                {LISTING_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Size</label>
              <input
                type="text"
                name="size"
                defaultValue={size || ''}
                placeholder="e.g. Age 11-12 or 32in"
                className="form-control"
                style={{ padding: '0.5rem' }}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Price (£ min / max)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  name="minPrice"
                  step="0.50"
                  min="0"
                  defaultValue={minPrice || ''}
                  placeholder="Min £"
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                />
                <input
                  type="number"
                  name="maxPrice"
                  step="0.50"
                  min="0"
                  defaultValue={maxPrice || ''}
                  placeholder="Max £"
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}>
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3>No items match your filters.</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Try clearing some filters or searching for another size or item type.
          </p>
          <Link href="/listings" className="btn btn-secondary">
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="grid-listings">
          {listings.map((item) => {
            const itemTypeLabel = ITEM_TYPES.find((t) => t.value === item.itemType)?.label || item.itemType;
            const conditionLabel = CONDITIONS.find((c) => c.value === item.condition)?.label || item.condition;
            const genderLabel = GENDERS.find((g) => g.value === item.gender)?.label || item.gender;
            const firstImage = item.images[0]?.url || '/uploads/blazer_navy.svg';

            return (
              <Link key={item.id} href={`/listings/${item.id}`} className="listing-card">
                <div className="listing-img-container">
                  <img
                    src={firstImage}
                    alt={itemTypeLabel}
                    className="listing-img"
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    {item.listingType === 'DONATION' ? (
                      <span className="badge badge-donation">Donation</span>
                    ) : (
                      <span className="badge badge-sale">For Sale</span>
                    )}
                  </div>
                </div>

                <div className="listing-content">
                  <div className="listing-title">{itemTypeLabel}</div>

                  <div className="listing-meta">
                    <span>Size: {item.size}</span>
                    <span>•</span>
                    <span>{genderLabel}</span>
                    <span>•</span>
                    <span>{conditionLabel}</span>
                  </div>

                  <div className="listing-price">
                    {item.listingType === 'DONATION' ? (
                      <span style={{ color: 'var(--success)' }}>Free Donation</span>
                    ) : (
                      `£${(item.priceInPence / 100).toFixed(2)}`
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
