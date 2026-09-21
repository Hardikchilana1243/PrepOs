'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '@/lib/auth';

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function signUpAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: 'An account with this email already exists. Please sign in.' };
    }

    const hashedPassword = await hashPassword(password);

    // Create User & Credentials Account
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        role: 'STUDENT',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: email,
            access_token: hashedPassword,
          },
        },
      },
    });

    await createSession(user.id);
  } catch (err) {
    console.error('Sign up error:', err);
    return { error: 'Failed to create account. Please try again.' };
  }

  redirect('/onboarding');
}

export async function signInAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  let userRedirectTarget = '/dashboard';

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { provider: 'credentials' },
        },
        profile: true,
      },
    });

    if (!user || user.accounts.length === 0) {
      return { error: 'Invalid email or password.' };
    }

    const storedHash = user.accounts[0].access_token;
    if (!storedHash) {
      return { error: 'Account credentials error. Please reset your password.' };
    }

    const isValid = await verifyPassword(password, storedHash);
    if (!isValid) {
      return { error: 'Invalid email or password.' };
    }

    await createSession(user.id);

    // Check if onboarding is required
    if (!user.profile) {
      userRedirectTarget = '/onboarding';
    }
  } catch (err) {
    console.error('Sign in error:', err);
    return { error: 'Authentication failed. Please try again.' };
  }

  redirect(userRedirectTarget);
}

export async function signOutAction() {
  await destroySession();
  redirect('/');
}
