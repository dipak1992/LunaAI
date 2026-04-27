import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Luna',
  description: 'Your personal menopause companion',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
