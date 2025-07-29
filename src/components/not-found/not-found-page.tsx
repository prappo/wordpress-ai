'use client';

import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/not-found-page.css';
import Header from '@/components/home/header/header';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NotFoundPage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <>
      <div>
        <HomePageBackground />
        <Header user={user} />
        <div className="not-found-container">
          <h1 className="not-found-title">404</h1>
          <p className="not-found-text">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
          <Button variant="secondary" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    </>
  );
}
