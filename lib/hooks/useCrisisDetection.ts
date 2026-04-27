'use client';

import { useEffect, useState } from 'react';
import type { UIMessage } from 'ai';

const RESOURCE_KEYWORDS = ['988', '741741', 'Crisis Text Line', 'Samaritans'];

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('');
}

export function useCrisisDetection(messages: UIMessage[]) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [lastTriggerId, setLastTriggerId] = useState<string | null>(null);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.id === lastTriggerId) return;

    const content = messageText(last);
    const hasResources = RESOURCE_KEYWORDS.some((keyword) => content.includes(keyword));

    if (hasResources) {
      setMessage(content);
      setOpen(true);
      setLastTriggerId(last.id);
    }
  }, [messages, lastTriggerId]);

  return {
    open,
    message,
    close: () => setOpen(false),
  };
}
