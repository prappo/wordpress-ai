'use client';

import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { WhySection } from '@/components/home/why-section/why-section';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <>
      <div>
        <HomePageBackground />
        <Header user={user} />
        <HeroSection />
        <WhySection />
        <Footer />
      </div>
    </>
  );
}
