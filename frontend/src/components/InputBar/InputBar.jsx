import { useState } from 'react';
import './InputBar.css';

const PLACEHOLDER = 'Ask mr-agent anything';

function InputBar({ onSubmit, onClear, disabled = false }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    const trimmed = value.trim();
    if (trimmed && onSubmit) onSubmit(trimmed);
    setValue('');
  };

  const handleClear = () => {
    setValue('');
    if (onClear) onClear();
  };

  return (
    <div className="input-bar">
      <form className="input-bar__form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-bar__input"
          placeholder={disabled ? 'Waiting for response…' : PLACEHOLDER}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={PLACEHOLDER}
          disabled={disabled}
        />
        <button
          type="button"
          className="input-bar__clear"
          onClick={handleClear}
          aria-label="Clear"
        >
          <ClearIcon />
        </button>
      </form>
    </div>
  );
}

function ClearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 4l10 10M14 4L4 14" />
    </svg>
  );
}

export default InputBar;
