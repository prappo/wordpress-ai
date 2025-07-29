'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { login } from '@/app/login/actions';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  next?: string;
}

export function LoginForm({ next = '/dashboard' }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    login({ email, password, next }).then((data) => {
      if (data?.error) {
        toast({ description: 'Invalid email or password', variant: 'destructive' });
      }
    });
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
              <Image src={'/assets/icons/logo.png'} alt={'WordPress AI'} width={50} height={50} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        Log in to your account
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button formAction={() => handleLogin()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Log in
      </Button>
    </form>
  );
}
