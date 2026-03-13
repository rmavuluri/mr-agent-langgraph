import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import './Sidenav.css';

const FEATURES = [
  'Unlimited searches',
  'Access to your history on device',
  'Save and share stories',
  'Tailored responses',
];

const FOOTER_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Cookie Settings', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
];

const VIEW_MENU = 'menu';
const VIEW_LOGIN = 'login';
const VIEW_SIGNUP = 'signup';
const VIEW_SETTINGS = 'settings';
const VIEW_ACCOUNT = 'account';

function Sidenav({ isOpen, onClose, onLoginSuccess, user, onLogout, conversations = [], currentConversationId = null, onSelectConversation, onNewConversation, onDeleteConversation }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="sidenav-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />
      <SidenavOpenContent
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
        user={user}
        onLogout={onLogout}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onNewConversation={onNewConversation}
        onDeleteConversation={onDeleteConversation}
      />
    </>
  );
}

function SidenavOpenContent({ onClose, onLoginSuccess, user, onLogout, conversations, currentConversationId, onSelectConversation, onNewConversation, onDeleteConversation }) {
  const [view, setView] = useState(VIEW_MENU);

  const openLogin = () => setView(VIEW_LOGIN);
  const openSignup = () => setView(VIEW_SIGNUP);
  const openSettings = () => setView(VIEW_SETTINGS);
  const openAccount = () => setView(VIEW_ACCOUNT);
  const backToMenu = () => setView(VIEW_MENU);
  const backToLogin = () => setView(VIEW_LOGIN);
  const backToSettings = () => setView(VIEW_SETTINGS);

  const handleClose = () => {
    setView(VIEW_MENU);
    onClose();
  };

  const ariaLabel = view === VIEW_LOGIN ? 'Log in' : view === VIEW_SIGNUP ? 'Sign up' : view === VIEW_SETTINGS ? 'Settings' : view === VIEW_ACCOUNT ? 'Account' : 'Main navigation';

  return (
    <aside className="sidenav" aria-label={ariaLabel}>
      {view === VIEW_MENU && (
        <SidenavMenu
          onClose={handleClose}
          onLoginClick={openLogin}
          user={user}
          onLogout={onLogout}
          onOpenSettings={openSettings}
          conversations={conversations || []}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onDeleteConversation={onDeleteConversation}
        />
      )}
      {view === VIEW_LOGIN && (
        <SidenavLogin onBack={backToMenu} onSignupClick={openSignup} onLoginSuccess={onLoginSuccess} />
      )}
      {view === VIEW_SIGNUP && (
        <SidenavSignup onBack={backToLogin} onLoginClick={backToLogin} />
      )}
      {view === VIEW_SETTINGS && (
        <SidenavSettings onBack={backToMenu} onOpenAccount={openAccount} onLogout={onLogout} />
      )}
      {view === VIEW_ACCOUNT && user && (
        <SidenavAccount user={user} onBack={backToSettings} onLogout={onLogout} />
      )}
    </aside>
  );
}

