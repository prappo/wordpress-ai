import { LoginGradient } from '@/components/gradients/login-gradient';
import '../../styles/login.css';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { GoogleLoginButton } from '@/components/authentication/google-login-button';
import { SignupForm } from '@/components/authentication/sign-up-form';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div>
      <LoginGradient />
      <div className={'flex flex-col'}>
        <div
          className={
            'mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg rounded-b-none login-card-border backdrop-blur-[6px]'
          }
        >
          <LoginCardGradient />
          <SignupForm />
        </div>
        <GoogleLoginButton label={'Sign up with Google'} />
        <div
          className={
            'mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 pt-0 py-8 gap-6 flex flex-col items-center justify-center rounded-b-lg'
          }
        >
          <div className={'text-center text-muted-foreground text-sm mt-4 font-medium'}>
            Already have an account?{' '}
            <a href={'/login'} className={'text-white'}>
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
