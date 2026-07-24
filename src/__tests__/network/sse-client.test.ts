import { SSEClient } from '../../network/sse-client';
import { storage } from '../../storage/mmkv';

jest.mock('../../storage/mmkv', () => ({
  storage: {
    getActiveProfile: jest.fn(),
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
  },
}));

const mockProfile = {
  id: '1', name: 'Test', url: 'https://example.com',
  authType: 'bearer' as const, authValue: 'token123', isActive: true,
};

function createMockFetch(overrides: {
  ok?: boolean; json?: unknown;
  bodyReads?: Array<{ done: boolean; value: Uint8Array | null }>;
} = {}) {
  const { ok = true, json = { healthy: true }, bodyReads } = overrides;
  const reader = bodyReads
    ? { getReader: jest.fn().mockReturnValue({ read: jest.fn().mockResolvedValueOnce(bodyReads[0]).mockResolvedValue({ done: true, value: null }) }) }
    : { getReader: jest.fn().mockReturnValue({ read: jest.fn().mockResolvedValue({ done: true, value: null }) }) };
  return jest.fn().mockResolvedValue({
    ok, status: ok ? 200 : 500,
    json: () => Promise.resolve(json),
    text: () => Promise.resolve(''),
    body: reader,
  });
}

describe('SSEClient', () => {
  let client: SSEClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getActiveProfile as jest.Mock).mockReturnValue(mockProfile);
    client = new SSEClient({
      maxRetries: 2, baseDelay: 100, maxDelay: 500,
      heartbeatInterval: 5000, healthTimeout: 500,
    });
  });

  afterEach(() => {
    client.disconnect();
  });

  describe('Connection States', () => {
    it('should start as disconnected', () => {
      expect(client.getState()).toBe('disconnected');
      expect(client.isConnected()).toBe(false);
    });

    it('should transition through connecting to connected', async () => {
      global.fetch = createMockFetch() as jest.Mock;
      const states: string[] = [];
      client.onStateChange((s) => states.push(s));

      const p = client.connect('session-1', 'https://example.com');
      expect(client.getState()).toBe('connecting');
      await p;
      expect(client.getState()).toBe('connected');
      expect(states).toContain('connecting');
      expect(states).toContain('connected');
    });

    it('should transition through error state when health check fails', async () => {
      const states: string[] = [];
      client.onStateChange((s) => states.push(s));
      global.fetch = createMockFetch({ ok: false, json: { healthy: false } }) as jest.Mock;

      await client.connect();
      expect(states).toContain('error');
    });

    it('should not reconnect when already connected', async () => {
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      expect(client.isConnected()).toBe(true);
      (global.fetch as jest.Mock).mockClear();
      await client.connect();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should reset state on disconnect', async () => {
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      client.disconnect();
      expect(client.getState()).toBe('disconnected');
    });
  });

  describe('Event Handling', () => {
    it('should add and trigger event listeners', async () => {
      const eventData = { type: 'session.created', properties: { id: '1', title: 'Test' } };
      const encoder = new TextEncoder();
      global.fetch = createMockFetch({
        bodyReads: [{ done: false, value: encoder.encode(
          `event: session.created\ndata: ${JSON.stringify(eventData)}\n\n`
        )}],
      }) as jest.Mock;

      await client.connect();
      const handler = jest.fn();
      client.onEvent(handler);
      await Promise.resolve();
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should return cleanup function from onEvent', () => {
      const handler = jest.fn();
      const cleanup = client.onEvent(handler);
      cleanup();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should return cleanup function from onStateChange', () => {
      const handler = jest.fn();
      const cleanup = client.onStateChange(handler);
      cleanup();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection', () => {
    it('should schedule reconnect on error', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      global.fetch = createMockFetch({ ok: false, json: { healthy: false } }) as jest.Mock;

      await client.connect();
      expect(setTimeoutSpy).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should go disconnected when maxRetries is zero', async () => {
      client = new SSEClient({ maxRetries: 0, baseDelay: 10, maxDelay: 100 });
      (storage.getActiveProfile as jest.Mock).mockReturnValue(mockProfile);
      global.fetch = createMockFetch({ ok: false, json: { healthy: false } }) as jest.Mock;

      await client.connect();
      expect(client.getState()).toBe('disconnected');
    });
  });

  describe('Heartbeat', () => {
    it('should start heartbeat on connect', async () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      expect(setIntervalSpy).toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });

    it('should stop heartbeat on disconnect', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      client.disconnect();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Auth Header Injection', () => {
    it('should include Bearer token', async () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue({ ...mockProfile, authType: 'bearer', authValue: 'test-token' });
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      const call = (global.fetch as jest.Mock).mock.calls.find((c: any[]) => String(c[0]).includes('/api/health'));
      expect(call[1].headers.Authorization).toBe('Bearer test-token');
    });

    it('should include Basic auth', async () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue({ ...mockProfile, authType: 'basic', authValue: 'user:pass' });
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      const call = (global.fetch as jest.Mock).mock.calls.find((c: any[]) => String(c[0]).includes('/api/health'));
      expect(call[1].headers.Authorization).toBe('Basic ' + btoa('user:pass'));
    });

    it('should include API key header', async () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue({ ...mockProfile, authType: 'apikey', authValue: 'my-api-key' });
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      const call = (global.fetch as jest.Mock).mock.calls.find((c: any[]) => String(c[0]).includes('/api/health'));
      expect(call[1].headers['X-API-Key']).toBe('my-api-key');
    });
  });

  describe('Switch Session', () => {
    it('should not switch if session id is the same', async () => {
      global.fetch = createMockFetch() as jest.Mock;
      await client.connect();
      (global.fetch as jest.Mock).mockClear();
      client.switchSession(null);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clear state on disconnect', () => {
      client.disconnect();
      expect(client.getState()).toBe('disconnected');
    });
  });
});
