# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## API Keys & Sensitive Data Policy

- **User-Provided API Keys**:
  - The application allows users to supply their own Gemini (or compatible) API keys for AI-assisted formatting and speech-to-text processing.
  - Keys must always be stored exclusively in the user's local secure client storage (or local OS keychain/secure storage).
  - API keys must **never** be hardcoded, logged, transmitted to any third-party backend servers, or committed to version control.
- **Data Protection & Overwrite Confirmation**:
  - AI modifications and speech-to-text note-taking features require explicit user review and confirmation before overwriting or updating any existing notes or metadata.
- **Cloud Storage & Integrations**:
  - Cloud integrations (e.g., Google Drive) must use OAuth 2.0 with minimal required scopes (restricted to application-created files only).
  - OAuth tokens and client secrets must never be exposed publicly or bundled in git repositories.

---

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please open a private security advisory on GitHub or contact the repository maintainers directly.

Please include:
- A description of the issue and potential impact
- Steps to reproduce or proof-of-concept
- Any relevant logs or environment details

We will acknowledge reports promptly and work toward a timely resolution.
