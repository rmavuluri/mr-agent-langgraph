import './Header.css';

function Header({ onMenuClick, user, onLogout }) {
  return (
    <header className="header">
      <button
        type="button"
        className="header__brand"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <span className="header__hamburger" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="header__logo-icon" aria-hidden>
          <MrAgentIcon />
        </span>
        <span className="header__logo-text">mr-agent</span>
      </button>
      {user && (
        <div className="header__user">
          <span className="header__user-email">{user.email}</span>
          <button type="button" className="header__logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}

function MrAgentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="6" r="3.25" />
      <path d="M5 18c0-2.5 2.5-4.5 5-4.5s5 2 5 4.5" />
      <circle cx="8" cy="6" r="0.75" fill="currentColor" />
      <circle cx="12" cy="6" r="0.75" fill="currentColor" />
    </svg>
  );
}

export default Header;
