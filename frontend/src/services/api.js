/**
 * API client for mr-agent backend.
 * Replace baseUrl with your backend URL when ready.
 */
/** Backend base URL (no trailing slash). Empty = same origin (e.g. when frontend is served by backend). */
const baseUrl = import.meta.env.VITE_API_URL ?? '';

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(res.statusText || 'Request failed');
    err.status = res.status;
    err.response = res;
    throw err;
  }
  if (res.status === 204) return;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) return res.json();
  return res.text();
}

/**
 * @param {{ email: string, password: string, confirmPassword: string, dateOfBirth: string }} data
 * @returns {Promise<{ user: { id: string, email: string, dateOfBirth: string, createdAt: string }, message: string }>}
 */
export async function signup(data) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: { id: string, email: string, dateOfBirth: string, createdAt: string }, message: string }>}
 */
export async function login(data) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * @param {{ email: string, currentPassword: string, newPassword: string, confirmNewPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function changePassword(data) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Chat: memory mode (persisted) or legacy (messages only).
 * Memory: { message, conversation_id?, user_id? }
 * Legacy: { messages: [...] }
 * @returns {Promise<{ id: string, content: unknown[], conversation_id?: string, usage: {...}, model: string }>}
 */
export async function chat(data) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * List conversations for a user (requires user_id).
 * @param {string} userId
 * @returns {Promise<{ conversations: Array<{ id: string, title: string, created_at: string, updated_at: string }> }>}
 */
export async function getConversations(userId) {
  return request(`/api/conversations?user_id=${encodeURIComponent(userId)}`);
}

/**
 * Get one conversation and its messages (requires user_id for access).
 * @param {string} conversationId
 * @param {string} userId
 * @returns {Promise<{ conversation: { id: string, title: string, ... }, messages: Array<{ role: string, content: string }> }>}
 */
export async function getConversation(conversationId, userId) {
  return request(`/api/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`);
}

/**
 * Delete a conversation and its messages (requires user_id). Returns nothing on success.
 * @param {string} conversationId
 * @param {string} userId
 */
export async function deleteConversation(conversationId, userId) {
  return request(`/api/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export const api = {
  signup,
  login,
  changePassword,
  chat,
  getConversations,
  getConversation,
  deleteConversation,
};
