'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updateListingAction, ListingFormState } from '@/app/actions/listings';
import { ITEM_TYPES, GENDERS, CONDITIONS, LISTING_TYPES } from '@/lib/types';

interface Props {
  listing: any;
}

export default function EditListingForm({ listing }: Props) {
  const updateWithId = updateListingAction.bind(null, listing.id);
  const [state, formAction, isPending] = useActionState(updateWithId, {});
  const [listingType, setListingType] = useState<string>(listing.listingType);

  return (
    <div className="card">
      <h1>Edit Uniform Listing</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
        Update details or replacement photos for your active uniform listing.
      </p>

      {state?.error && (
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} encType="multipart/form-data">
        <div className="alert alert-warning" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
          <strong>Privacy & Child Protection Notice:</strong> Listings must never contain a child's name, House, or photographs showing any child.
        </div>

        {/* Item Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="itemType">
            Item Type *
          </label>
          <select id="itemType" name="itemType" className="form-control" required defaultValue={listing.itemType}>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.itemType && (
            <p className="form-error">{state.fieldErrors.itemType}</p>
          )}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label" htmlFor="gender">
            Gender *
          </label>
          <select id="gender" name="gender" className="form-control" required defaultValue={listing.gender}>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.gender && (
            <p className="form-error">{state.fieldErrors.gender}</p>
          )}
        </div>

        {/* Size */}
        <div className="form-group">
          <label className="form-label" htmlFor="size">
            Size *
          </label>
          <input
            id="size"
            name="size"
            type="text"
            className="form-control"
            defaultValue={listing.size}
            required
            maxLength={30}
          />
          {state?.fieldErrors?.size && (
            <p className="form-error">{state.fieldErrors.size}</p>
          )}
        </div>

        {/* Condition */}
        <div className="form-group">
          <label className="form-label" htmlFor="condition">
            Condition *
          </label>
          <select id="condition" name="condition" className="form-control" required defaultValue={listing.condition}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.condition && (
            <p className="form-error">{state.fieldErrors.condition}</p>
          )}
        </div>

        {/* Listing Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="listingType">
            Listing Type *
          </label>
          <select
            id="listingType"
            name="listingType"
            className="form-control"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            required
          >
            {LISTING_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>
                {lt.label}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.listingType && (
            <p className="form-error">{state.fieldErrors.listingType}</p>
          )}
        </div>

        {/* Price */}
        {listingType === 'SALE' && (
          <div className="form-group">
            <label className="form-label" htmlFor="price">
              Asking Price (£) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.50"
              min="0.50"
              max="500"
              className="form-control"
              defaultValue={(listing.priceInPence / 100).toFixed(2)}
              required
            />
            {state?.fieldErrors?.price && (
              <p className="form-error">{state.fieldErrors.price}</p>
            )}
          </div>
        )}

        {/* Replacement Photos */}
        <div className="form-group">
          <label className="form-label" htmlFor="photos">
            Replacement Photos (Optional)
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="form-control"
          />
          <p className="form-help">Leave empty to keep existing photos.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isPending}
          >
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <Link href={`/listings/${listing.id}`} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
