'use server';
import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export interface AuthState {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
}

export async function registerAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  'use server';

  const name = (formData.get('name') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  const fieldErrors: AuthState['fieldErrors'] = {};

  if (!name || name.length < 2 || name.length > 60) {
    fieldErrors.name = 'Name must be between 2 and 60 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!password || password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Check unique email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'An account with this email already exists.' };
  }

  // Get single school: Derby Grammar School
  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({
      data: { name: 'Derby Grammar School' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      schoolId: school.id,
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    schoolId: user.schoolId,
  });

  redirect('/listings');
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  'use server';

  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  if (!email || !password) {
    return { error: 'Email or password is incorrect.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Email or password is incorrect.' };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { error: 'Email or password is incorrect.' };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    schoolId: user.schoolId,
  });

  redirect('/listings');
}

export async function logoutAction() {
  'use server';
  await destroySession();
  redirect('/');
}
