import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ItemType, Gender, Condition, ListingType, ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function CreateListingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's school context
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!user) redirect("/login");

  async function createListing(formData: FormData) {
    "use server";
    
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) throw new Error("Unauthorized");
    
    const dbUser = await prisma.user.findUnique({ where: { email: userSession.user.email! }});
    
    const itemType = formData.get("itemType") as ItemType;
    const gender = formData.get("gender") as Gender;
    const condition = formData.get("condition") as Condition;
    const listingType = formData.get("listingType") as ListingType;
    const size = formData.get("size") as string;
    const priceStr = formData.get("price") as string;
    const imageUrl = formData.get("imageUrl") as string;
    
    const priceInPence = listingType === 'SALE' ? Math.round(parseFloat(priceStr || "0") * 100) : 0;

    const newListing = await prisma.listing.create({
      data: {
        sellerId: dbUser!.id,
        schoolId: dbUser!.schoolId,
        itemType,
        gender,
        size,
        condition,
        listingType,
        priceInPence,
        status: ListingStatus.ACTIVE,
      }
    });

    if (imageUrl) {
      await prisma.listingImage.create({
        data: {
          listingId: newListing.id,
          url: imageUrl,
          sortOrder: 1
        }
      });
    }

    revalidatePath("/listings");
    redirect(`/listings/${newListing.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-md mt-6">
      <h1 className="text-2xl font-bold mb-6">Create a Listing</h1>
      <form action={createListing} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Item Type</label>
            <select name="itemType" required className="w-full border rounded p-2">
              {Object.keys(ItemType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" required className="w-full border rounded p-2">
              {Object.keys(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select name="condition" required className="w-full border rounded p-2">
              {Object.keys(Condition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Listing Type</label>
            <select name="listingType" required className="w-full border rounded p-2">
              <option value="SALE">Sale</option>
              <option value="DONATION">Donation</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Size (e.g. 10, M, 32L)</label>
            <input type="text" name="size" required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (£) (Leave blank if Donation)</label>
            <input type="number" step="0.01" min="0" name="price" className="w-full border rounded p-2" placeholder="15.00" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (Mock Upload)</label>
          <input type="url" name="imageUrl" className="w-full border rounded p-2" placeholder="https://placehold.co/400x400/png" />
          <p className="text-xs text-gray-500 mt-1">For MVP, just paste any image URL.</p>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700">
            Publish Listing
          </button>
        </div>
      </form>
    </div>
  );
}
