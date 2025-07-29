'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
interface Props {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function Header({ user }: Props) {
  return (
    <nav>
      <div className="mx-auto max-w-7xl relative px-[32px] py-[18px] flex items-center justify-between">
        <div className="flex flex-1 items-center justify-start">
          <Link className="flex items-center" href={'/'}>
                    <Image className="w-auto block" src="/assets/icons/logo.png" width={50} height={50} alt="WordPress AI" />
        <span className="ml-2 text-xl font-semibold">WordPress AI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center space-x-4">
            {/* Removed pricing link - all features are now free */}
            {user?.id ? (
              <Button variant={'secondary'} asChild={true}>
                <Link href={'/dashboard'}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild={true} variant={'secondary'}>
                <Link href={'/login'}>Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
