# Repository Instructions

These instructions apply to the entire repository.

## Required order of work

1. Read the relevant source, schema, migrations, documentation, and current Git state before editing.
2. Update `description.md` before modifying application code, database files, configuration, or other project files.
3. Preserve unrelated user changes and never discard a dirty worktree.
4. Implement and verify the requested change.

## Mandatory release version synchronization

Every completed repository update must receive a version update. Use semantic versioning:

- Patch (`x.y.Z`) for fixes, documentation, configuration, styling, translations, and backward-compatible small enhancements.
- Minor (`x.Y.0`) for substantial backward-compatible features.
- Major (`X.0.0`) for breaking changes or major architecture releases.

For every version update, synchronize all of the following in the same change:

1. `package.json` — update the top-level `version`.
2. `package-lock.json` — update both the root `version` and `packages[""]` version. Do not alter dependency versions unintentionally.
3. `public/index.html` — update the visible `#app-version` fallback.
4. `public/index.html` — update every local CSS and JavaScript `?v=` cache-buster to the same semantic version.
5. `src/routes/system.js` — keep `/api/version` on the same semantic version through `package.json` and update its build identifier.
6. `description.md` — update **Current Release and Notifications** with the new release, build, and a concise description of the completed work.

Build identifiers use `YYYY-MM-DD.N`, based on the repository's working timezone (`Asia/Bangkok`). Start at `.1` for the first release build of a date and increase `N` for each later release that day. Never reuse a build identifier.

The version must be visible after deployment in the sidebar as `v<version> · <build>` through `/api/version`. Do not hard-code a conflicting version elsewhere.

Before finishing, search for the previous semantic version and build identifier to catch stale UI labels or asset cache-busters. Explain any intentionally retained historical references.

## Release and change logging

- The current release entry in `description.md` is the authoritative human-readable release record.
- Log user-visible behavior, permissions, schema/migration requirements, notification behavior, deployment implications, and backward-compatibility notes when relevant.
- Do not use runtime `log.md` as a release changelog; it is application output and is ignored by Git.
- Never log passwords, tokens, SMTP credentials, OneSignal secrets, database credentials, session secrets, or other sensitive values.

## Database changes

- Add a new numbered SQL file under `database/migrations/` for every schema or data migration.
- Keep `database/schema.sql` synchronized for fresh installations.
- Make changes backward-compatible with existing records whenever possible.
- Update legacy-schema detection in `scripts/migrate.js` when a current fresh schema could otherwise replay a migration.
- Verify the migration runner and document any required deployment action.

## English and Vietnamese

- Every new or changed user-facing label, form field, status, validation error, empty state, notification, and action must be properly adapted in both English and Vietnamese.
- Preserve stable API and database values while translating display labels.

## Verification

Run checks proportional to the change. At minimum, before handoff:

```bash
npm run check
git diff --check
```

For database changes, also run `npm run migrate` against the local development database and test repeat execution. For API or UI changes, exercise the affected role and workflow. Confirm `/api/version` returns the synchronized version and build when the local server is running.

Report the new version and build in the final response.
