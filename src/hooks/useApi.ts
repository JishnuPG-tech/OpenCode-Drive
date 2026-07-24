/**
 * React Query Hooks for API Calls
 * Handles caching, revalidation, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../network/api-client';
import { useAppStore } from '../store';
import type { Message } from '../network/types';

// ── Query Keys ──

export const queryKeys = {
  sessions: ['sessions'] as const,
  session: (id: string) => ['session', id] as const,
  messages: (sessionId: string) => ['messages', sessionId] as const,
  models: ['models'] as const,
  providers: ['providers'] as const,
  config: ['config'] as const,
  health: ['health'] as const,
  files: (path: string) => ['files', path] as const,
  permissions: ['permissions'] as const,
  questions: ['questions'] as const,
};

// ── Sessions Hooks ──

export function useSessions() {
  const { setSessions, setIsLoadingSessions } = useAppStore();

  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      setIsLoadingSessions(true);
      try {
        const sessions = await apiClient.getSessions();
        setSessions(sessions);
        return sessions;
      } finally {
        setIsLoadingSessions(false);
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => apiClient.getSession(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { addSession } = useAppStore();

  return useMutation({
    mutationFn: (options?: { title?: string; agent?: string; model?: string; directory?: string }) =>
      apiClient.createSession(options),
    onSuccess: (session) => {
      addSession(session);
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { removeSession } = useAppStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSession(id),
    onSuccess: (_, id) => {
      removeSession(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  const { updateSession } = useAppStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; agent?: string; model?: string } }) =>
      apiClient.patchSession(id, data),
    onSuccess: (session) => {
      updateSession(session.id, session);
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

// ── Messages Hooks ──

export function useMessages(sessionId: string) {
  const { setMessages, setIsLoadingMessages } = useAppStore();

  return useQuery({
    queryKey: queryKeys.messages(sessionId),
    queryFn: async () => {
      setIsLoadingMessages(true);
      try {
        const messages = await apiClient.getMessages(sessionId);
        setMessages(sessionId, messages);
        return messages;
      } finally {
        setIsLoadingMessages(false);
      }
    },
    enabled: !!sessionId,
    staleTime: 10000, // 10 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addMessage, setStreamingMessageId, setStreamingContent } = useAppStore();

  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      apiClient.sendMessage(sessionId, content),
    onSuccess: (response, { sessionId }) => {
      // Add user message
      const userText = response.parts.find(p => p.type === 'text')?.text || '';
      const userMessage: Message = {
        id: response.info.id,
        sessionID: sessionId,
        role: 'user',
        parts: [{ type: 'text', text: response.info.parentID ? '' : userText }],
        createdAt: new Date().toISOString(),
      };
      addMessage(sessionId, userMessage);

      // Add assistant message placeholder
      const assistantMessage: Message = {
        id: response.info.id,
        sessionID: sessionId,
        role: 'assistant',
        parts: response.parts,
        createdAt: new Date().toISOString(),
      };
      addMessage(sessionId, assistantMessage);

      // Start streaming
      setStreamingMessageId(response.info.id);
      setStreamingContent('');

      queryClient.invalidateQueries({ queryKey: queryKeys.messages(sessionId) });
    },
  });
}

export function useAbortSession() {
  const { setStreamingMessageId, setStreamingContent } = useAppStore();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.abortSession(sessionId),
    onSuccess: () => {
      setStreamingMessageId(null);
      setStreamingContent('');
    },
  });
}

// ── Models Hooks ──

export function useModels() {
  const { setModels } = useAppStore();

  return useQuery({
    queryKey: queryKeys.models,
    queryFn: async () => {
      const models = await apiClient.getModels();
      setModels(models);
      return models;
    },
    staleTime: 300000, // 5 minutes
  });
}

// ── Config Hooks ──

export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => apiClient.getConfig(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<import('../network/types').OpenCodeConfig>) =>
      apiClient.patchConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config });
    },
  });
}

// ── Health Hook ──

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getHealth(),
    retry: 3,
    retryDelay: 1000,
  });
}

// ── Files Hooks ──

export function useFiles(path: string = '.') {
  return useQuery({
    queryKey: queryKeys.files(path),
    queryFn: () => apiClient.listFiles(path),
    staleTime: 30000,
  });
}

export function useFileContent(path: string) {
  return useQuery({
    queryKey: ['fileContent', path],
    queryFn: () => apiClient.readFile(path),
    enabled: !!path,
  });
}

// ── Permissions Hooks ──

export function usePermissions() {
  const { setPendingPermissions } = useAppStore();

  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: async () => {
      const permissions = await apiClient.getPermissionRequests();
      setPendingPermissions(permissions);
      return permissions;
    },
    staleTime: 5000,
  });
}

export function useReplyPermission() {
  const queryClient = useQueryClient();
  const { removePendingPermission } = useAppStore();

  return useMutation({
    mutationFn: ({ sessionId, requestId, allow }: { sessionId: string; requestId: string; allow: boolean }) =>
      apiClient.replyPermission(sessionId, requestId, allow),
    onSuccess: (_, { requestId }) => {
      removePendingPermission(requestId);
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions });
    },
  });
}

// ── Questions Hooks ──

export function useQuestions() {
  const { setPendingQuestions } = useAppStore();

  return useQuery({
    queryKey: queryKeys.questions,
    queryFn: async () => {
      const questions = await apiClient.getQuestionRequests();
      setPendingQuestions(questions);
      return questions;
    },
    staleTime: 5000,
  });
}

export function useReplyQuestion() {
  const queryClient = useQueryClient();
  const { removePendingQuestion } = useAppStore();

  return useMutation({
    mutationFn: ({ requestId, answer }: { requestId: string; answer: string }) =>
      apiClient.replyQuestion(requestId, answer),
    onSuccess: (_, { requestId }) => {
      removePendingQuestion(requestId);
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
  });
}

export function useRejectQuestion() {
  const queryClient = useQueryClient();
  const { removePendingQuestion } = useAppStore();

  return useMutation({
    mutationFn: (requestId: string) => apiClient.rejectQuestion(requestId),
    onSuccess: (_, requestId) => {
      removePendingQuestion(requestId);
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
  });
}
