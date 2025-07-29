import { startPlaygroundWeb } from "@wp-playground/client";

// Define a type for the WordPress client
type WordPressClient = Awaited<ReturnType<typeof startPlaygroundWeb>>;

export function getWordPressClient() {
  if (typeof window === 'undefined') {
    throw new Error("WordPress client is only available in the browser");
  }

  const client = (window as { client?: WordPressClient }).client;
  if (!client) {
    throw new Error("WordPress client not initialized. Make sure the WordPressPlayground component is mounted.");
  }

  return client;
} 