import './MainContent.css';

function MainContent({ messages = [], loading = false, error = '' }) {
  if (error) {
    return (
      <main className="main-content">
        <div className="main-content__error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <main className="main-content">
        <div className="main-content__empty">
          <p className="main-content__empty-text">Ask mr-agent anything in the box below.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="main-content__messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`main-content__message main-content__message--${msg.role}`}
          >
            <div className="main-content__message-bubble">
              <span className="main-content__message-label">
                {msg.role === 'user' ? 'You' : 'mr-agent'}
              </span>
              <p className="main-content__message-text">
                {typeof msg.content === 'string' ? msg.content : ''}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="main-content__message main-content__message--assistant">
            <div className="main-content__message-bubble main-content__message-bubble--loading">
              <span className="main-content__typing">Thinking…</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MainContent;
