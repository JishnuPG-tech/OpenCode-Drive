# Contributing to OpenCode Mobile

## How to Contribute

We welcome contributions to OpenCode Mobile. Whether you are fixing bugs, adding features, improving documentation, or writing tests, your help makes the project better.

### Types of Contributions

- **Bug Fixes** - Report bugs via GitHub Issues and submit pull requests with fixes.
- **Feature Implementations** - Propose new features by opening an issue before starting work.
- **Documentation Improvements** - Help keep README, API docs, and other documentation accurate and clear.
- **Test Coverage** - Add unit tests for existing or new functionality.
- **Code Reviews** - Review open pull requests to ensure code quality and consistency.

## Pull Request Process

### Step 1: Discuss Before Working

Before starting significant work, open a GitHub Issue to discuss the proposed changes. This avoids duplication of effort and ensures your contribution aligns with the project direction.

### Step 2: Fork and Branch

1. Fork the repository on GitHub.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Use a descriptive branch name:
   - `fix/` for bug fixes (e.g., `fix/sse-reconnection-loop`)
   - `feature/` for new features (e.g., `feature/message-search`)
   - `docs/` for documentation (e.g., `docs/api-endpoint-descriptions`)
   - `chore/` for maintenance (e.g., `chore/update-dependencies`)

### Step 3: Develop

- Follow the code conventions outlined in [DEVELOPMENT.md](DEVELOPMENT.md).
- Write tests for new functionality.
- Ensure all existing tests pass: `npm test`
- Ensure TypeScript compiles: `npm run typecheck`
- Ensure lint passes: `npm run lint`

### Step 4: Commit

Write clear, concise commit messages that describe what the change does and why:

```
feat: add session forking support

Implement the fork session endpoint integration with a new
"Fork Session" button in the session context menu.
```

Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

### Step 5: Submit Pull Request

1. Push your branch to your fork: `git push origin feature/your-feature-name`
2. Open a pull request against the `main` branch.
3. Fill out the pull request template with:
   - Description of the change
   - Related issue number
   - Screenshots (if UI changes)
   - Testing steps
   - Checklist of verification items

### Step 6: Code Review

Respond to reviewer feedback promptly. Make requested changes and push updates to the same branch. The PR will be updated automatically.

## Code Review Guidelines

### For Authors

- Keep pull requests focused on a single concern. Split large changes into smaller PRs.
- Ensure the PR description clearly explains what and why.
- Respond to all review comments.
- Self-review your code before requesting reviews.

### For Reviewers

- Be constructive and respectful. Focus on the code, not the person.
- Verify the change addresses the issue or feature request.
- Check for:
  - Correctness and edge cases
  - TypeScript type safety
  - Proper error handling
  - Performance implications
  - Adherence to project conventions
  - Test coverage
- Approve only when all concerns are addressed.

### Review Checklist

- [ ] Code follows project conventions (naming, structure, imports)
- [ ] TypeScript strict mode is satisfied (no `any` types, no implicit any)
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] Error paths are handled (network errors, server errors, empty states)
- [ ] New features include appropriate tests
- [ ] Accessibility considerations are addressed
- [ ] No hardcoded strings that should be in configuration
- [ ] Theme colors are used consistently (no hardcoded color values)

## Issue Reporting

### Bug Reports

When reporting a bug, include the following information:

1. **Description** - Clear and concise description of the bug
2. **Steps to Reproduce** - Minimal steps to reproduce the behavior
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - Device model, Android version, app version, server version
6. **Logs** - Relevant console logs or crash traces
7. **Screenshots** - If applicable

Use the GitHub issue template for bug reports.

### Feature Requests

When requesting a feature:

1. Describe the problem you are trying to solve.
2. Explain how the feature would work.
3. Provide examples of how you would use it.
4. Note if the feature requires server-side changes.

### Labels

Issues and PRs are labeled with the following categories:

- `bug` - Confirmed bug
- `enhancement` - Feature request
- `documentation` - Documentation related
- `good first issue` - Suitable for new contributors
- `help wanted` - Needs contributor assistance
- `needs discussion` - Requires team discussion
- `dependencies` - Dependency updates

## Code of Conduct

All contributors are expected to maintain a respectful and inclusive environment. Harassment, discrimination, and personal attacks are not tolerated.