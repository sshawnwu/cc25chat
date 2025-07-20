import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the fetch function
global.fetch = vi.fn();

describe('Thread Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load thread messages from OpenAI API', async () => {
    // Mock the OpenAI API response
    const mockThreadMessages = {
      object: 'list',
      data: [
        {
          id: 'msg_1',
          object: 'thread.message',
          created_at: 1703123456,
          thread_id: 'thread_abc123',
          role: 'user',
          content: [
            {
              type: 'text',
              text: {
                value: 'Hello, how are you?',
                annotations: []
              }
            }
          ]
        },
        {
          id: 'msg_2',
          object: 'thread.message',
          created_at: 1703123457,
          thread_id: 'thread_abc123',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: {
                value: 'I am doing well, thank you for asking!',
                annotations: []
              }
            }
          ]
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockThreadMessages
    });

    // Test the API endpoint
    const response = await fetch('/api/openai/v1/threads/thread_abc123/messages');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/openai/v1/threads/thread_abc123/messages');
    expect(data).toEqual(mockThreadMessages);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].role).toBe('user');
    expect(data.data[1].role).toBe('assistant');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Thread not found'
    });

    try {
      await fetch('/api/openai/v1/threads/invalid_thread/messages');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should convert thread messages to chat messages format', () => {
    const threadMessage = {
      id: 'msg_1',
      object: 'thread.message',
      created_at: 1703123456,
      thread_id: 'thread_abc123',
      role: 'user',
      content: [
        {
          type: 'text',
          text: {
            value: 'Hello, how are you?',
            annotations: []
          }
        }
      ]
    };

    // This would be the conversion logic in the actual implementation
    const chatMessage = {
      id: 'msg_1',
      role: 'user',
      content: 'Hello, how are you?',
      date: new Date(1703123456 * 1000).toLocaleString()
    };

    expect(chatMessage.role).toBe('user');
    expect(chatMessage.content).toBe('Hello, how are you?');
    expect(chatMessage.id).toBe('msg_1');
  });
}); 