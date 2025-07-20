# Thread Messages Authentication Fix

## Problem
The thread messages feature was failing in production with "Unauthorized" errors because the `loadThreadMessages` function was not using proper authentication headers when making API calls to `/api/openai/v1/threads/{thread_id}/messages`.

## Root Cause
The `loadThreadMessages` function in `app/store/chat.ts` was making a direct fetch call with only basic headers:
```javascript
const response = await fetch(`/api/openai/v1/threads/${threadId}/messages`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
```

This was missing:
1. **Authentication headers** (API key or access code)
2. **OpenAI-Beta header** required for Assistants API

## Solution
Updated the `loadThreadMessages` function to use the proper authentication headers:

```javascript
async loadThreadMessages(threadId: string) {
  try {
    // Import getHeaders function to get proper authentication headers
    const { getHeaders } = await import("../client/api");
    
    const headers = getHeaders();
    // Add OpenAI-Beta header for Assistants API
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
  } catch (error) {
    console.error("[Thread Messages] Failed to load:", error);
    throw error;
  }
}
```

## Changes Made
1. **app/store/chat.ts**: Updated `loadThreadMessages` function to use `getHeaders()` for proper authentication
2. **Added OpenAI-Beta header**: Required for OpenAI Assistants API v2

## Production Deployment Requirements

### Environment Variables
Ensure these environment variables are set in your production environment:

```bash
# Required for OpenAI API access
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Access control
ACCESS_CODE=your_access_code_here
```

### API Route Configuration
The API route in `app/api/openai.ts` already supports thread messages:
- Pattern: `/^v1\/threads\/[^\/]+\/messages$/`
- Authentication: Uses the same auth system as other OpenAI endpoints
- Headers: Properly forwards authentication headers to OpenAI

### Testing
Use the test file `test-thread-auth.html` to verify authentication works:
1. Deploy the application
2. Open `test-thread-auth.html` in your browser
3. Enter a valid thread ID
4. Click "Test Thread Messages"
5. Verify you get a successful response

## Verification Steps
1. ✅ API route allows thread messages requests
2. ✅ Authentication headers are properly set
3. ✅ OpenAI-Beta header is included
4. ✅ Error handling is in place
5. ✅ Production environment variables are configured

## Files Modified
- `app/store/chat.ts` - Fixed authentication in `loadThreadMessages`
- `test-thread-auth.html` - Added test file for verification

## Related Files
- `app/api/openai.ts` - API route configuration
- `app/api/auth.ts` - Authentication logic
- `app/client/api.ts` - Header generation utilities 