# Security Policy

## Supported Versions

Only the most recent major version receives security updates. Users are encouraged to keep their installed app updated to the latest version available on the Google Play Store.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: Active support |
| < 1.0  | :x: No longer supported |

Security fixes are applied to the `main` branch and released as a patch update as soon as a fix has been developed, reviewed, and tested.

## Reporting Vulnerabilities

We take security seriously. To report a security vulnerability, please follow these steps:

1. Do not open a public GitHub issue.
2. Send an email to security@opencode.ai with the following details:
   - Description of the vulnerability.
   - Steps to reproduce the vulnerability.
   - Potential impact of the vulnerability.
   - Any suggested mitigation or fix (if available).
3. You will receive an acknowledgment within 48 hours.
4. The team will investigate and provide a status update within 5 business days.
5. Once the vulnerability is verified, a fix will be developed and a security advisory will be coordinated with the reporter.

We kindly request that you give us a reasonable amount of time to fix and release a patch before any public disclosure.

## Security Best Practices

### For Developers

- All environment variables and secrets must be stored in environment-specific `.env` files, never committed to the repository.
- Use EAS Build secrets (`npx eas secret:create`) to store sensitive values like API keys and service account credentials.
- Pull Requests that include or modify dependencies must be reviewed to ensure no malicious packages are introduced.
- Enable branch protection on the main branch to require pull request reviews and CI checks.
- Use dependabot or similar tools to automatically detect vulnerable dependencies.

### For Users

- Only download the OpenCode mobile app from official app stores (Google Play Store).
- Do not install APKs from untrusted sources.
- Ensure your device operating system is up to date to receive the latest security patches.

### Secrets Storage

- Never store secrets, tokens, passwords, or API keys in code or configuration files committed to the repository.
- Use the following approach for secret management:
  - Local development: `.env` files (add .env to .gitignore).
  - EAS Builds: EAS secrets with `npx eas secret:create`.
  - CI/CD: GitHub secrets (Settings > Secrets and variables > Actions).
- The service account key for Play Store publishing must be stored securely and access limited to the CI pipeline only.

### Dependency Management

- Regularly run `npm audit` to check for known vulnerabilities in npm packages.
- The `package.json` and `package-lock.json` files must be reviewed for unauthorized package additions.
- Do not use deprecated or unmaintained packages.
