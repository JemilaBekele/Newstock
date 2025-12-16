import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/sign';

export const metadata: Metadata = {
  title: 'Stock Management',
  description: 'Stock Management dashboard and inventory system.'
};

export default function Page() {
  // Directly render the sign-in page without fetching GitHub stars
  return <SignInViewPage />;
}
