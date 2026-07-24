# API Documentation

## Overview

OpenCode Mobile communicates with [OpenCode Serve](https://github.com/opencode-ai/opencode-serve) through its REST API and SSE (Server-Sent Events) streaming endpoints. The API client supports approximately 48 distinct operations across 11 categories, with 4 authentication methods and 14 SSE event types.

Base URL: The server URL configured in the app's server profile (e.g., `https://your-server.com`).

## Authentication

The app supports four authentication methods, configured per server profile:

### None
No authentication headers are sent.

### Basic Auth
Sends an `Authorization: Basic <base64>` header where the value is the `username:password` string encoded in Base64.

### Bearer Token
Sends an `Authorization: Bearer <token>` header with a static token value.

### API Key
Sends an `X-API-Key: <key>` header with a static key value.

Authentication headers are injected automatically by the Axios request interceptor in `api-client.ts` based on the active server profile stored in MMKV.

## Endpoint Categories

### Health and Config

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check. Returns `{ healthy: boolean, version: string }`. |
| GET | `/config` | Get server configuration. Returns `OpenCodeConfig` object. |
| PATCH | `/config` | Update server configuration. Accepts partial config object. |

### Sessions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/session` | List all sessions. Returns array of `Session`. |
| GET | `/session/active` | List active sessions. Returns array of `Session`. |
| GET | `/session/:id` | Get session by ID. Returns `Session`. |
| POST | `/session` | Create a new session. Accepts optional title, agent, model, directory. |
| PATCH | `/session/:id` | Update session title, agent, or model. |
| DELETE | `/session/:id` | Delete a session. |
| GET | `/session/:id/children` | Get child sessions (forked from this session). |
| GET | `/session/:id/todo` | Get session todo items. |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| GET | `/session/:id/message` | Get all messages for a session. |
| GET | `/session/:id/message/:messageId` | Get a specific message. |
| POST | `/session/:id/message` | Send a message. Request body: `{ parts: [{ type: "text", text: string }] }`. |
| DELETE | `/session/:id/message/:messageId` | Delete a message. |

### Session Actions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/session/:id/abort` | Abort the current AI response generation. |
| POST | `/session/:id/init` | Initialize a session. |
| POST | `/session/:id/compact` | Compact session context. |
| POST | `/session/:id/summarize` | Summarize session history. |
| POST | `/session/:id/share` | Generate a shareable URL for the session. |
| POST | `/session/:id/fork` | Fork the session into a new child session. |
| GET | `/session/:id/diff` | Get file diffs for the session. |
| POST | `/session/:id/revert` | Revert changes in the session. |
| POST | `/session/:id/unrevert` | Clear the revert state. |
| GET | `/session/:id/history` | Get session message history. |
| GET | `/session/:id/context` | Get session context (files and capabilities). |

### Permissions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/permission` | Get pending permission requests. |
| GET | `/permission/saved` | Get saved permission rules. |
| DELETE | `/permission/saved/:id` | Delete a saved permission rule. |
| POST | `/session/:id/permissions/:requestId` | Reply to a permission request with allow/deny. |

### Questions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/question` | Get all pending questions. |
| GET | `/session/:id/question` | Get questions for a specific session. |
| POST | `/question/:id/reply` | Reply to a question with an answer. |
| POST | `/question/:id/reject` | Reject a question request. |

### Providers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/provider` | List all AI providers with their configuration. |
| GET | `/api/provider/:id` | Get provider details. |

### Models

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/model` | List all available AI models. |

### Agents, Commands, and Skills

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/agent` | List available agents. |
| GET | `/api/command` | List available commands. |
| GET | `/api/skill` | List available skills. |

### Files

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/fs/list?path=.` | List files and directories at the given path. |
| GET | `/file/content?path=path/to/file` | Read file contents. |

### Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/find/file?query=term` | Search files by content. Returns file path, line number, column, match text, and context. |
| GET | `/find/symbol?query=term` | Search for symbols (functions, classes, variables). Returns name, kind, file path, line number, and column. |

### VCS

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vcs/status` | Get version control status. Returns branch name, dirty flag, ahead/behind counts. |

### PTY

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pty` | List pseudo-terminals. |
| POST | `/api/pty` | Create a new PTY with optional shell. |
| GET | `/api/pty/:id` | Get PTY details. |
| DELETE | `/api/pty/:id` | Delete a PTY. |
| POST | `/api/pty/:id/connect-token` | Get a connection token for WebSocket-based PTY access. |

## SSE Event Types

The app connects to the SSE stream for real-time updates. Two stream URLs are available:

- Global events: `GET /event`
- Session-specific events: `GET /session/:id/event`

The SSE client parses standard SSE format (`event:` and `data:` lines). When a session-specific stream is active, it subscribes to events for that session; the global stream is used otherwise.

### Event Type Reference

| Event Type | Properties | Description |
|---|---|---|
| `session.created` | Full `Session` object | A new session was created. |
| `session.updated` | Partial `Session` with `id` | Session properties changed. |
| `session.deleted` | `{ id: string }` | A session was deleted. |
| `message.created` | Full `Message` object | A new message was added to a session. |
| `message.updated` | Partial `Message` with `id` | A message was updated. |
| `message.part.updated` | `{ messageID, part, sessionID }` | A message part was updated (streaming token). |
| `message.part.deleted` | `{ messageID, partID, sessionID }` | A message part was removed. |
| `permission.requested` | Full `PermissionRequest` | AI requested a permission (e.g., file access). |
| `permission.updated` | Updated `PermissionRequest` | Permission request status changed. |
| `question.asked` | Full `QuestionRequest` | AI asked a question requiring user input. |
| `question.answered` | Updated `QuestionRequest` | Question was answered. |
| `file.changed` | `{ path: string, status: string }` | A file was created, modified, or deleted. |
| `todo.updated` | `{ sessionID, todos: Todo[] }` | Todo items for a session changed. |
| `sync` | `Record<string, unknown>` | Synchronization event for state reconciliation. |
| `error` | `{ message, code? }` | Server error occurred. |

## Request and Response Formats

### Session Object

```typescript
{
  id: string;
  parentID?: string;
  title: string;
  agent?: string;
  model?: string;
  status: "idle" | "busy" | "error";
  directory: string;
  createdAt: string;
  updatedAt: string;
}
```

### Message Object

```typescript
{
  id: string;
  sessionID: string;
  role: "user" | "assistant" | "tool" | "system";
  parts: MessagePart[];
  createdAt: string;
}
```

### Message Part Types

- `TextPart` - `{ type: "text", text: string }`
- `ToolPart` - `{ type: "tool", tool: string, state: "call"|"result"|"error", callID: string, input?, output?, title?, metadata? }`
- `StepPart` - `{ type: "step", name: string, state: "pending"|"running"|"completed"|"error" }`
- `ReasoningPart` - `{ type: "reasoning", text: string }`
- `SourcePart` - `{ type: "source", source: string, title?: string }`

### Message Response

```typescript
{
  info: {
    id: string;
    parentID?: string;
    role: string;
    sessionID: string;
    modelID?: string;
    providerID?: string;
    time?: { created: number; completed?: number };
    finish?: string;
  };
  parts: MessagePart[];
}
```

### File Entry

```typescript
{
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
}
```

### Health Response

```typescript
{
  healthy: boolean;
  version: string;
}
```

### Error Handling

The API client retries failed requests up to 3 times with exponential backoff (1s, 2s, 4s delays). HTTP 401 and 403 errors are not retried. Network errors, timeouts, and server errors trigger retries. All errors propagate to the calling hook for UI-level error handling.