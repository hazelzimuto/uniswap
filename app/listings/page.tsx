import { prisma } from "@/lib/prisma";
import { ItemType, Gender, Condition, ListingType } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const itemType = searchParams.itemType as ItemType | undefined;
  const gender = searchParams.gender as Gender | undefined;
  const condition = searchParams.condition as Condition | undefined;
  const listingType = searchParams.listingType as ListingType | undefined;
  
  const whereClause: any = {
    OR: [
      { status: 'ACTIVE' },
      {
        status: 'RESERVED',
        reservations: {
          some: {
            status: 'PENDING',
            expiresAt: { lt: new Date() }
          }
        }
      }
    ]
  };

  if (itemType) whereClause.itemType = itemType;
  if (gender) whereClause.gender = gender;
  if (condition) whereClause.condition = condition;
  if (listingType) whereClause.listingType = listingType;

  const listings = await prisma.listing.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1
      },
      school: true
    }
  });

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-1/4 bg-gray-50 p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-4">Filters</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Item Type</label>
            <select name="itemType" defaultValue={itemType || ""} className="w-full mt-1 border rounded p-1">
              <option value="">All</option>
              {Object.keys(ItemType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select name="gender" defaultValue={gender || ""} className="w-full mt-1 border rounded p-1">
              <option value="">All</option>
              {Object.keys(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Condition</label>
            <select name="condition" defaultValue={condition || ""} className="w-full mt-1 border rounded p-1">
              <option value="">All</option>
              {Object.keys(Condition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Listing Type</label>
            <select name="listingType" defaultValue={listingType || ""} className="w-full mt-1 border rounded p-1">
              <option value="">All</option>
              {Object.keys(ListingType).map(lt => <option key={lt} value={lt}>{lt}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Apply Filters</button>
          <Link href="/listings" className="block text-center text-sm text-blue-600 mt-2">Clear Filters</Link>
        </form>
      </aside>
      
      <main className="w-full md:w-3/4">
        <h1 className="text-2xl font-bold mb-4">Browse Uniforms</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Link href={`/listings/${listing.id}`} key={listing.id} className="block bg-white border rounded shadow hover:shadow-lg transition">
              <div className="relative h-48 bg-gray-200 w-full overflow-hidden rounded-t">
                {listing.images.length > 0 ? (
                  <img src={listing.images[0].url} alt={listing.itemType} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{listing.itemType}</h3>
                  <span className={`px-2 py-1 text-xs rounded text-white ${listing.listingType === 'DONATION' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {listing.listingType}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{listing.school.name}</p>
                <div className="mt-2 text-sm text-gray-700">
                  <p>Size: <span className="font-medium">{listing.size}</span></p>
                  <p>Gender: <span className="font-medium">{listing.gender}</span></p>
                </div>
                <div className="mt-4 font-bold text-lg">
                  {listing.listingType === 'SALE' ? `£${(listing.priceInPence / 100).toFixed(2)}` : 'Free'}
                </div>
              </div>
            </Link>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              No listings found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
