import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';
import InputBar from '../../components/InputBar';
import Sidenav from '../../components/Sidenav';
import { api } from '../../services/api';
import './LandingPage.css';

const USER_STORAGE_KEY = 'mr-agent-user';

/** Backend may return { message } (agent) or { content: [{ type, text }] } (blocks). */
function assistantTextFromChatResponse(res) {
  if (res == null) return '';
  if (typeof res.message === 'string' && res.message.trim()) return res.message.trim();
  const blocks = Array.isArray(res.content) ? res.content : [];
  return blocks
    .filter((b) => b && b.type === 'text')
    .map((b) => b.text || '')
    .join('')
    .trim();
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LandingPage() {
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const [user, setUser] = useState(loadStoredUser);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setConversations([]);
      return;
    }
    api
      .getConversations(user.id)
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setConversations([]));
  }, [user?.id]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setSidenavOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setSidenavOpen(false);
    setMessages([]);
    setConversationId(null);
    setConversations([]);
  };

  const loadConversation = useCallback(async (id) => {
    if (!user?.id) return;
    setChatError('');
    try {
      const { conversation, messages: msgs } = await api.getConversation(id, user.id);
      setConversationId(conversation.id);
      setMessages((msgs || []).map((m) => ({ role: m.role, content: m.content })));
      setSidenavOpen(false);
    } catch (err) {
      const res = err.response;
      const data = res ? await res.json().catch(() => ({})) : {};
      setChatError(data?.message || data?.error || err.message || 'Failed to load conversation.');
    }
  }, [user?.id]);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setChatError('');
    setSidenavOpen(false);
    if (user?.id) {
      api.getConversations(user.id).then((data) => setConversations(data.conversations || []));
    }
  }, [user?.id]);

  const handleDeleteConversation = useCallback(
    async (id) => {
      if (!user?.id) return;
      try {
        await api.deleteConversation(id, user.id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (conversationId === id) {
          setConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        const res = err.response;
        const data = res ? await res.json().catch(() => ({})) : {};
        setChatError(data?.message || data?.error || err.message || 'Failed to delete conversation.');
      }
    },
    [user?.id, conversationId]
  );

  const handleAskSubmit = useCallback(
    async (query) => {
      const trimmed = (query || '').trim();
      if (!trimmed) return;
      const userMessage = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setChatError('');
      setChatLoading(true);
      try {
        if (user?.id) {
          const res = await api.chat({
            message: trimmed,
            conversation_id: conversationId || undefined,
            user_id: user.id,
          });
          if (res.conversation_id) setConversationId(res.conversation_id);
          const assistantMessage = {
            role: 'assistant',
            content: assistantTextFromChatResponse(res) || '(No response)',
          };
          setMessages((prev) => [...prev, assistantMessage]);
          api.getConversations(user.id).then((data) => setConversations(data.conversations || []));
        } else {
          const nextMessages = [...messages, userMessage];
          const res = await api.chat({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          });
          const assistantMessage = {
            role: 'assistant',
            content: assistantTextFromChatResponse(res) || '(No response)',
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (err) {
        const res = err.response;
        const data = res ? await res.json().catch(() => ({})) : {};
        setChatError(data?.message || data?.error || err.message || 'Something went wrong.');
      } finally {
        setChatLoading(false);
      }
    },
    [user?.id, conversationId, messages]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setChatError('');
  }, []);

  return (
    <div className="landing-page">
      <Header onMenuClick={() => setSidenavOpen(true)} user={user} onLogout={handleLogout} />
      <MainContent messages={messages} loading={chatLoading} error={chatError} />
      <InputBar onSubmit={handleAskSubmit} onClear={handleClear} disabled={chatLoading} />
      <Sidenav
        isOpen={sidenavOpen}
        onClose={() => setSidenavOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        user={user}
        onLogout={handleLogout}
        conversations={conversations}
        currentConversationId={conversationId}
        onSelectConversation={loadConversation}
        onNewConversation={newConversation}
        onDeleteConversation={handleDeleteConversation}
      />
    </div>
  );
}

export default LandingPage;
