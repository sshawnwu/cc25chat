# OpenAI Thread Support Implementation

This document describes the implementation of OpenAI thread support in ChatGPT Next Web, allowing users to load and continue conversations from OpenAI threads.

## Overview

The feature enables users to pass a `thread_id` parameter in the URL to automatically load messages from an OpenAI thread and continue the conversation seamlessly.

## Implementation Details

### 1. API Route Updates

**File: `app/api/openai.ts`**

- Added support for thread messages path pattern: `v1/threads/{thread_id}/messages`
- Updated path validation to allow dynamic thread paths
- Maintains existing security and authentication

```typescript
// Added to ALLOWED_PATH
const ALLOWED_PATH = new Set([
  ...Object.values(OpenaiPath),
  "v1/threads/{thread_id}/messages"
]);

// Updated path validation
const isThreadMessages = subpath.match(/^v1\/threads\/[^\/]+\/messages$/);
if (!ALLOWED_PATH.has(subpath) && !isThreadMessages) {
  // ... error handling
}
```

### 2. Chat Session Updates

**File: `app/store/chat.ts`**

- Added `threadId` field to `ChatSession` interface
- Added `loadThreadMessages()` method to fetch thread messages from OpenAI API
- Added `newSessionWithThread()` method to create sessions with thread messages

```typescript
export interface ChatSession {
  id: string;
  topic: string;
  threadId?: string; // New field for OpenAI thread ID
  // ... other fields
}

// New method to load thread messages
async loadThreadMessages(threadId: string) {
  const response = await fetch(`/api/openai/v1/threads/${threadId}/messages`);
  const data = await response.json();
  return data.data || [];
}

// New method to create session with thread
async newSessionWithThread(threadId: string, mask?: Mask) {
  const session = createEmptySession();
  session.threadId = threadId;
  
  // Load and convert thread messages
  const threadMessages = await get().loadThreadMessages(threadId);
  const chatMessages = threadMessages
    .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
    .map((msg: any) => createMessage({
      role: msg.role,
      content: msg.content[0]?.text || "",
      date: new Date(msg.created_at * 1000).toLocaleString(),
    }));
  
  session.messages = chatMessages;
  // ... session creation logic
}
```

### 3. Frontend Integration

**File: `app/components/chat.tsx`**

- Added `thread_id` command handler to `useCommand` hook
- Automatically loads thread messages when `thread_id` parameter is present in URL

```typescript
useCommand({
  // ... existing commands
  thread_id: async (threadId) => {
    console.log("[Command] got thread_id from url: ", threadId);
    try {
      await chatStore.newSessionWithThread(threadId);
      showToast(`Loaded thread: ${threadId}`);
    } catch (error) {
      console.error("[Thread] Failed to load thread:", error);
      showToast(`Failed to load thread: ${threadId}`);
    }
  },
});
```

### 4. Constants Update

**File: `app/constant.ts`**

- Added `ThreadMessagesPath` to `OpenaiPath` object

```typescript
export const OpenaiPath = {
  // ... existing paths
  ThreadMessagesPath: "v1/threads/{thread_id}/messages",
};
```

## Usage

### URL Parameter

Users can load a thread by adding the `thread_id` parameter to the URL:

```
https://your-app.com/chat?thread_id=thread_abc123def456
```

### API Endpoint

The application uses the OpenAI Thread Messages API:

```
GET /api/openai/v1/threads/{thread_id}/messages
```

### Query Parameters

The API supports standard OpenAI thread messages query parameters:

- `limit` - Number of messages to return (default: 20, max: 100)
- `order` - Sort order: `asc` or `desc` (default: `desc`)
- `after` - Cursor for pagination
- `before` - Cursor for pagination

## Error Handling

- **API Errors**: If the thread cannot be loaded, the application shows an error toast and creates a new empty session
- **Invalid Thread ID**: Proper error messages are displayed to the user
- **Network Issues**: Graceful handling of network failures

## Message Conversion

Thread messages from OpenAI are converted to the application's chat message format:

```typescript
// OpenAI thread message format
{
  id: 'msg_1',
  role: 'user',
  content: [{ type: 'text', text: { value: 'Hello' } }],
  created_at: 1703123456
}

// Converted to chat message format
{
  id: 'msg_1',
  role: 'user',
  content: 'Hello',
  date: '12/21/2023, 10:30:56 AM'
}
```

## Features

### Supported Features

- ✅ Load thread messages automatically
- ✅ Display conversation history
- ✅ Continue conversation seamlessly
- ✅ Support for all existing chat features (streaming, tools, etc.)
- ✅ Error handling and user feedback
- ✅ URL parameter support

### Limitations

- Only supports text messages (images and other content types may need additional handling)
- Thread messages are loaded once at session creation
- No real-time sync with the original thread

## Testing

### Manual Testing

1. Create a thread in OpenAI
2. Add some messages to the thread
3. Visit `https://your-app.com/chat?thread_id=your_thread_id`
4. Verify that messages are loaded and displayed correctly

### Automated Testing

See `test/thread-support.test.ts` for unit tests covering:
- API endpoint functionality
- Message conversion logic
- Error handling

## Future Enhancements

Potential improvements for future versions:

1. **Real-time Sync**: Keep thread messages synchronized with the original thread
2. **Message Types**: Support for images, files, and other content types
3. **Thread Management**: Create, delete, and manage threads directly from the app
4. **Bulk Operations**: Load multiple threads or merge threads
5. **Thread Search**: Search through thread messages
6. **Thread Export**: Export thread conversations

## Security Considerations

- Thread access is controlled by OpenAI API authentication
- Users can only access threads they have permission to view
- API keys are properly secured and not exposed to the client
- Rate limiting and error handling prevent abuse

## Troubleshooting

### Common Issues

1. **Thread not found**: Verify the thread ID is correct and you have access to it
2. **Authentication errors**: Check that your OpenAI API key is valid
3. **Network errors**: Ensure the application can reach the OpenAI API
4. **Empty thread**: The thread exists but has no messages

### Debug Information

Enable debug logging to see detailed information about thread loading:

```typescript
console.log("[Thread] Loading thread:", threadId);
console.log("[Thread] API response:", response);
console.log("[Thread] Converted messages:", chatMessages);
```

## API Reference

### OpenAI Thread Messages API

For complete API documentation, see: https://platform.openai.com/docs/api-reference/messages/listMessages

### Application API

- `GET /api/openai/v1/threads/{thread_id}/messages` - Load thread messages
- Query parameters: `limit`, `order`, `after`, `before`
- Returns: OpenAI thread messages response format 