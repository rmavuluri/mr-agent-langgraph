---
name: react-ui
description: Implements or modifies the React frontend (pages, components, API client, state). Use when working on the UI in frontend/, adding components, or integrating with the backend API in this project.
---

# React UI

## When to use
Apply when working in `frontend/`: new or existing pages, components, styles, or calls to the backend API.

## Quick reference
- **Structure**: Pages in `src/pages/`, components in `src/components/` (folder per component with index + CSS). Use `src/services/api.js` for all backend calls.
- **API**: Base URL from `VITE_API_URL`. Use exported functions from `api.js`; add new endpoints as named functions with JSDoc. On error, read `err.response` and show a clear message.
- **State**: Page-level state and callbacks; handle loading and error for async ops. Persist only what’s needed (e.g. user in localStorage with one key).
- **A11y**: Semantic HTML, ARIA where helpful, keyboard support (e.g. Escape to close). No hardcoded secrets in frontend.

## Project context
- Stack: React, Vite. Existing patterns: functional components, relative imports, named exports.
- Follow `.cursor/rules/react-ui.mdc` for full conventions.
