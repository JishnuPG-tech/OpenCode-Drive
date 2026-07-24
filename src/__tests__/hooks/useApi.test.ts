import { renderHook, act } from '@testing-library/react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../network/api-client';
import {
  useSessions, useSession, useCreateSession, useDeleteSession, useUpdateSession,
  useMessages, useSendMessage, useAbortSession,
  useModels, useConfig,
  useFiles, useFileContent,
  usePermissions, useReplyPermission,
  useQuestions, useReplyQuestion, useRejectQuestion,
} from '../../hooks/useApi';
import { useAppStore } from '../../store';

jest.mock('../../network/api-client', () => ({
  apiClient: {
    getSessions: jest.fn(),
    getSession: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    patchSession: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    abortSession: jest.fn(),
    getModels: jest.fn(),
    getConfig: jest.fn(),
    patchConfig: jest.fn(),
    listFiles: jest.fn(),
    readFile: jest.fn(),
    getPermissionRequests: jest.fn(),
    replyPermission: jest.fn(),
    getQuestionRequests: jest.fn(),
    replyQuestion: jest.fn(),
    rejectQuestion: jest.fn(),
  },
}));

const mockSession = { id: '1', title: 'Test', status: 'idle' as const, directory: '/a', createdAt: '', updatedAt: '' };

describe('useApi Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState(useAppStore.getInitialState());
  });

  describe('Queries', () => {
    it('useSessions should return sessions data', () => {
      const sessions = [mockSession];
      (apiClient.getSessions as jest.Mock).mockResolvedValue(sessions);
      (useQuery as jest.Mock).mockReturnValue({ data: sessions, isLoading: false });

      const { result } = renderHook(() => useSessions());
      expect(result.current.data).toEqual(sessions);
    });

    it('useSession should return single session', () => {
      (apiClient.getSession as jest.Mock).mockResolvedValue(mockSession);
      (useQuery as jest.Mock).mockReturnValue({ data: mockSession, isLoading: false });

      const { result } = renderHook(() => useSession('1'));
      expect(result.current.data).toEqual(mockSession);
    });

    it('useMessages should return messages', () => {
      const messages = [{ id: 'm1', sessionID: '1', role: 'user' as const, parts: [], createdAt: '' }];
      (apiClient.getMessages as jest.Mock).mockResolvedValue(messages);
      (useQuery as jest.Mock).mockReturnValue({ data: messages, isLoading: false });

      const { result } = renderHook(() => useMessages('1'));
      expect(result.current.data).toEqual(messages);
    });

    it('useModels should return models', () => {
      const models = [{ id: 'gpt4', name: 'GPT-4', providerID: 'openai' }];
      (apiClient.getModels as jest.Mock).mockResolvedValue(models);
      (useQuery as jest.Mock).mockReturnValue({ data: models, isLoading: false });

      const { result } = renderHook(() => useModels());
      expect(result.current.data).toEqual(models);
    });

    it('useConfig should return config', () => {
      const config = { theme: 'dark' };
      (apiClient.getConfig as jest.Mock).mockResolvedValue(config);
      (useQuery as jest.Mock).mockReturnValue({ data: config, isLoading: false });

      const { result } = renderHook(() => useConfig());
      expect(result.current.data).toEqual(config);
    });

    it('useFiles should return file list', () => {
      const files = [{ name: 'file.txt', path: 'file.txt', type: 'file' as const }];
      (apiClient.listFiles as jest.Mock).mockResolvedValue(files);
      (useQuery as jest.Mock).mockReturnValue({ data: files, isLoading: false });

      const { result } = renderHook(() => useFiles());
      expect(result.current.data).toEqual(files);
    });

    it('useFileContent should return file content', () => {
      const content = { content: 'text', encoding: 'utf-8' };
      (apiClient.readFile as jest.Mock).mockResolvedValue(content);
      (useQuery as jest.Mock).mockReturnValue({ data: content, isLoading: false });

      const { result } = renderHook(() => useFileContent('test.txt'));
      expect(result.current.data).toEqual(content);
    });

    it('usePermissions should return pending permissions', () => {
      const permissions = [{ id: 'p1', sessionID: '1', permission: 'read', state: 'pending' as const, createdAt: '' }];
      (apiClient.getPermissionRequests as jest.Mock).mockResolvedValue(permissions);
      (useQuery as jest.Mock).mockReturnValue({ data: permissions, isLoading: false });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.data).toEqual(permissions);
    });

    it('useQuestions should return pending questions', () => {
      const questions = [{ id: 'q1', sessionID: '1', question: 'Allow?', state: 'pending' as const, createdAt: '' }];
      (apiClient.getQuestionRequests as jest.Mock).mockResolvedValue(questions);
      (useQuery as jest.Mock).mockReturnValue({ data: questions, isLoading: false });

      const { result } = renderHook(() => useQuestions());
      expect(result.current.data).toEqual(questions);
    });
  });

  describe('Mutations', () => {
    it('useCreateSession should call apiClient.createSession', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useCreateSession());
      act(() => { result.current.mutate({ title: 'New' }); });
      expect(mockMutate).toHaveBeenCalledWith({ title: 'New' });
    });

    it('useDeleteSession should call apiClient.deleteSession', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useDeleteSession());
      act(() => { result.current.mutate('1'); });
      expect(mockMutate).toHaveBeenCalledWith('1');
    });

    it('useUpdateSession should call apiClient.patchSession', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useUpdateSession());
      act(() => { result.current.mutate({ id: '1', data: { title: 'Updated' } }); });
      expect(mockMutate).toHaveBeenCalledWith({ id: '1', data: { title: 'Updated' } });
    });

    it('useSendMessage should call apiClient.sendMessage', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useSendMessage());
      act(() => { result.current.mutate({ sessionId: '1', content: 'Hello' }); });
      expect(mockMutate).toHaveBeenCalledWith({ sessionId: '1', content: 'Hello' });
    });

    it('useAbortSession should call apiClient.abortSession', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useAbortSession());
      act(() => { result.current.mutate('1'); });
      expect(mockMutate).toHaveBeenCalledWith('1');
    });

    it('useReplyPermission should call apiClient.replyPermission', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useReplyPermission());
      act(() => { result.current.mutate({ sessionId: '1', requestId: 'p1', allow: true }); });
      expect(mockMutate).toHaveBeenCalledWith({ sessionId: '1', requestId: 'p1', allow: true });
    });

    it('useReplyQuestion should call apiClient.replyQuestion', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useReplyQuestion());
      act(() => { result.current.mutate({ requestId: 'q1', answer: 'yes' }); });
      expect(mockMutate).toHaveBeenCalledWith({ requestId: 'q1', answer: 'yes' });
    });

    it('useRejectQuestion should call apiClient.rejectQuestion', () => {
      const mockMutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate: mockMutate, mutateAsync: mockMutate, isPending: false });

      const { result } = renderHook(() => useRejectQuestion());
      act(() => { result.current.mutate('q1'); });
      expect(mockMutate).toHaveBeenCalledWith('q1');
    });
  });
});
