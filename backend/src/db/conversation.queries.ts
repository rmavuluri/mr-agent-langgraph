export const insertConversation = `
  INSERT INTO conversations (id, user_id, title)
  VALUES ($1, $2, $3)
  RETURNING id, user_id, title, created_at, updated_at
`;

export const selectConversationByIdForUser = `
  SELECT id, user_id, title, created_at, updated_at
  FROM conversations
  WHERE id = $1 AND user_id = $2
`;

export const listConversationsForUser = `
  SELECT id, title, created_at, updated_at
  FROM conversations
  WHERE user_id = $1
  ORDER BY updated_at DESC
`;

export const insertConversationMessage = `
  INSERT INTO conversation_messages (conversation_id, role, content)
  VALUES ($1, $2, $3)
`;

export const selectMessagesForConversation = `
  SELECT role, content
  FROM conversation_messages
  WHERE conversation_id = $1
  ORDER BY created_at ASC
`;

export const touchConversationUpdatedAt = `
  UPDATE conversations SET updated_at = now() WHERE id = $1
`;

export const deleteConversationForUser = `
  DELETE FROM conversations WHERE id = $1 AND user_id = $2
`;
