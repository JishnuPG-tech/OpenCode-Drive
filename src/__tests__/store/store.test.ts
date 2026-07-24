import { useAppStore } from '../../store';

describe('App Store', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  describe('Initial State', () => {
    it('should start with disconnected connection state', () => {
      const state = useAppStore.getState();
      expect(state.connectionState).toBe('disconnected');
    });

    it('should have empty sessions', () => {
      expect(useAppStore.getState().sessions).toEqual([]);
    });

    it('should have no active session', () => {
      expect(useAppStore.getState().activeSessionId).toBeNull();
    });

    it('should have empty messages', () => {
      expect(useAppStore.getState().messages).toEqual({});
    });

    it('should have no streaming state', () => {
      const state = useAppStore.getState();
      expect(state.streamingMessageId).toBeNull();
      expect(state.streamingContent).toBe('');
    });

    it('should have empty models', () => {
      expect(useAppStore.getState().models).toEqual([]);
    });

    it('should have no selected model', () => {
      expect(useAppStore.getState().selectedModel).toBeNull();
    });

    it('should have empty queues', () => {
      const state = useAppStore.getState();
      expect(state.pendingPermissions).toEqual([]);
      expect(state.pendingQuestions).toEqual([]);
    });

    it('should not be loading', () => {
      const state = useAppStore.getState();
      expect(state.isLoadingSessions).toBe(false);
      expect(state.isLoadingMessages).toBe(false);
    });

    it('should have sidebars closed', () => {
      const state = useAppStore.getState();
      expect(state.isSidebarOpen).toBe(false);
      expect(state.isSettingsOpen).toBe(false);
    });
  });

  describe('Connection State', () => {
    it('should update connection state', () => {
      useAppStore.getState().setConnectionState('connected');
      expect(useAppStore.getState().connectionState).toBe('connected');
    });

    it('should update to connecting state', () => {
      useAppStore.getState().setConnectionState('connecting');
      expect(useAppStore.getState().connectionState).toBe('connecting');
    });

    it('should update to error state', () => {
      useAppStore.getState().setConnectionState('error');
      expect(useAppStore.getState().connectionState).toBe('error');
    });

    it('should update to reconnecting state', () => {
      useAppStore.getState().setConnectionState('reconnecting');
      expect(useAppStore.getState().connectionState).toBe('reconnecting');
    });
  });

  describe('Session CRUD', () => {
    const mockSession = { id: '1', title: 'Test', status: 'idle' as const, directory: '/test', createdAt: '', updatedAt: '' };
    const mockSession2 = { id: '2', title: 'Test 2', status: 'busy' as const, directory: '/test2', createdAt: '', updatedAt: '' };

    it('should set sessions', () => {
      useAppStore.getState().setSessions([mockSession, mockSession2]);
      expect(useAppStore.getState().sessions).toEqual([mockSession, mockSession2]);
    });

    it('should add a session', () => {
      useAppStore.getState().addSession(mockSession);
      expect(useAppStore.getState().sessions).toContainEqual(mockSession);
    });

    it('should prepend new sessions', () => {
      useAppStore.getState().addSession(mockSession);
      useAppStore.getState().addSession(mockSession2);
      expect(useAppStore.getState().sessions[0]).toEqual(mockSession2);
    });

    it('should update a session', () => {
      useAppStore.getState().addSession(mockSession);
      useAppStore.getState().updateSession('1', { title: 'Updated' });
      expect(useAppStore.getState().sessions[0].title).toBe('Updated');
    });

    it('should not update non-existent session', () => {
      useAppStore.getState().updateSession('999', { title: 'Nope' });
      expect(useAppStore.getState().sessions).toEqual([]);
    });

    it('should remove a session', () => {
      useAppStore.getState().addSession(mockSession);
      useAppStore.getState().removeSession('1');
      expect(useAppStore.getState().sessions).toEqual([]);
    });

    it('should remove correct session when multiple exist', () => {
      useAppStore.getState().setSessions([mockSession, mockSession2]);
      useAppStore.getState().removeSession('1');
      expect(useAppStore.getState().sessions).toEqual([mockSession2]);
    });
  });

  describe('Message Management', () => {
    const msg = { id: 'm1', sessionID: 's1', role: 'user' as const, parts: [], createdAt: '' };

    it('should set messages for a session', () => {
      useAppStore.getState().setMessages('s1', [msg]);
      expect(useAppStore.getState().messages.s1).toEqual([msg]);
    });

    it('should add a message to a session', () => {
      useAppStore.getState().addMessage('s1', msg);
      expect(useAppStore.getState().messages.s1).toContainEqual(msg);
    });

    it('should append messages to existing array', () => {
      useAppStore.getState().addMessage('s1', msg);
      const msg2 = { ...msg, id: 'm2' };
      useAppStore.getState().addMessage('s1', msg2);
      expect(useAppStore.getState().messages.s1).toHaveLength(2);
    });

    it('should update a message', () => {
      useAppStore.getState().addMessage('s1', msg);
      useAppStore.getState().updateMessage('s1', 'm1', { role: 'assistant' });
      expect(useAppStore.getState().messages.s1[0].role).toBe('assistant');
    });

    it('should update message part with matching callID', () => {
      const textPart = { type: 'text' as const, text: 'hello' };
      const toolPart = { type: 'tool' as const, tool: 'read', state: 'call' as const, callID: 'c1', input: {} };
      const msgWithParts = { ...msg, parts: [textPart, toolPart] };
      useAppStore.getState().addMessage('s1', msgWithParts);

      const updatedToolPart = { ...toolPart, state: 'result' as const, output: 'done' };
      useAppStore.getState().updateMessagePart('s1', 'm1', updatedToolPart);
      expect((useAppStore.getState().messages.s1[0].parts[1] as { state: string }).state).toBe('result');
    });

    it('should add part when no matching callID', () => {
      const textPart = { type: 'text' as const, text: 'hello' };
      const msgWithParts = { ...msg, parts: [textPart] };
      useAppStore.getState().addMessage('s1', msgWithParts);

      const newToolPart = { type: 'tool' as const, tool: 'read', state: 'call' as const, callID: 'c1', input: {} };
      useAppStore.getState().updateMessagePart('s1', 'm1', newToolPart);
      expect(useAppStore.getState().messages.s1[0].parts).toHaveLength(2);
    });
  });

  describe('Streaming State', () => {
    it('should set streaming message id', () => {
      useAppStore.getState().setStreamingMessageId('stream-1');
      expect(useAppStore.getState().streamingMessageId).toBe('stream-1');
    });

    it('should clear streaming state', () => {
      useAppStore.getState().setStreamingMessageId('stream-1');
      useAppStore.getState().setStreamingMessageId(null);
      expect(useAppStore.getState().streamingMessageId).toBeNull();
    });

    it('should set streaming content', () => {
      useAppStore.getState().setStreamingContent('Hello');
      expect(useAppStore.getState().streamingContent).toBe('Hello');
    });

    it('should append streaming content', () => {
      useAppStore.getState().setStreamingContent('Hello');
      useAppStore.getState().appendStreamingContent(' World');
      expect(useAppStore.getState().streamingContent).toBe('Hello World');
    });
  });

  describe('Model Selection', () => {
    it('should set models', () => {
      const models = [{ id: 'm1', name: 'GPT-4', providerID: 'openai' }];
      useAppStore.getState().setModels(models);
      expect(useAppStore.getState().models).toEqual(models);
    });

    it('should set selected model', () => {
      useAppStore.getState().setSelectedModel('m1');
      expect(useAppStore.getState().selectedModel).toBe('m1');
    });
  });

  describe('Permission Queue', () => {
    const perm = { id: 'p1', sessionID: 's1', permission: 'read', state: 'pending' as const, createdAt: '' };

    it('should set pending permissions', () => {
      useAppStore.getState().setPendingPermissions([perm]);
      expect(useAppStore.getState().pendingPermissions).toEqual([perm]);
    });

    it('should add pending permission', () => {
      useAppStore.getState().addPendingPermission(perm);
      expect(useAppStore.getState().pendingPermissions).toContainEqual(perm);
    });

    it('should remove pending permission', () => {
      useAppStore.getState().addPendingPermission(perm);
      useAppStore.getState().removePendingPermission('p1');
      expect(useAppStore.getState().pendingPermissions).toEqual([]);
    });
  });

  describe('Question Queue', () => {
    const question = { id: 'q1', sessionID: 's1', question: 'Are you sure?', state: 'pending' as const, createdAt: '' };

    it('should set pending questions', () => {
      useAppStore.getState().setPendingQuestions([question]);
      expect(useAppStore.getState().pendingQuestions).toEqual([question]);
    });

    it('should add pending question', () => {
      useAppStore.getState().addPendingQuestion(question);
      expect(useAppStore.getState().pendingQuestions).toContainEqual(question);
    });

    it('should remove pending question', () => {
      useAppStore.getState().addPendingQuestion(question);
      useAppStore.getState().removePendingQuestion('q1');
      expect(useAppStore.getState().pendingQuestions).toEqual([]);
    });
  });

  describe('Active Profile', () => {
    it('should set active profile', () => {
      const profile = { id: 'p1', name: 'Local', url: 'http://localhost', authType: 'none' as const, authValue: '', isActive: true };
      useAppStore.getState().setActiveProfile(profile);
      expect(useAppStore.getState().activeProfile).toEqual(profile);
    });

    it('should clear active profile', () => {
      useAppStore.getState().setActiveProfile(null);
      expect(useAppStore.getState().activeProfile).toBeNull();
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      useAppStore.getState().setConnectionState('connected');
      useAppStore.getState().setSessions([{ id: '1', title: 'Test', status: 'idle', directory: '/', createdAt: '', updatedAt: '' }]);
      useAppStore.getState().setStreamingMessageId('s1');

      useAppStore.getState().reset();

      const state = useAppStore.getState();
      expect(state.connectionState).toBe('disconnected');
      expect(state.sessions).toEqual([]);
      expect(state.streamingMessageId).toBeNull();
    });
  });
});
