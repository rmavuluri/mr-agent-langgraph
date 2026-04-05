-- Run this against your PostgreSQL database to create the users table.
-- e.g. psql -U postgres -d mr_agent -f sql/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  date_of_birth  DATE NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Long-term memory for LangGraph threads (optional; Memory agent reads this when present).
CREATE TABLE IF NOT EXISTS agent_memory_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  TEXT NOT NULL,
  user_id    UUID REFERENCES users (id) ON DELETE SET NULL,
  scope      TEXT NOT NULL DEFAULT 'note',
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_thread ON agent_memory_entries (thread_id);

-- Chat conversations (sidebar history) — id doubles as LangGraph thread_id when user is logged in.
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title      VARCHAR(512) NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON conversations (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  role             VARCHAR(32) NOT NULL,
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv ON conversation_messages (conversation_id, created_at);
