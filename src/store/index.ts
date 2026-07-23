/**
 * Global State Store (Zustand)
 * Manages app-wide state for sessions, messages, and connection
 */

import { create } from 'zustand';
import type {
  Session,
  Message,
  Model,
  ConnectionState,
  ServerProfile,
  PermissionRequest,
  QuestionRequest,
  Todo,
} from '../network/types';

interface AppState {
  // ── Connection ──
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;

  // ── Server Profile ──
  activeProfile: ServerProfile | null;
  setActiveProfile: (profile: ServerProfile | null) => void;

  // ── Sessions ──
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;

  // ── Active Session ──
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // ── Messages ──
  messages: Record<string, Message[]>;
  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  updateMessagePart: (sessionId: string, messageId: string, part: Message['parts'][0]) => void;

  // ── Streaming ──
  streamingMessageId: string | null;
  setStreamingMessageId: (id: string | null) => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (content: string) => void;

  // ── Models ──
  models: Model[];
  setModels: (models: Model[]) => void;
  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;

  // ── Permissions ──
  pendingPermissions: PermissionRequest[];
  setPendingPermissions: (permissions: PermissionRequest[]) => void;
  addPendingPermission: (permission: PermissionRequest) => void;
  removePendingPermission: (id: string) => void;

  // ── Questions ──
  pendingQuestions: QuestionRequest[];
  setPendingQuestions: (questions: QuestionRequest[]) => void;
  addPendingQuestion: (question: QuestionRequest) => void;
  removePendingQuestion: (id: string) => void;

  // ── Loading States ──
  isLoadingSessions: boolean;
  setIsLoadingSessions: (loading: boolean) => void;
  isLoadingMessages: boolean;
  setIsLoadingMessages: (loading: boolean) => void;

  // ── UI State ──
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // ── Reset ──
  reset: () => void;
}

const initialState = {
  connectionState: 'disconnected' as ConnectionState,
  activeProfile: null,
  sessions: [],
  activeSessionId: null,
  messages: {},
  streamingMessageId: null,
  streamingContent: '',
  models: [],
  selectedModel: null,
  pendingPermissions: [],
  pendingQuestions: [],
  isLoadingSessions: false,
  isLoadingMessages: false,
  isSidebarOpen: false,
  isSettingsOpen: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  // ── Connection ──
  setConnectionState: (state) => set({ connectionState: state }),

  // ── Server Profile ──
  setActiveProfile: (profile) => set({ activeProfile: profile }),

  // ── Sessions ──
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),

  // ── Active Session ──
  setActiveSessionId: (id) => set({ activeSessionId: id }),

  // ── Messages ──
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: messages },
    })),
  addMessage: (sessionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    })),
  updateMessage: (sessionId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: (state.messages[sessionId] || []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),
  updateMessagePart: (sessionId, messageId, part) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: (state.messages[sessionId] || []).map((m) => {
          if (m.id !== messageId) return m;
          const partIndex = m.parts.findIndex(
            (p) => 'callID' in p && 'callID' in part && p.callID === part.callID
          );
          if (partIndex === -1) {
            return { ...m, parts: [...m.parts, part] };
          }
          const newParts = [...m.parts];
          newParts[partIndex] = part;
          return { ...m, parts: newParts };
        }),
      },
    })),

  // ── Streaming ──
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (content) =>
    set((state) => ({ streamingContent: state.streamingContent + content })),

  // ── Models ──
  setModels: (models) => set({ models }),
  setSelectedModel: (modelId) => set({ selectedModel: modelId }),

  // ── Permissions ──
  setPendingPermissions: (permissions) => set({ pendingPermissions: permissions }),
  addPendingPermission: (permission) =>
    set((state) => ({
      pendingPermissions: [...state.pendingPermissions, permission],
    })),
  removePendingPermission: (id) =>
    set((state) => ({
      pendingPermissions: state.pendingPermissions.filter((p) => p.id !== id),
    })),

  // ── Questions ──
  setPendingQuestions: (questions) => set({ pendingQuestions: questions }),
  addPendingQuestion: (question) =>
    set((state) => ({
      pendingQuestions: [...state.pendingQuestions, question],
    })),
  removePendingQuestion: (id) =>
    set((state) => ({
      pendingQuestions: state.pendingQuestions.filter((q) => q.id !== id),
    })),

  // ── Loading States ──
  setIsLoadingSessions: (loading) => set({ isLoadingSessions: loading }),
  setIsLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

  // ── UI State ──
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  // ── Reset ──
  reset: () => set(initialState),
}));
