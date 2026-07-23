/**
 * API Client Tests
 */

import { apiClient } from '../../network/api-client';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should get health status', async () => {
      const mockResponse = { healthy: true, version: '1.18.3' };
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getHealth();

      expect(result).toEqual(mockResponse);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/api/health');
    });
  });

  describe('Sessions', () => {
    it('should get all sessions', async () => {
      const mockSessions = [
        { id: '1', title: 'Test Session', status: 'idle' },
        { id: '2', title: 'Another Session', status: 'busy' },
      ];
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: mockSessions });

      const result = await apiClient.getSessions();

      expect(result).toEqual(mockSessions);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/session');
    });

    it('should create a session', async () => {
      const mockSession = { id: '1', title: 'New Session', status: 'idle' };
      (apiClient as any).client.post = jest.fn().mockResolvedValue({ data: mockSession });

      const result = await apiClient.createSession({ title: 'New Session' });

      expect(result).toEqual(mockSession);
      expect((apiClient as any).client.post).toHaveBeenCalledWith('/session', { title: 'New Session' });
    });

    it('should delete a session', async () => {
      (apiClient as any).client.delete = jest.fn().mockResolvedValue({});

      await apiClient.deleteSession('1');

      expect((apiClient as any).client.delete).toHaveBeenCalledWith('/session/1');
    });
  });

  describe('Messages', () => {
    it('should get messages for a session', async () => {
      const mockMessages = [
        { id: '1', sessionID: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
      ];
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: mockMessages });

      const result = await apiClient.getMessages('1');

      expect(result).toEqual(mockMessages);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/session/1/message');
    });

    it('should send a message', async () => {
      const mockResponse = {
        info: { id: '1', role: 'assistant', sessionID: '1' },
        parts: [{ type: 'text', text: 'Response' }],
      };
      (apiClient as any).client.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const result = await apiClient.sendMessage('1', 'Hello');

      expect(result).toEqual(mockResponse);
      expect((apiClient as any).client.post).toHaveBeenCalledWith('/session/1/message', {
        parts: [{ type: 'text', text: 'Hello' }],
      });
    });
  });

  describe('Models', () => {
    it('should get all models', async () => {
      const mockModels = [
        { id: '1', name: 'Model 1', providerID: 'openai' },
        { id: '2', name: 'Model 2', providerID: 'anthropic' },
      ];
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: { data: mockModels } });

      const result = await apiClient.getModels();

      expect(result).toEqual(mockModels);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/api/model');
    });
  });

  describe('Files', () => {
    it('should list files', async () => {
      const mockFiles = [
        { name: 'file1.txt', path: 'file1.txt', type: 'file' },
        { name: 'dir1', path: 'dir1', type: 'directory' },
      ];
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: { data: mockFiles } });

      const result = await apiClient.listFiles();

      expect(result).toEqual(mockFiles);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/api/fs/list', {
        params: { path: '.' },
      });
    });

    it('should read file content', async () => {
      const mockContent = { content: 'file content', encoding: 'utf-8' };
      (apiClient as any).client.get = jest.fn().mockResolvedValue({ data: mockContent });

      const result = await apiClient.readFile('test.txt');

      expect(result).toEqual(mockContent);
      expect((apiClient as any).client.get).toHaveBeenCalledWith('/file/content', {
        params: { path: 'test.txt' },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (apiClient as any).client.get = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(apiClient.getHealth()).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout');
      (timeoutError as any).code = 'ECONNABORTED';
      (apiClient as any).client.get = jest.fn().mockRejectedValue(timeoutError);

      await expect(apiClient.getHealth()).rejects.toThrow('timeout');
    });
  });
});
