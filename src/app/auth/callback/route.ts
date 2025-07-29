import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        // In production, always redirect to the main domain
        return NextResponse.redirect(`https://www.wordpressai.com/dashboard`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
