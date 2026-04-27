import { redirect } from 'next/navigation';
import { loadInitialMessages } from './load-messages';
import ChatClient from './ChatClient';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const { userId, messages } = await loadInitialMessages();

  if (!userId) redirect('/login');

  return <ChatClient initialMessages={messages} />;
}
