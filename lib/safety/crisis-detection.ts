export type CrisisLevel = 'none' | 'yellow' | 'amber' | 'red';

export interface CrisisAssessment {
  level: CrisisLevel;
  category: 'self_harm' | 'medical' | 'emotional' | 'none';
  matched_terms: string[];
}

export interface CrisisLogInput {
  user_id: string;
  level: Exclude<CrisisLevel, 'none'>;
  category: string;
  matched_terms: string[];
  message_preview: string;
  source: 'chat' | 'checkin';
}

const RED_PATTERNS = [
  /\b(kill(ing)?\s+my\s*self)\b/i,
  /\b(end(ing)?\s+(my|this)\s+life)\b/i,
  /\b(take\s+my\s+(own\s+)?life)\b/i,
  /\b(want\s+to\s+die)\b/i,
  /\b(better\s+off\s+dead)\b/i,
  /\b(no\s+reason\s+to\s+live)\b/i,
  /\b(don'?t\s+want\s+to\s+(live|be\s+here))\b/i,
  /\b(suicid(e|al))\b/i,
  /\b(hurt(ing)?\s+my\s*self)\b/i,
  /\b(cut(ting)?\s+my\s*self)\b/i,
  /\b(overdos(e|ing))\b/i,
  /\b(jump\s+off|hang\s+my\s*self|shoot\s+my\s*self)\b/i,
];

const AMBER_PATTERNS = [
  /\b(can'?t\s+(go\s+on|do\s+this\s+any(more| longer)))\b/i,
  /\b(give\s+up\s+on\s+(life|everything))\b/i,
  /\b(nothing\s+(matters|to\s+live\s+for))\b/i,
  /\b(hopeless(ness)?)\b/i,
  /\b(completely\s+(alone|broken))\b/i,
  /\b(i\s+hate\s+my\s+life)\b/i,
  /\b(no\s+(way\s+out|point))\b/i,
  /\b(want\s+it\s+(all\s+)?to\s+end)\b/i,
  /\b(can'?t\s+(take|bear)\s+it\s+any(more| longer))\b/i,
];

const YELLOW_PATTERNS = [
  /\b(chest\s+pain)\b/i,
  /\b(can'?t\s+breathe)\b/i,
  /\b(trouble\s+breathing)\b/i,
  /\b(severe\s+bleeding)\b/i,
  /\b(hemorrhag(e|ing))\b/i,
  /\b(stroke\s+(symptoms|signs))\b/i,
  /\b(numb(ness)?\s+on\s+one\s+side)\b/i,
  /\b(face\s+(dropping|drooping))\b/i,
  /\b(slurred\s+speech)\b/i,
  /\b(passing\s+out|blacking\s+out)\b/i,
];

const NEGATION_PATTERNS = [
  /\b(not|never|don'?t|do\s+not|wouldn'?t)\s+(want\s+to\s+die|suicidal|hurt\s+my\s*self)\b/i,
  /\b(i\s+am\s+not\s+suicidal)\b/i,
  /\b(asking\s+for\s+a\s+friend)\b/i,
];

function collectHits(text: string, patterns: RegExp[]) {
  return patterns
    .map((pattern) => text.match(pattern)?.[0])
    .filter((match): match is string => Boolean(match));
}

export function detectCrisis(text: string): CrisisAssessment {
  if (!text || typeof text !== 'string') {
    return { level: 'none', category: 'none', matched_terms: [] };
  }

  const normalized = text.toLowerCase();
  const isNegated = NEGATION_PATTERNS.some((pattern) => pattern.test(normalized));
  const redHits = collectHits(normalized, RED_PATTERNS);
  const amberHits = collectHits(normalized, AMBER_PATTERNS);
  const yellowHits = collectHits(normalized, YELLOW_PATTERNS);

  if (redHits.length > 0 && !isNegated) {
    return { level: 'red', category: 'self_harm', matched_terms: redHits };
  }

  if (amberHits.length > 0 && !isNegated) {
    return { level: 'amber', category: 'emotional', matched_terms: amberHits };
  }

  if (yellowHits.length > 0) {
    return { level: 'yellow', category: 'medical', matched_terms: yellowHits };
  }

  return { level: 'none', category: 'none', matched_terms: [] };
}

export function crisisResponse(assessment: CrisisAssessment): string {
  if (assessment.level === 'red') {
    return `I hear you. What you're carrying sounds unbearable, and I am so grateful you said it out loud to me.

Please, right now, reach someone who can be with you in a way I cannot. You don't have to explain yourself. You only have to call.

988 - Suicide & Crisis Lifeline (US), call or text, 24/7
741741 - Crisis Text Line, text HOME
116 123 - Samaritans (UK & Ireland)
13 11 14 - Lifeline Australia
911 or your local emergency number if you are in immediate danger

I will be here when you come back. You are not alone in this night. Will you reach out to one of them now?`;
  }

  if (assessment.level === 'amber') {
    return `What you're feeling sounds very heavy. I want to sit with it gently, and I also want to make sure someone who can hold this with you knows.

If the weight gets sharper, please reach out:

988 - Suicide & Crisis Lifeline (US), call or text
741741 - Crisis Text Line, text HOME
116 123 - Samaritans (UK & Ireland)

Talking to a therapist or your doctor when things feel this heavy can help, not because you're broken, but because you deserve care. Would you like to tell me more about what's weighing on you?`;
  }

  if (assessment.level === 'yellow') {
    return `What you're describing could be serious, and I want you safe. Please call your doctor right away, or if symptoms are severe, go to the nearest emergency room or call 911 (US), 999 (UK), or your local emergency number.

I am a companion, not a clinician. This is the kind of moment that needs human hands, not my words. I'll be here when you're safe.`;
  }

  return '';
}
