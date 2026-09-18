'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createListingAction, ListingFormState } from '@/app/actions/listings';
import { ITEM_TYPES, GENDERS, CONDITIONS, LISTING_TYPES } from '@/lib/types';

const initialState: ListingFormState = {};

export default function CreateListingPage() {
  const [state, formAction, isPending] = useActionState(createListingAction, initialState);
  const [listingType, setListingType] = useState<string>('SALE');

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <div className="card">
        <h1>List a Uniform Item</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
          Put an outgrown uniform item up for sale or donation for other Derby Grammar School parents.
        </p>

        {state?.error && (
          <div className="alert alert-danger" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction} encType="multipart/form-data">
          {/* Privacy Warning Banner */}
          <div className="alert alert-warning" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
            <strong>Privacy & Child Protection Notice:</strong> Listings must never contain a child's name, House, or photographs showing any child. Please ensure photos focus strictly on the item.
          </div>

          {/* Item Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="itemType">
              Item Type *
            </label>
            <select id="itemType" name="itemType" className="form-control" required defaultValue="">
              <option value="" disabled>Select Item Type</option>
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
            <select id="gender" name="gender" className="form-control" required defaultValue="">
              <option value="" disabled>Select Gender</option>
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
              placeholder="e.g. Age 11-12 or Chest 32in"
              required
              maxLength={30}
            />
            <p className="form-help">School sizing varies (e.g. "Chest 32in", "Waist 28in", "Age 13-14").</p>
            {state?.fieldErrors?.size && (
              <p className="form-error">{state.fieldErrors.size}</p>
            )}
          </div>

          {/* Condition */}
          <div className="form-group">
            <label className="form-label" htmlFor="condition">
              Condition *
            </label>
            <select id="condition" name="condition" className="form-control" required defaultValue="">
              <option value="" disabled>Select Condition</option>
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

          {/* Price (Only if Sale) */}
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
                placeholder="e.g. 15.00"
                required
              />
              <p className="form-help">Between £0.50 and £500.00.</p>
              {state?.fieldErrors?.price && (
                <p className="form-error">{state.fieldErrors.price}</p>
              )}
            </div>
          )}

          {/* Photos Upload */}
          <div className="form-group">
            <label className="form-label" htmlFor="photos">
              Item Photos (1–5 photos required) *
            </label>
            <input
              id="photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="form-control"
              required
            />
            <p className="form-help">Select 1 to 5 images (JPEG, PNG or WebP, max 5MB per file).</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isPending}
            >
              {isPending ? 'Publishing Item...' : 'Publish Listing'}
            </button>
            <Link href="/listings" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
