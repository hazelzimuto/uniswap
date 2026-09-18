export type ItemType =
  | 'BLAZER'
  | 'JUMPER'
  | 'SKIRT'
  | 'TROUSERS'
  | 'SHIRT'
  | 'TIE'
  | 'PE_KIT'
  | 'SHOES'
  | 'COAT'
  | 'TRACKSUIT'
  | 'OTHER';

export type Gender = 'BOYS' | 'GIRLS' | 'UNISEX';

export type Condition = 'AS_NEW' | 'GOOD' | 'FAIR';

export type ListingType = 'SALE' | 'DONATION';

export type ListingStatus = 'ACTIVE' | 'RESERVED' | 'COMPLETED' | 'REMOVED';

export type ReservationStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'BLAZER', label: 'Blazer' },
  { value: 'JUMPER', label: 'Jumper' },
  { value: 'SKIRT', label: 'Skirt' },
  { value: 'TROUSERS', label: 'Trousers' },
  { value: 'SHIRT', label: 'Shirt' },
  { value: 'TIE', label: 'Tie' },
  { value: 'PE_KIT', label: 'PE Kit' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'COAT', label: 'Coat' },
  { value: 'TRACKSUIT', label: 'Tracksuit' },
  { value: 'OTHER', label: 'Other' },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'BOYS', label: 'Boys' },
  { value: 'GIRLS', label: 'Girls' },
  { value: 'UNISEX', label: 'Unisex' },
];

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'AS_NEW', label: 'As New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'DONATION', label: 'Donation (Free)' },
];
