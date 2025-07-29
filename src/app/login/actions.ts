'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

interface FormData {
  email: string;
  password: string;
  next?: string;
}

export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: true };
  }

  revalidatePath('/', 'layout');

  // Get the referrer URL from headers
  const headersList = await headers();
  const referer = headersList.get('referer');
  const refererUrl = referer ? new URL(referer) : null;
  const next = data.next || refererUrl?.pathname || '/dashboard';

  redirect(next);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  // Use the production domain in production
  const domain = process.env.NODE_ENV === 'development' ? host : 'www.wordpressai.com';

  const redirectTo = `${protocol}://${domain}/auth/callback?next=/dashboard`;

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `wpai+${Date.now().toString(36)}@example.com`,
  });

  if (signInError || updateUserError) {
    return { error: true };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
