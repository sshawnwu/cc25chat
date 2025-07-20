# ASSISTANT_ID Environment Variable Setup

This document explains how to set up and use the `ASSISTANT_ID` environment variable for OpenAI Assistants API integration.

## Overview

The `ASSISTANT_ID` environment variable is used to specify which OpenAI Assistant should be used when creating runs in threads. This allows the application to use a specific assistant with predefined instructions, tools, and model configuration.

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key with access to the Assistants API
2. **OpenAI Assistant**: You need to create an assistant in the OpenAI platform

## Step 1: Create an OpenAI Assistant

### Using OpenAI Platform

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Click "Create" to create a new assistant
3. Configure your assistant:
   - **Name**: Give your assistant a descriptive name
   - **Instructions**: Define how your assistant should behave
   - **Model**: Choose the model (e.g., gpt-4, gpt-3.5-turbo)
   - **Tools**: Add any tools your assistant should use
4. Click "Save" to create the assistant
5. Copy the Assistant ID (it starts with `asst_`)

### Using OpenAI API

```bash
curl -X POST https://api.openai.com/v1/assistants \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "name": "My Chat Assistant",
    "instructions": "You are a helpful assistant that can answer questions and provide information.",
    "model": "gpt-4",
    "tools": []
  }'
```

The response will include an `id` field with your assistant ID.

## Step 2: Configure Environment Variable

### Local Development (.env.local)

Create or update your `.env.local` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
ASSISTANT_ID=asst_your_assistant_id_here

# Other configuration...
BASE_URL=https://api.openai.com
```

### Production Deployment

#### Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following environment variable:
   - **Name**: `ASSISTANT_ID`
   - **Value**: `asst_your_assistant_id_here`
   - **Environment**: Production (and Preview if needed)

#### Docker

Update your `docker-compose.yml` or Docker run command:

```yaml
version: '3.8'
services:
  app:
    environment:
      - OPENAI_API_KEY=your_openai_api_key_here
      - ASSISTANT_ID=asst_your_assistant_id_here
```

#### Other Platforms

Add the `ASSISTANT_ID` environment variable to your deployment platform's configuration.

## Step 3: Verify Configuration

### Test Page

Use the built-in test page to verify your configuration:

```
http://localhost:3001/test-assistant-id.html
```

This page will:
1. Check if `ASSISTANT_ID` is properly configured
2. Test thread creation and message sending
3. Verify assistant responses

### Manual Testing

1. Start your application
2. Visit the test page
3. Click "Check Configuration"
4. If successful, you should see "✅ Assistant ID is configured and working"

## Usage in Application

### Thread Sessions

When using thread sessions (with `thread_id` parameter), the application will:

1. Send user messages to the thread
2. Create a run using the configured assistant
3. Poll for run completion
4. Retrieve and display the assistant's response

### Example URL

```
http://localhost:3001/?thread_id=thread_abc123def456
```

## Troubleshooting

### Common Issues

#### 1. "ASSISTANT_ID environment variable is not set"

**Solution**: Make sure you've added the `ASSISTANT_ID` environment variable to your configuration.

#### 2. "Assistant not found" error

**Solution**: Verify that:
- The assistant ID is correct
- The assistant exists in your OpenAI account
- Your API key has access to the assistant

#### 3. "Run failed" error

**Solution**: Check the run status for specific error messages. Common causes:
- Assistant configuration issues
- Model availability
- API rate limits

### Debug Information

The application logs detailed information about assistant usage:

```
[Thread] Using assistant ID: asst_abc123def456
[Thread] Run created: run_xyz789ghi012
[Thread] Run status: in_progress
[Thread] Run status: completed
[Thread] Assistant response received: Hello! How can I help you today?...
```

## Security Considerations

1. **Keep Assistant ID Private**: The assistant ID should be treated as sensitive information
2. **Environment Variables**: Never commit assistant IDs to version control
3. **Access Control**: Ensure only authorized users can access your assistant

## Advanced Configuration

### Multiple Assistants

You can create multiple assistants for different use cases:

```bash
# Development assistant
ASSISTANT_ID_DEV=asst_dev_assistant_id

# Production assistant  
ASSISTANT_ID_PROD=asst_prod_assistant_id
```

### Assistant Customization

You can customize your assistant with:

- **Instructions**: Define behavior and personality
- **Tools**: Add function calling capabilities
- **Model**: Choose different models for different use cases
- **Metadata**: Add custom metadata for organization

## API Reference

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ASSISTANT_ID` | OpenAI Assistant ID | Yes | `asst_abc123def456` |
| `OPENAI_API_KEY` | OpenAI API Key | Yes | `sk-...` |

### Related Endpoints

- `POST /api/openai/v1/threads` - Create thread
- `POST /api/openai/v1/threads/{thread_id}/messages` - Add message
- `POST /api/openai/v1/threads/{thread_id}/runs` - Create run
- `GET /api/openai/v1/threads/{thread_id}/runs/{run_id}` - Check run status

## Support

If you encounter issues:

1. Check the application logs for error messages
2. Verify your environment variable configuration
3. Test with the provided test page
4. Check OpenAI API documentation for assistant-related issues 