function SidenavMenu({ onClose, onLoginClick, user, onLogout, onOpenSettings, conversations, currentConversationId, onSelectConversation, onNewConversation, onDeleteConversation }) {
  return (
    <>
      <div className="sidenav__header">
        <button type="button" className="sidenav__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <span className="sidenav__title">mr-agent</span>
      </div>

      <nav className="sidenav__nav">
        <a href="#" className="sidenav__link">
          <DiscoverIcon />
          <span>Discover</span>
        </a>
        <button type="button" className="sidenav__link sidenav__link--btn" onClick={() => onNewConversation?.()}>
          <NewConversationIcon />
          <span>New conversation</span>
        </button>
      </nav>

      {user ? (
        <>
          <div className="sidenav__history-placeholder">
            {conversations.length === 0 ? (
              <p className="sidenav__history-text">Your search history will appear here</p>
            ) : (
              <ul className="sidenav__conversation-list">
                {conversations.map((c) => (
                  <li key={c.id} className="sidenav__conversation-row">
                    <button
                      type="button"
                      className={`sidenav__conversation-item ${c.id === currentConversationId ? 'sidenav__conversation-item--active' : ''}`}
                      onClick={() => onSelectConversation?.(c.id)}
                    >
                      <span className="sidenav__conversation-title">{c.title || 'New chat'}</span>
                    </button>
                    <button
                      type="button"
                      className="sidenav__conversation-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation?.(c.id);
                      }}
                      aria-label={`Delete ${c.title || 'conversation'}`}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sidenav__user-footer">
            <button type="button" className="sidenav__user-row-btn" onClick={onOpenSettings}>
              <UserIcon />
              <span className="sidenav__user-email">{user.email}</span>
              <ChevronRightIcon />
            </button>
            <button type="button" className="sidenav__logout-link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="sidenav__signup">
            <p className="sidenav__signup-title">Sign up for a free account to access:</p>
            <ul className="sidenav__signup-list">
              {FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" className="sidenav__cta" onClick={onLoginClick}>
              Log in or Create Account
            </button>
          </div>
          <footer className="sidenav__footer">
            <div className="sidenav__footer-links">
              {FOOTER_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="sidenav__footer-link">
                  {label}
                  <ExternalIcon />
                </a>
              ))}
            </div>
          </footer>
        </>
      )}
    </>
  );
}

const SETTINGS_LINKS = [
  { label: 'Cookie Settings', href: '#' },
  { label: 'Terms of Service', href: '#', external: true },
  { label: 'Privacy Policy', href: '#', external: true },
];

function SidenavSettings({ onBack, onOpenAccount, onLogout }) {
  return (
    <>
      <div className="sidenav__header sidenav__header--login">
        <button type="button" className="sidenav__back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="sidenav__login-title">Settings</span>
      </div>
      <div className="sidenav__settings-body">
        <button type="button" className="sidenav__settings-item" onClick={onOpenAccount}>
          <UserIcon />
          <span>Account</span>
          <ChevronRightIcon />
        </button>
        {SETTINGS_LINKS.map(({ label, href, external }) => (
          <a key={label} href={href} className="sidenav__settings-item">
            <span>{label}</span>
            {external ? <ExternalIcon /> : <ChevronRightIcon />}
          </a>
        ))}
        <button type="button" className="sidenav__settings-item sidenav__settings-item--logout" onClick={onLogout}>
          <LogOutIcon />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );
}

const PASSWORD_REQUIREMENTS_ACCOUNT = 'New password: 8+ characters, one capital letter, one number, no spaces.';

function SidenavAccount({ user, onBack, onLogout }) {
  const logoutTimeoutRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.changePassword({
        email: user.email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Log out after showing the success message so the user can read it
      const timeoutId = setTimeout(() => {
        onLogout();
      }, 2500);
      logoutTimeoutRef.current = timeoutId;
    } catch (err) {
      const res = err.response;
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data?.message || data?.error || err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="sidenav__header sidenav__header--login">
        <button type="button" className="sidenav__back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="sidenav__login-title">Account Settings</span>
      </div>
      <div className="sidenav__login-body">
        {error && <p className="sidenav__error" role="alert">{error}</p>}
        {success && (
          <div className="sidenav__success-block" role="status">
            <p className="sidenav__success-title">Password successfully changed</p>
            <p className="sidenav__success-detail">You have been logged out. Please sign in with your new password.</p>
          </div>
        )}
        {!success && (
        <form className="sidenav__form" onSubmit={handleSubmit}>
          <label className="sidenav__label" htmlFor="account-email">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            className="sidenav__input sidenav__input--disabled"
            value={user.email}
            readOnly
            disabled
            aria-label="Email"
          />
          <label className="sidenav__label" htmlFor="account-current-password">
            Current Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="account-current-password"
              type={showCurrent ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="sidenav__password-toggle" onClick={() => setShowCurrent((v) => !v)} aria-label={showCurrent ? 'Hide password' : 'Show password'}>
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <label className="sidenav__label" htmlFor="account-new-password">
            New Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="account-new-password"
              type={showNew ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className="sidenav__password-toggle" onClick={() => setShowNew((v) => !v)} aria-label={showNew ? 'Hide password' : 'Show password'}>
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="sidenav__password-requirements">{PASSWORD_REQUIREMENTS_ACCOUNT}</p>
          <label className="sidenav__label" htmlFor="account-confirm-password">
            Confirm New Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="account-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Repeat new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className="sidenav__password-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <button type="submit" className="sidenav__submit" disabled={submitting}>
            {submitting ? 'Changing…' : 'Change Password'}
          </button>
        </form>
        )}
      </div>
    </>
  );
}

function SidenavLogin({ onBack, onSignupClick, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.login({ email, password });
      onLoginSuccess(res.user);
    } catch (err) {
      const res = err.response;
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data?.message || data?.error || err.message || 'Log in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="sidenav__header sidenav__header--login">
        <button type="button" className="sidenav__back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="sidenav__login-title">Log in</span>
      </div>

      <div className="sidenav__login-body">
        <p className="sidenav__login-prompt">
          Don&apos;t have an account?{' '}
          <button type="button" className="sidenav__signup-link" onClick={onSignupClick}>
            Sign up
          </button>
        </p>

        {error && <p className="sidenav__error" role="alert">{error}</p>}

        <form className="sidenav__form" onSubmit={handleSubmit}>
          <label className="sidenav__label" htmlFor="sidenav-email">
            Email
          </label>
          <input
            id="sidenav-email"
            type="email"
            className="sidenav__input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="sidenav__label" htmlFor="sidenav-password">
            Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="sidenav-password"
              type={showPassword ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="sidenav__password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <button type="submit" className="sidenav__submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="sidenav__divider">Or log in with</p>

        <div className="sidenav__social">
          <button type="button" className="sidenav__social-btn sidenav__social-btn--google">
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button type="button" className="sidenav__social-btn sidenav__social-btn--apple">
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>
    </>
  );
}

const PASSWORD_REQUIREMENTS = 'Password must be at least 8 characters long and contain the following: At least one capital letter, at least one number, no spaces.';

function SidenavSignup({ onBack, onLoginClick }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const pad = (n) => String(n).padStart(2, '0');
    const dateOfBirth = year && month && day ? `${year}-${pad(month)}-${pad(day)}` : '';
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.signup({ email, password, confirmPassword, dateOfBirth });
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDay('');
      setMonth('');
      setYear('');
    } catch (err) {
      const res = err.response;
      const data = res && (await res.json().catch(() => ({})));
      setError(data?.message || data?.error || err.message || 'Sign up failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="sidenav__header sidenav__header--login">
        <button type="button" className="sidenav__back" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <span className="sidenav__login-title">Sign up</span>
      </div>

      <div className="sidenav__login-body">
        <p className="sidenav__login-prompt">
          Already have an account?{' '}
          <button type="button" className="sidenav__signup-link" onClick={onLoginClick}>
            Log in
          </button>
        </p>

        {error && <p className="sidenav__error" role="alert">{error}</p>}
        {success && <p className="sidenav__success" role="status">Account created. You can log in now.</p>}

        <form className="sidenav__form" onSubmit={handleSubmit}>
          <label className="sidenav__label" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className="sidenav__input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="sidenav__label" htmlFor="signup-password">
            Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Must be 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="sidenav__password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="sidenav__password-requirements">{PASSWORD_REQUIREMENTS}</p>

          <label className="sidenav__label" htmlFor="signup-confirm-password">
            Confirm Password
          </label>
          <div className="sidenav__password-wrap">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="sidenav__input"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="sidenav__password-toggle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <label className="sidenav__label">Date of Birth</label>
          <div className="sidenav__dob-row">
            <input
              type="text"
              className="sidenav__input sidenav__input--dob"
              placeholder="DD"
              maxLength={2}
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
              aria-label="Day"
            />
            <input
              type="text"
              className="sidenav__input sidenav__input--dob"
              placeholder="MM"
              maxLength={2}
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
              aria-label="Month"
            />
            <input
              type="text"
              className="sidenav__input sidenav__input--dob"
              placeholder="YYYY"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
              aria-label="Year"
            />
          </div>

          <button type="submit" className="sidenav__submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="sidenav__divider">Or sign up with</p>

        <div className="sidenav__social">
          <button type="button" className="sidenav__social-btn sidenav__social-btn--google">
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button type="button" className="sidenav__social-btn sidenav__social-btn--apple">
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 4l12 12M16 4L4 16" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2m3 0v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6h12z" />
      <path d="M8 10v6M12 10v6M16 10v6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4L6 10l8 6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5l12 10M10 8a2 2 0 0 1 2 2c0 .5-.2.9-.5 1.2M3 3l14 14" />
      <path d="M7 7C4.5 8.5 3 10 2 10s2.5 3 6 4c1.5.4 2.8.5 4 .5" />
      <path d="M14 10c0-1-.5-2-1.5-2.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-2.7.83 4.8 4.8 0 0 1-4.5-3.3H1.2v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.08 10.59a4.8 4.8 0 0 1 0-3.18V5.34H1.2a8 8 0 0 0 0 7.18l2.88-2.23z" />
      <path fill="#EA4335" d="M8.98 3.58c1.3 0 2.46.45 3.38 1.3l2.54-2.54A7.9 7.9 0 0 0 8.98 1a8 8 0 0 0-7.78 4.34l2.88 2.23a4.8 4.8 0 0 1 4.9-3.99z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <path d="M14.5 9.54c-.03-2.3 1.88-3.4 2.01-3.48-1.1-1.61-2.82-2.04-3.43-2.08-1.46-.15-2.85.86-3.59.86-.75 0-1.85-.83-3.05-.81-1.57.02-3.01.91-3.83 2.32-1.63 2.83-.42 7.02 1.17 9.33.78 1.12 1.68 2.38 2.88 2.34 1.17-.05 1.61-.76 3.03-.76 1.41 0 1.81.76 3.05.73 1.26-.02 2.06-1.14 2.83-2.25.89-1.28 1.26-2.52 1.28-2.58-.03-.02-2.45-.94-2.47-3.74zM11.98 4.42c1.3-1.57 1.09-3.84-.69-5.18-.95-.66-2.2-.52-3.33.12-1.02.6-1.9 1.56-1.74 1.66 1.39.11 2.78-.75 3.76-1.6z" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 8.5c0 3.6-2.9 6.5-6.5 6.5-1.2 0-2.3-.3-3.3-.8L3 16l1.8-4.2C3.3 10.7 3 9.6 3 8.5 3 4.9 5.9 2 9.5 2S16 4.9 16 8.5z" />
    </svg>
  );
}

function NewConversationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
      <path d="M12 2v4a2 2 0 0 0 2 2h4" />
      <path d="M7 8h6M7 11h4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="6" r="3.25" />
      <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 4l6 6-6 6" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M14 14l4-4-4-4" />
      <path d="M18 10H8" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M7 2h3v3M10 2L4 8M4 2h4v4" />
    </svg>
  );
}

export default Sidenav;
