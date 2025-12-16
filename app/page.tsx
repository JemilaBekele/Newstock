import SignInViewPage from '@/features/auth/sign';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  // Directly render the sign-in page without fetching GitHub stars
  return <SignInViewPage />;
}
