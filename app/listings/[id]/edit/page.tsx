import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import EditListingForm from './EditListingForm';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!listing || listing.sellerId !== user.id || listing.status !== 'ACTIVE') {
    notFound();
  }

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <EditListingForm listing={listing} />
    </div>
  );
}
