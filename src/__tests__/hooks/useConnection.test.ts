import { renderHook, act } from '@testing-library/react-native';
import { useConnection } from '../../hooks/useConnection';
import { getSSEClient } from '../../network/sse-client';
import { storage } from '../../storage/mmkv';

jest.mock('../../network/sse-client', () => ({
  getSSEClient: jest.fn(),
}));

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

function createMockClient() {
  return {
    onEvent: jest.fn().mockReturnValue(jest.fn()),
    onStateChange: jest.fn().mockReturnValue(jest.fn()),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    switchSession: jest.fn(),
    getState: jest.fn().mockReturnValue('disconnected'),
    isConnected: jest.fn().mockReturnValue(false),
  };
}

const testProfile = { id: '1', url: 'http://test.com', authType: 'none' as const, authValue: '', name: 'Test', isActive: true };

describe('useConnection', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState(useAppStore.getInitialState());
    mockClient = createMockClient();
    (getSSEClient as jest.Mock).mockReturnValue(mockClient);
    (storage.getActiveProfile as jest.Mock).mockReturnValue(null);
  });

  describe('Connection Lifecycle', () => {
    it('should return initial connection state', () => {
      const { result } = renderHook(() => useConnection());
      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
    });

    it('should call connect on sseClient when connect is called with profile', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      const { result } = renderHook(() => useConnection());
      act(() => {
        result.current.connect('session-1');
      });

      expect(mockClient.onEvent).toHaveBeenCalled();
      expect(mockClient.onStateChange).toHaveBeenCalled();
      expect(mockClient.connect).toHaveBeenCalledWith('session-1', 'http://test.com');
    });

    it('should not connect when no active profile', () => {
      const { result } = renderHook(() => useConnection());
      act(() => {
        result.current.connect();
      });
      expect(mockClient.connect).not.toHaveBeenCalled();
    });

    it('should call disconnect on sseClient', () => {
      const { result } = renderHook(() => useConnection());
      act(() => {
        result.current.disconnect();
      });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should call switchSession on sseClient', () => {
      const { result } = renderHook(() => useConnection());
      act(() => {
        result.current.switchSession('session-2');
      });
      expect(mockClient.switchSession).toHaveBeenCalledWith('session-2');
    });
  });

  describe('Event Dispatching to Store', () => {
    it('should handle session.created events', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());

      const eventHandler = mockClient.onEvent.mock.calls[0][0];
      const session = { id: 's1', title: 'New', status: 'idle' as const, directory: '/test', createdAt: '', updatedAt: '' };

      act(() => {
        eventHandler({ type: 'session.created', properties: session });
      });

      const { useAppStore } = require('../../store');
      expect(useAppStore.getState().sessions).toContainEqual(session);
    });

    it('should handle message.created events', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());

      const eventHandler = mockClient.onEvent.mock.calls[0][0];
      const message = { id: 'm1', sessionID: 's1', role: 'user' as const, parts: [], createdAt: '' };

      act(() => {
        eventHandler({ type: 'message.created', properties: message });
      });

      const { useAppStore } = require('../../store');
      expect(useAppStore.getState().messages.s1).toContainEqual(message);
    });

    it('should handle permission.requested events', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());

      const eventHandler = mockClient.onEvent.mock.calls[0][0];
      const permission = { id: 'p1', sessionID: 's1', permission: 'read', state: 'pending' as const, createdAt: '' };

      act(() => {
        eventHandler({ type: 'permission.requested', properties: permission });
      });

      const { useAppStore } = require('../../store');
      expect(useAppStore.getState().pendingPermissions).toContainEqual(permission);
    });

    it('should handle question.asked events', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());

      const eventHandler = mockClient.onEvent.mock.calls[0][0];
      const question = { id: 'q1', sessionID: 's1', question: 'Allow?', state: 'pending' as const, createdAt: '' };

      act(() => {
        eventHandler({ type: 'question.asked', properties: question });
      });

      const { useAppStore } = require('../../store');
      expect(useAppStore.getState().pendingQuestions).toContainEqual(question);
    });

    it('should update connection state on state change', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());

      const stateHandler = mockClient.onStateChange.mock.calls[0][0];
      act(() => {
        stateHandler('connected');
      });

      const { useAppStore } = require('../../store');
      expect(useAppStore.getState().connectionState).toBe('connected');
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(() => useConnection());
      unmount();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('Profile-based Auto-connect', () => {
    it('should auto-connect when profile is available', () => {
      (storage.getActiveProfile as jest.Mock).mockReturnValue(testProfile);
      renderHook(() => useConnection());
      expect(mockClient.onEvent).toHaveBeenCalled();
      expect(mockClient.onStateChange).toHaveBeenCalled();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should not auto-connect without profile', () => {
      renderHook(() => useConnection());
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
  });
});

const { useAppStore } = require('../../store');
