'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function sendMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const threadId = formData.get('threadId') as string;
  const body = (formData.get('body') as string || '').trim();

  if (!threadId) return;

  if (!body || body.length < 1 || body.length > 1000) {
    return;
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
  });

  if (!thread || (thread.buyerId !== user.id && thread.sellerId !== user.id)) {
    throw new Error("You don't have access to this item.");
  }

  if (thread.isClosed) {
    redirect(`/messages/${threadId}?error=closed`);
  }

  await prisma.message.create({
    data: {
      threadId,
      senderId: user.id,
      body,
    },
  });

  revalidatePath(`/messages/${threadId}`);
  redirect(`/messages/${threadId}`);
}
