'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Bell, CreditCard, Database, LogOut, Shield, User } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import ManageSubscriptionButton from '@/components/subscription/ManageSubscriptionButton';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/lib/actions/auth';

interface Profile {
  name: string | null;
  subscription_tier: string;
  subscription_status: string;
  subscription_current_period_end: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('name, subscription_tier, subscription_status, subscription_current_period_end')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.name || '');
      }
    }
    load();
  }, []);

  async function handleSaveName() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const tierLabel = (tier: string) => {
    switch (tier) {
      case 'aurora': return 'Aurora';
      case 'full_moon': return 'Full Moon';
      default: return 'New Moon (Free)';
    }
  };

  return (
    <div className="app-shell min-h-screen aurora-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-white/74 hover:text-white transition-colors text-[0.9375rem]"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="flex-1" />
        <Logo size={28} />
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-8 sm:py-12 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-2xl sm:text-3xl text-white mb-8">
            Settings
          </h1>

          {/* Profile section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-white/74" />
              <h2 className="text-lg text-white/90 font-medium">Profile & preferences</h2>
            </div>

            <div className="app-card p-5 sm:p-6 space-y-5">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm text-white/72 mb-1.5">Email</label>
                <p className="text-base text-white/90">{email}</p>
              </div>

              {/* Name (editable) */}
              <div>
                <label htmlFor="name" className="block text-sm text-white/72 mb-1.5">
                  Display name
                </label>
                <div className="flex gap-3">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should Luna call you?"
                    className="flex-1 bg-white/5 border border-white/12 rounded-lg px-4 py-2.5 text-base text-white placeholder:text-white/58 focus:border-luna-rose/50 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/12 text-white/92 hover:bg-white/15 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Billing section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-white/74" />
              <h2 className="text-lg text-white/90 font-medium">Billing & plan</h2>
            </div>

            <div className="app-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/72 mb-0.5">Current plan</p>
                  <p className="text-base text-white/90 font-medium">
                    {profile ? tierLabel(profile.subscription_tier) : '—'}
                  </p>
                </div>
                {profile?.subscription_tier !== 'free' && profile?.subscription_current_period_end && (
                  <div className="text-right">
                    <p className="text-sm text-white/72 mb-0.5">Renews</p>
                    <p className="text-sm text-white/84">
                      {new Date(profile.subscription_current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <ManageSubscriptionButton />
              </div>
            </div>
          </section>

          {/* Privacy section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-white/74" />
              <h2 className="text-lg text-white/90 font-medium">Privacy controls</h2>
            </div>

            <div className="app-card divide-y divide-white/10 overflow-hidden">
              <PlaceholderRow
                icon={<Database className="h-4 w-4" aria-hidden="true" />}
                title="Data export"
                description="Download check-ins, transcripts, and Luna memory."
                status="Coming soon"
              />
              <PlaceholderRow
                icon={<Shield className="h-4 w-4" aria-hidden="true" />}
                title="Transcript retention"
                description="Choose how long voice and text transcripts are kept."
                status="Coming soon"
              />
              <PlaceholderRow
                icon={<User className="h-4 w-4" aria-hidden="true" />}
                title="AI memory"
                description="Review or clear what Luna remembers about your patterns."
                status="Coming soon"
              />
            </div>
          </section>

          {/* Reminders section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-white/74" />
              <h2 className="text-lg text-white/90 font-medium">Reminders</h2>
            </div>

            <div className="app-card divide-y divide-white/10 overflow-hidden">
              <PlaceholderRow
                icon={<Bell className="h-4 w-4" aria-hidden="true" />}
                title="Morning check-in"
                description="A gentle nudge to log how your day is starting."
                status="Off"
              />
              <PlaceholderRow
                icon={<Bell className="h-4 w-4" aria-hidden="true" />}
                title="Evening sleep reflection"
                description="Track sleep signals before patterns fade."
                status="Off"
              />
              <PlaceholderRow
                icon={<Bell className="h-4 w-4" aria-hidden="true" />}
                title="Weekly insight"
                description="A calm summary of what Luna noticed this week."
                status="Off"
              />
            </div>
          </section>

          {/* Sign out */}
          <section>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/74 hover:text-white hover:bg-white/5 transition-colors text-base w-full"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </section>
        </motion.div>
      </main>
    </div>
  );
}

function PlaceholderRow({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-luna-aurora-mint">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-white/92">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-white/66">{description}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/68">
        {status}
      </span>
    </div>
  );
}
