## Project Instructions

### 1. General Rules
- Inspect the existing project structure and implementation before making changes.
- Read the relevant local Next.js documentation in `node_modules/next/dist/docs/` before writing or modifying code that depends on Next.js APIs.
- Follow the installed dependency versions in `package.json` and the lockfile.
- Do not assume APIs or conventions from older Next.js versions are compatible with this project.
- Make changes directly to the existing project files when requested. Do not merely provide code snippets or examples.
- Preserve existing functionality unless a change is explicitly requested.
- Prefer minimal, targeted changes over unnecessary rewrites.

### 2. Code Quality
- Follow the existing coding style, naming conventions, and project architecture.
- Maintain TypeScript type safety. Avoid using `any` unless justified.
- Check related components, server actions, queries, validation, and types before changing a feature.
- Do not create duplicate implementations when an existing function or component can be extended safely.

### 3. Supabase and Database Safety
- Inspect the existing database queries and schema assumptions before modifying database-related code.
- Never execute destructive SQL, delete production data, or modify production database schemas without explicit approval.
- If a database migration is required, explain the changes and provide the SQL separately for review before execution.
- Do not expose service-role keys, passwords, tokens, or other secrets in client-side code, logs, or generated files.

### 4. Environment Variables
- Preserve existing `.env` and `.env.local` files.
- Do not overwrite, delete, rename, or modify environment variables unless explicitly requested or strictly necessary.
- Never print or include actual secret values in responses, logs, documentation, or source code.
- If a required environment variable is missing, report its name without revealing other environment values.

### 5. Git and Deployment
- Do not run destructive Git commands such as `git reset --hard`, `git clean -fd`, or force-push without explicit approval.
- Do not commit, push, or deploy changes unless explicitly requested.
- Inspect `git status` before making changes when possible, and preserve unrelated user modifications.

### 6. Verification and Reporting
- After making changes, run the relevant available checks, such as linting, type checking, and production builds.
- Report the files changed, the purpose of each change, the checks performed, and any remaining issues.
- Do not claim a test or build passed unless it was actually executed successfully.
- If a check fails, investigate the cause and report the result honestly.
- If an instruction cannot be followed because a file, dependency, permission, or documentation is unavailable, explain the limitation instead of guessing.