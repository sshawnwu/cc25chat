# Manual Testing Guide for Thread Support

This guide will help you manually test the OpenAI thread support feature in a real environment.

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key with access to the Assistants API
2. **Thread ID**: You need a valid thread ID from OpenAI
3. **Running Application**: The ChatGPT Next Web application should be running

## Setup

### 1. Configure OpenAI API Key

1. Go to your application settings
2. Add your OpenAI API key
3. Ensure the API key has access to the Assistants API

### 2. Create a Test Thread

You can create a test thread using the OpenAI API or use an existing one:

```bash
# Using curl to create a thread
curl -X POST https://api.openai.com/v1/threads \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# Response will include a thread ID like: "thread_abc123def456"
```

### 3. Add Messages to the Thread

```bash
# Add a user message
curl -X POST https://api.openai.com/v1/threads/thread_abc123def456/messages \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Hello, can you help me with a coding problem?"
  }'

# Add an assistant message
curl -X POST https://api.openai.com/v1/threads/thread_abc123def456/messages \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "Of course! I would be happy to help you with your coding problem. What are you working on?"
  }'
```

## Testing Steps

### Test 1: Basic Thread Loading

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Visit the URL with thread_id parameter**:
   ```
   http://localhost:3000/chat?thread_id=thread_abc123def456
   ```

3. **Expected Results**:
   - ✅ A new chat session should be created
   - ✅ The session topic should show "Thread thread_abc123def456"
   - ✅ Previous messages from the thread should be displayed
   - ✅ You should see a toast notification: "Loaded thread: thread_abc123def456"

### Test 2: Continue Conversation

1. **After loading the thread**, type a new message
2. **Send the message**
3. **Expected Results**:
   - ✅ The new message should be sent to the AI
   - ✅ The AI should respond
   - ✅ The conversation should continue seamlessly

### Test 3: Error Handling

1. **Test with invalid thread ID**:
   ```
   http://localhost:3000/chat?thread_id=invalid_thread_id
   ```

2. **Expected Results**:
   - ✅ An error toast should appear: "Failed to load thread: invalid_thread_id"
   - ✅ A new empty session should be created
   - ✅ The application should continue to work normally

### Test 4: Network Error Handling

1. **Disconnect from the internet**
2. **Try to load a thread**
3. **Expected Results**:
   - ✅ An error should be handled gracefully
   - ✅ User should see an appropriate error message
   - ✅ Application should not crash

### Test 5: Multiple Threads

1. **Load different threads in separate tabs**:
   ```
   Tab 1: http://localhost:3000/chat?thread_id=thread_abc123
   Tab 2: http://localhost:3000/chat?thread_id=thread_def456
   ```

2. **Expected Results**:
   - ✅ Each tab should load its respective thread
   - ✅ Messages should be different between tabs
   - ✅ No interference between sessions

## Verification Checklist

### ✅ URL Parameter Handling
- [ ] Thread ID is correctly extracted from URL
- [ ] Application responds to thread_id parameter
- [ ] Parameter is removed from URL after processing

### ✅ API Integration
- [ ] Correct API endpoint is called
- [ ] API response is properly handled
- [ ] Error responses are handled gracefully

### ✅ Message Conversion
- [ ] Thread messages are converted to chat format
- [ ] Message content is preserved correctly
- [ ] Timestamps are converted properly
- [ ] Only user and assistant messages are included

### ✅ Session Management
- [ ] New session is created with thread ID
- [ ] Session topic reflects the thread
- [ ] Messages are loaded into the session
- [ ] Session can be continued normally

### ✅ User Experience
- [ ] Loading feedback is provided
- [ ] Success/error messages are shown
- [ ] Application remains responsive
- [ ] No crashes or freezes

### ✅ Error Handling
- [ ] Invalid thread IDs are handled
- [ ] Network errors are handled
- [ ] API errors are handled
- [ ] Graceful fallback to new session

## Troubleshooting

### Common Issues

1. **"Failed to load thread" error**:
   - Check if the thread ID is correct
   - Verify your API key has access to the thread
   - Check network connectivity

2. **Empty thread**:
   - The thread exists but has no messages
   - This is normal behavior

3. **Authentication errors**:
   - Verify your OpenAI API key is valid
   - Check if the API key has the necessary permissions

4. **Network errors**:
   - Check your internet connection
   - Verify the OpenAI API is accessible

### Debug Information

Enable browser developer tools to see detailed logs:

```javascript
// In browser console, you should see:
console.log("[Command] got thread_id from url: ", threadId);
console.log("[Thread] Loading thread messages...");
console.log("[Thread] Messages loaded successfully");
```

## Performance Testing

### Load Testing

1. **Test with large threads** (100+ messages):
   - Load a thread with many messages
   - Verify performance is acceptable
   - Check memory usage

2. **Test with concurrent requests**:
   - Open multiple tabs with different threads
   - Verify all load correctly
   - Check for any race conditions

### Memory Testing

1. **Monitor memory usage** when loading large threads
2. **Check for memory leaks** when switching between threads
3. **Verify cleanup** when closing sessions

## Browser Compatibility

Test the feature in different browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

Test on mobile devices:

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design
- [ ] Touch interactions

## Reporting Issues

If you find any issues during testing:

1. **Document the steps** to reproduce the issue
2. **Include the thread ID** (if not sensitive)
3. **Provide error messages** and console logs
4. **Specify browser and OS** information
5. **Include network conditions** if relevant

## Success Criteria

The feature is working correctly if:

- ✅ Threads load successfully with valid thread IDs
- ✅ Messages are displayed correctly
- ✅ Conversations can be continued
- ✅ Errors are handled gracefully
- ✅ Performance is acceptable
- ✅ User experience is smooth 