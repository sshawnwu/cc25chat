import { getHeaders } from "../client/api";

/**
 * Thread synchronization utilities
 * This helps keep thread conversations in sync across different browsers
 */

let syncIntervals: Map<string, NodeJS.Timeout> = new Map();

/**
 * Start syncing a thread - periodically reload messages from OpenAI
 */
export function startThreadSync(
  threadId: string,
  onUpdate: (messages: any[]) => void,
) {
  // Stop any existing sync for this thread
  stopThreadSync(threadId);

  // Start new sync interval
  const interval = setInterval(async () => {
    try {
      const messages = await loadThreadMessages(threadId);
      onUpdate(messages);
    } catch (error) {
      console.error("[Thread Sync] Failed to sync thread:", threadId, error);
    }
  }, 5000); // Sync every 5 seconds

  syncIntervals.set(threadId, interval);
  console.log("[Thread Sync] Started syncing thread:", threadId);
}

/**
 * Stop syncing a thread
 */
export function stopThreadSync(threadId: string) {
  const interval = syncIntervals.get(threadId);
  if (interval) {
    clearInterval(interval);
    syncIntervals.delete(threadId);
    console.log("[Thread Sync] Stopped syncing thread:", threadId);
  }
}

/**
 * Stop all thread syncing
 */
export function stopAllThreadSync() {
  syncIntervals.forEach((interval, threadId) => {
    clearInterval(interval);
    console.log("[Thread Sync] Stopped syncing thread:", threadId);
  });
  syncIntervals.clear();
}

/**
 * Load thread messages from OpenAI API
 */
async function loadThreadMessages(threadId: string) {
  const headers = getHeaders();
  headers["OpenAI-Beta"] = "assistants=v2";

  const response = await fetch(`/api/openai/v1/threads/${threadId}/messages`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch thread messages: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Check if a thread is being synced
 */
export function isThreadSyncing(threadId: string): boolean {
  return syncIntervals.has(threadId);
}

/**
 * Get all syncing thread IDs
 */
export function getSyncingThreadIds(): string[] {
  return Array.from(syncIntervals.keys());
}
