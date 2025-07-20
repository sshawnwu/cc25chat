# Thread Synchronization Test Plan

## Overview
This document outlines the testing strategy for the thread synchronization feature that ensures chat conversations are synchronized across different browser sessions.

## Implementation Summary

### What We've Implemented

1. **Thread Sync Utility** (`app/utils/thread-sync.ts`)
   - `startThreadSync()`: Starts periodic polling of thread messages
   - `stopThreadSync()`: Stops syncing for a specific thread
   - `stopAllThreadSync()`: Stops all thread syncing
   - Polls every 5 seconds to fetch latest messages from OpenAI

2. **Enhanced Chat Store** (`app/store/chat.ts`)
   - `newSessionWithThread()`: Now starts thread sync when creating thread sessions
   - `handleThreadMessage()`: Uses regular chat API but reloads from thread after completion
   - `handleRegularMessage()`: Standard chat flow for non-thread sessions

3. **Thread Message Loading** (`app/store/chat.ts`)
   - `loadThreadMessages()`: Fetches messages from OpenAI thread API
   - Proper authentication headers with `OpenAI-Beta: assistants=v2`

## Test Scenarios

### Test 1: Basic Thread Loading
**Objective**: Verify that thread messages load correctly from OpenAI

**Steps**:
1. Open the app with a valid thread ID: `http://localhost:3000/?thread_id=thread_abc123`
2. Check that messages from the thread are displayed
3. Verify console logs show successful thread loading

**Expected Result**: Thread messages should load and display correctly

### Test 2: Cross-Browser Synchronization
**Objective**: Verify that messages sent in one browser appear in another browser

**Steps**:
1. Open the app in Browser A with thread ID
2. Open the app in Browser B with the same thread ID
3. Send a message in Browser A
4. Check if the message appears in Browser B within 5 seconds

**Expected Result**: Messages should sync across browsers automatically

### Test 3: Thread Sync Polling
**Objective**: Verify that the 5-second polling mechanism works

**Steps**:
1. Open the test page: `http://localhost:3000/test-thread-sync.html`
2. Enter a thread ID and start sync
3. Send messages from another browser/session
4. Monitor the debug log for sync messages

**Expected Result**: Should see sync logs every 5 seconds showing message count updates

### Test 4: Error Handling
**Objective**: Verify graceful handling of API errors

**Steps**:
1. Try to load a non-existent thread ID
2. Check error handling and user feedback
3. Verify sync stops gracefully on errors

**Expected Result**: Should show appropriate error messages and not crash

### Test 5: Memory Management
**Objective**: Verify that sync intervals are properly cleaned up

**Steps**:
1. Open multiple thread sessions
2. Close browser tabs/windows
3. Check that sync intervals are stopped

**Expected Result**: No memory leaks from abandoned intervals

## Manual Testing Instructions

### Using the Test Page

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open test page**:
   ```
   http://localhost:3000/test-thread-sync.html
   ```

3. **Test cross-browser sync**:
   - Open the test page in two different browsers
   - Enter the same thread ID in both
   - Start sync in both browsers
   - Send messages in one browser
   - Verify they appear in the other browser

### Using the Main App

1. **Open thread session**:
   ```
   http://localhost:3000/?thread_id=YOUR_THREAD_ID
   ```

2. **Test message sending**:
   - Send a message in the chat interface
   - Check that it appears in the thread
   - Open the same thread in another browser
   - Verify the message syncs

## Expected Behavior

### When Opening a Thread Session
- Thread messages should load from OpenAI API
- Thread sync should start automatically (every 5 seconds)
- Console should show sync logs

### When Sending Messages
- Messages should be sent via regular chat API
- After completion, thread messages should be reloaded
- New messages should appear in all open browser sessions

### When Switching Between Sessions
- Thread sync should continue for active thread sessions
- Non-thread sessions should work normally

## Debugging

### Console Logs to Look For
- `[Thread Session] Loading thread messages for: thread_id`
- `[Thread Sync] Started syncing thread: thread_id`
- `[Thread Sync] Synced X messages`
- `[Thread Message] Error: ...` (if errors occur)

### Common Issues
1. **"Unauthorized" errors**: Check API key configuration
2. **Messages not syncing**: Check network connectivity and API responses
3. **High CPU usage**: Check for multiple sync intervals running

## Performance Considerations

- Sync interval: 5 seconds (configurable)
- API calls: Only for thread sessions
- Memory usage: Sync intervals are cleaned up on session close
- Network usage: Minimal - only thread message fetches

## Future Improvements

1. **WebSocket support**: Real-time updates instead of polling
2. **Optimistic updates**: Show messages immediately, sync in background
3. **Conflict resolution**: Handle concurrent edits
4. **Offline support**: Queue messages when offline

## Conclusion

The thread synchronization feature should now work correctly across different browser sessions. The key improvements are:

1. **Automatic sync**: Thread sessions automatically start syncing
2. **Cross-browser compatibility**: Messages sync across different browsers
3. **Error handling**: Graceful handling of API errors
4. **Memory management**: Proper cleanup of sync intervals

Test the implementation using the provided test scenarios and report any issues found. 