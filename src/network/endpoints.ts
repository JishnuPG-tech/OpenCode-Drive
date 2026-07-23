/**
 * API Endpoint Definitions
 * All endpoints for OpenCode Serve v1.18.3
 */

export const API_ENDPOINTS = {
  // ── Health & Config ──
  HEALTH: '/api/health',
  CONFIG: '/config',

  // ── Sessions ──
  SESSIONS: '/session',
  SESSION_ACTIVE: '/session/active',
  SESSION_BY_ID: (id: string) => `/session/${id}`,
  SESSION_API: (id: string) => `/api/session/${id}`,
  SESSION_CHILDREN: (id: string) => `/session/${id}/children`,
  SESSION_TODOS: (id: string) => `/session/${id}/todo`,

  // ── Messages ──
  MESSAGES: (sessionId: string) => `/session/${sessionId}/message`,
  MESSAGE_BY_ID: (sessionId: string, messageId: string) =>
    `/session/${sessionId}/message/${messageId}`,

  // ── Session Actions ──
  SESSION_ABORT: (id: string) => `/session/${id}/abort`,
  SESSION_INIT: (id: string) => `/session/${id}/init`,
  SESSION_COMPACT: (id: string) => `/session/${id}/compact`,
  SESSION_SUMMARIZE: (id: string) => `/session/${id}/summarize`,
  SESSION_SHARE: (id: string) => `/session/${id}/share`,
  SESSION_FORK: (id: string) => `/session/${id}/fork`,

  // ── Session Diff/Revert ──
  SESSION_DIFF: (id: string) => `/session/${id}/diff`,
  SESSION_REVERT: (id: string) => `/session/${id}/revert`,
  SESSION_UNREVERT: (id: string) => `/session/${id}/unrevert`,

  // ── Session History/Context ──
  SESSION_HISTORY: (id: string) => `/session/${id}/history`,
  SESSION_CONTEXT: (id: string) => `/session/${id}/context`,

  // ── Permissions ──
  PERMISSIONS: '/permission',
  PERMISSIONS_SAVED: '/permission/saved',
  PERMISSION_SAVED_BY_ID: (id: string) => `/permission/saved/${id}`,
  PERMISSION_REPLY: (sessionId: string, requestId: string) =>
    `/session/${sessionId}/permissions/${requestId}`,

  // ── Questions ──
  QUESTIONS: '/question',
  QUESTIONS_BY_SESSION: (sessionId: string) => `/session/${sessionId}/question`,
  QUESTION_REPLY: (requestId: string) => `/question/${requestId}/reply`,
  QUESTION_REJECT: (requestId: string) => `/question/${requestId}/reject`,

  // ── Providers ──
  PROVIDERS: '/api/provider',
  PROVIDER_BY_ID: (id: string) => `/api/provider/${id}`,

  // ── Models ──
  MODELS: '/api/model',

  // ── Agents/Commands/Skills ──
  AGENTS: '/api/agent',
  COMMANDS: '/api/command',
  SKILLS: '/api/skill',

  // ── Files ──
  FS_LIST: '/api/fs/list',
  FILE_CONTENT: '/file/content',

  // ── Search ──
  FIND_FILE: '/find/file',
  FIND_SYMBOL: '/find/symbol',

  // ── VCS ──
  VCS_STATUS: '/api/vcs/status',

  // ── PTY ──
  PTY_LIST: '/api/pty',
  PTY_BY_ID: (id: string) => `/api/pty/${id}`,
  PTY_CONNECT_TOKEN: (id: string) => `/api/pty/${id}/connect-token`,

  // ── SSE ──
  SSE_GLOBAL: '/event',
  SSE_SESSION: (sessionId: string) => `/session/${sessionId}/event`,
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
