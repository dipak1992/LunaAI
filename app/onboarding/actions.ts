'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const onboardingSchema = z.object({
  name: z.string().min(1, 'A name is needed, even a nickname.'),
  age: z.number().int().min(18).max(120).optional(),
  last_period: z.string().optional(), // ISO date or 'unsure'
  symptoms: z.array(z.string()).optional(),
  intention: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(data: OnboardingData) {
  const parsed = onboardingSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      name: parsed.data.name,
      birth_year: parsed.data.age
        ? new Date().getFullYear() - parsed.data.age
        : null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  // Store symptoms and intention as initial memories
  if (parsed.data.symptoms && parsed.data.symptoms.length > 0) {
    await (supabase as any).from('user_memory').insert({
      user_id: user.id,
      memory_type: 'pattern',
      content: `Initial symptoms reported during onboarding: ${parsed.data.symptoms.join(', ')}`,
      confidence: 0.8,
    });
  }

  if (parsed.data.intention) {
    await (supabase as any).from('user_memory').insert({
      user_id: user.id,
      memory_type: 'goal',
      content: parsed.data.intention,
      confidence: 0.9,
    });
  }

  if (parsed.data.last_period && parsed.data.last_period !== 'unsure') {
    await (supabase as any).from('user_memory').insert({
      user_id: user.id,
      memory_type: 'personal',
      content: `Last period reported: ${parsed.data.last_period}`,
      confidence: 0.7,
    });
  }

  redirect('/dashboard');
}
