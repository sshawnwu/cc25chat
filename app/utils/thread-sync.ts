import { getHeaders } from "../client/api";

/**
 * Thread synchronization utilities
 * This helps keep thread conversations in sync across different browsers
 */

let syncIntervals: Map<string, NodeJS.Timeout> = new Map();
let lastMessageCounts: Map<string, number> = new Map();

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
      const currentCount = lastMessageCounts.get(threadId) || 0;

      // Only update if we have new messages and the count has increased
      if (messages.length > currentCount) {
        lastMessageCounts.set(threadId, messages.length);

        // Convert thread messages to chat format
        const chatMessages = messages.map((msg: any) => {
          const content = Array.isArray(msg.content)
            ? msg.content.find((item: any) => item.type === "text")?.text
                ?.value || ""
            : msg.content || "";

          return {
            id: msg.id,
            role: msg.role,
            content: content,
            date: new Date(msg.created_at * 1000).toLocaleString(),
          };
        });

        onUpdate(chatMessages);
        console.log(
          `[Thread Sync] Synced ${messages.length} messages for thread: ${threadId}`,
        );
      }
    } catch (error) {
      console.error("[Thread Sync] Failed to sync thread:", threadId, error);
    }
  }, 10000); // Sync every 10 seconds (less aggressive)

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
    lastMessageCounts.delete(threadId);
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
  lastMessageCounts.clear();
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

/**
 * Manually trigger a sync for a thread
 */
export async function triggerThreadSync(
  threadId: string,
  onUpdate: (messages: any[]) => void,
) {
  try {
    const messages = await loadThreadMessages(threadId);
    onUpdate(messages);
    console.log(`[Thread Sync] Manual sync triggered for thread: ${threadId}`);
  } catch (error) {
    console.error(
      "[Thread Sync] Manual sync failed for thread:",
      threadId,
      error,
    );
  }
}
