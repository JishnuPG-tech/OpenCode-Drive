/**
 * OpenCode API Client
 * Axios-based HTTP client with interceptors for auth, retry, and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../storage/mmkv';
import { API_ENDPOINTS } from './endpoints';
import type {
  HealthResponse,
  OpenCodeConfig,
  Session,
  Message,
  MessageResponse,
  Model,
  Provider,
  FileEntry,
  FileContent,
  FindResult,
  SymbolResult,
  PTY,
  Agent,
  Command,
  Skill,
  VCSStatus,
  PermissionRequest,
  SavedPermission,
  QuestionRequest,
  Todo,
  DiffEntry,
  SessionContext,
  SessionHistory,
  ServerProfile,
} from './types';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class ApiClient {
  private client: AxiosInstance;
  private retryCount = new Map<string, number>();

  constructor() {
    this.client = axios.create({
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth headers
    this.client.interceptors.request.use(
      (config) => {
        const profile = storage.getActiveProfile();
        if (profile) {
          const authHeaders = this.getAuthHeaders(profile);
          Object.assign(config.headers, authHeaders);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and retries
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry count on success
        const url = response.config.url || '';
        this.retryCount.delete(url);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { url?: string };
        const url = config?.url || '';

        // Don't retry on certain status codes
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw error;
        }

        // Retry logic
        const currentRetries = this.retryCount.get(url) || 0;
        if (currentRetries < MAX_RETRIES && config) {
          this.retryCount.set(url, currentRetries + 1);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (currentRetries + 1)));
          return this.client.request(config);
        }

        throw error;
      }
    );
  }

  private getAuthHeaders(profile: ServerProfile): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (profile.authType) {
      case 'basic':
        headers['Authorization'] = `Basic ${btoa(profile.authValue)}`;
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${profile.authValue}`;
        break;
      case 'apikey':
        headers['X-API-Key'] = profile.authValue;
        break;
      default:
        break;
    }

    return headers;
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }

  // ── Health & Config ──

  async getHealth(): Promise<HealthResponse> {
    const { data } = await this.client.get<HealthResponse>(API_ENDPOINTS.HEALTH);
    return data;
  }

  async getConfig(): Promise<OpenCodeConfig> {
    const { data } = await this.client.get<OpenCodeConfig>(API_ENDPOINTS.CONFIG);
    return data;
  }

  async patchConfig(config: Partial<OpenCodeConfig>): Promise<void> {
    await this.client.patch(API_ENDPOINTS.CONFIG, config);
  }

  // ── Sessions ──

  async getSessions(): Promise<Session[]> {
    const { data } = await this.client.get<Session[]>(API_ENDPOINTS.SESSIONS);
    return data;
  }

  async getActiveSessions(): Promise<Session[]> {
    const { data } = await this.client.get<Session[]>(API_ENDPOINTS.SESSION_ACTIVE);
    return data;
  }

  async getSession(id: string): Promise<Session> {
    const { data } = await this.client.get<Session>(API_ENDPOINTS.SESSION_BY_ID(id));
    return data;
  }

  async createSession(options?: {
    title?: string;
    agent?: string;
    model?: string;
    directory?: string;
  }): Promise<Session> {
    const { data } = await this.client.post<Session>(API_ENDPOINTS.SESSIONS, options || {});
    return data;
  }

  async deleteSession(id: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.SESSION_BY_ID(id));
  }

  async patchSession(
    id: string,
    data: { title?: string; agent?: string; model?: string }
  ): Promise<Session> {
    const response = await this.client.patch<Session>(API_ENDPOINTS.SESSION_BY_ID(id), data);
    return response.data;
  }

  async getSessionChildren(id: string): Promise<Session[]> {
    const { data } = await this.client.get<Session[]>(API_ENDPOINTS.SESSION_CHILDREN(id));
    return data;
  }

  async getSessionTodos(id: string): Promise<Todo[]> {
    const { data } = await this.client.get<Todo[]>(API_ENDPOINTS.SESSION_TODOS(id));
    return data;
  }

  // ── Messages ──

  async getMessages(sessionId: string): Promise<Message[]> {
    const { data } = await this.client.get<Message[]>(API_ENDPOINTS.MESSAGES(sessionId));
    return data;
  }

  async getMessage(sessionId: string, messageId: string): Promise<Message> {
    const { data } = await this.client.get<Message>(
      API_ENDPOINTS.MESSAGE_BY_ID(sessionId, messageId)
    );
    return data;
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.MESSAGE_BY_ID(sessionId, messageId));
  }

  async sendMessage(sessionId: string, content: string): Promise<MessageResponse> {
    const { data } = await this.client.post<MessageResponse>(API_ENDPOINTS.MESSAGES(sessionId), {
      parts: [{ type: 'text', text: content }],
    });
    return data;
  }

  // ── Session Actions ──

  async abortSession(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_ABORT(sessionId));
  }

  async initSession(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_INIT(sessionId));
  }

  async compactSession(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_COMPACT(sessionId));
  }

  async summarizeSession(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_SUMMARIZE(sessionId));
  }

  async shareSession(sessionId: string): Promise<{ url?: string }> {
    const { data } = await this.client.post<{ url?: string }>(
      API_ENDPOINTS.SESSION_SHARE(sessionId)
    );
    return data;
  }

  async forkSession(sessionId: string): Promise<Session> {
    const { data } = await this.client.post<Session>(API_ENDPOINTS.SESSION_FORK(sessionId));
    return data;
  }

  // ── Session Diff/Revert ──

  async getSessionDiff(sessionId: string): Promise<DiffEntry[]> {
    const { data } = await this.client.get<DiffEntry[]>(API_ENDPOINTS.SESSION_DIFF(sessionId));
    return data;
  }

  async revertSessionStage(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_REVERT(sessionId));
  }

  async revertSessionClear(sessionId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.SESSION_UNREVERT(sessionId));
  }

  // ── Session History/Context ──

  async getSessionHistory(sessionId: string): Promise<SessionHistory> {
    const { data } = await this.client.get<SessionHistory>(
      API_ENDPOINTS.SESSION_HISTORY(sessionId)
    );
    return data;
  }

  async getSessionContext(sessionId: string): Promise<SessionContext> {
    const { data } = await this.client.get<SessionContext>(
      API_ENDPOINTS.SESSION_CONTEXT(sessionId)
    );
    return data;
  }

  // ── Permissions ──

  async getPermissionRequests(): Promise<PermissionRequest[]> {
    const { data } = await this.client.get<PermissionRequest[]>(API_ENDPOINTS.PERMISSIONS);
    return data;
  }

  async getSavedPermissions(): Promise<SavedPermission[]> {
    const { data } = await this.client.get<SavedPermission[]>(API_ENDPOINTS.PERMISSIONS_SAVED);
    return data;
  }

  async deleteSavedPermission(id: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.PERMISSION_SAVED_BY_ID(id));
  }

  async replyPermission(sessionId: string, requestId: string, allow: boolean): Promise<void> {
    await this.client.post(API_ENDPOINTS.PERMISSION_REPLY(sessionId, requestId), { allow });
  }

  // ── Questions ──

  async getQuestionRequests(): Promise<QuestionRequest[]> {
    const { data } = await this.client.get<QuestionRequest[]>(API_ENDPOINTS.QUESTIONS);
    return data;
  }

  async getSessionQuestions(sessionId: string): Promise<QuestionRequest[]> {
    const { data } = await this.client.get<QuestionRequest[]>(
      API_ENDPOINTS.QUESTIONS_BY_SESSION(sessionId)
    );
    return data;
  }

  async replyQuestion(requestId: string, answer: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.QUESTION_REPLY(requestId), { answer });
  }

  async rejectQuestion(requestId: string): Promise<void> {
    await this.client.post(API_ENDPOINTS.QUESTION_REJECT(requestId));
  }

  // ── Providers ──

  async getProviders(): Promise<Provider[]> {
    const { data } = await this.client.get<{ data: Provider[] }>(API_ENDPOINTS.PROVIDERS);
    return data.data;
  }

  async getProvider(id: string): Promise<Provider> {
    const { data } = await this.client.get<Provider>(API_ENDPOINTS.PROVIDER_BY_ID(id));
    return data;
  }

  // ── Models ──

  async getModels(): Promise<Model[]> {
    const { data } = await this.client.get<{ data: Model[] }>(API_ENDPOINTS.MODELS);
    return data.data;
  }

  // ── Agents/Commands/Skills ──

  async getAgents(): Promise<Agent[]> {
    const { data } = await this.client.get<{ data: Agent[] }>(API_ENDPOINTS.AGENTS);
    return data.data;
  }

  async getCommands(): Promise<Command[]> {
    const { data } = await this.client.get<{ data: Command[] }>(API_ENDPOINTS.COMMANDS);
    return data.data;
  }

  async getSkills(): Promise<Skill[]> {
    const { data } = await this.client.get<{ data: Skill[] }>(API_ENDPOINTS.SKILLS);
    return data.data;
  }

  // ── Files ──

  async listFiles(dir: string = '.'): Promise<FileEntry[]> {
    const { data } = await this.client.get<{ data: FileEntry[] }>(API_ENDPOINTS.FS_LIST, {
      params: { path: dir },
    });
    return data.data;
  }

  async readFile(filePath: string): Promise<FileContent> {
    const { data } = await this.client.get<FileContent>(API_ENDPOINTS.FILE_CONTENT, {
      params: { path: filePath },
    });
    return data;
  }

  // ── Search ──

  async findFiles(query: string, dir?: string): Promise<FindResult[]> {
    const params: Record<string, string> = { query };
    if (dir) params.path = dir;
    const { data } = await this.client.get<FindResult[]>(API_ENDPOINTS.FIND_FILE, { params });
    return data;
  }

  async findSymbols(query: string): Promise<SymbolResult[]> {
    const { data } = await this.client.get<SymbolResult[]>(API_ENDPOINTS.FIND_SYMBOL, {
      params: { query },
    });
    return data;
  }

  // ── VCS ──

  async getVCSStatus(): Promise<VCSStatus> {
    const { data } = await this.client.get<VCSStatus>(API_ENDPOINTS.VCS_STATUS);
    return data;
  }

  // ── PTY ──

  async getPTYs(): Promise<PTY[]> {
    const { data } = await this.client.get<{ data: PTY[] }>(API_ENDPOINTS.PTY_LIST);
    return data.data;
  }

  async createPTY(shell?: string): Promise<PTY> {
    const { data } = await this.client.post<PTY>(API_ENDPOINTS.PTY_LIST, { shell });
    return data;
  }

  async getPTY(id: string): Promise<PTY> {
    const { data } = await this.client.get<PTY>(API_ENDPOINTS.PTY_BY_ID(id));
    return data;
  }

  async deletePTY(id: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.PTY_BY_ID(id));
  }

  async getPTYConnectToken(id: string): Promise<{ token: string }> {
    const { data } = await this.client.post<{ token: string }>(
      API_ENDPOINTS.PTY_CONNECT_TOKEN(id)
    );
    return data;
  }
}

// Singleton instance
export const apiClient = new ApiClient();
