import type { Metadata } from 'next';
import DashboardDisclaimer from '@/components/app/DashboardDisclaimer';
import MobileBottomNav from '@/components/app/MobileBottomNav';
import CursorGlow from '@/components/effects/CursorGlow';
import { WhisperProvider } from '@/components/ui/WhisperToast';

export const metadata: Metadata = {
  title: 'Dashboard — Luna',
  description: 'Your personal menopause companion',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WhisperProvider>
      <CursorGlow />
      {children}
      <MobileBottomNav />
      <DashboardDisclaimer />
    </WhisperProvider>
  );
}
