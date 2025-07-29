import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className={'mx-auto max-w-7xl px-[32px] relative flex items-center justify-between mt-16 mb-12'}>
      <div className={'text-center w-full'}>
        <h1 className={'text-[48px] leading-[48px] md:text-[80px] md:leading-[80px] tracking-[-1.6px] font-medium'}>
          AI for WordPress
          <br />
          Design & Development
        </h1>
        <p className={'mt-6 text-[18px] leading-[27px] md:text-[20px] md:leading-[30px]'}>
          Create WordPress <b className="text-white">themes</b>, <b className="text-white">plugins</b> and{' '}
          <b className="text-white">content</b> using AI, even without coding expertise.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-3">
            <p className="text-lg font-medium text-white">
              Start for free - Create your first project today!
            </p>
          </div>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            {/* Removed pricing button - all features are now free */}
          </div>
        </div>
      </div>
    </section>
  );
}
