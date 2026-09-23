# SEEE Workspace 3.0 — Application reference

Updated 2026-09-23. This branch now runs a **new school-wide application**, not an upgrade of Activity Hub. The active code, database and static assets are isolated from the legacy implementation. Product decisions live in plan.md; local setup/accounts/walkthroughs live in LOCAL_TESTING.md.

## 1. Current deliverable

A locally runnable Express/MySQL workspace for SEEE's leadership, academic departments, office, centers and student organizations. It provides activities, documents and requests; public/team/role audiences; tasks, discussion and protected materials; scoped Member/Leader appointments; central permission and identity administration; configurable versioned approval workflows; and administrator-only audit/history export.

The UI has a new school-wide shell, dashboard, working-unit filter, record cards/details, task views, unit directory, approval inbox and Admin Center. Core navigation/form labels support EN/VI. Some explanatory/admin text remains English; complete editorial localization is a follow-up.

Version/package/cache identifiers are 3.0.0. The application binds to 127.0.0.1 by default. Production deployment, real Microsoft tenant integration and outbound email/push have not been verified by the local test suite.

## 2. Active repository structure

```text
app.js                              New application entry, loopback listener/shutdown
package.json / package-lock.json     New commands and locked dependencies
.env.example                        New configuration template; use .env.local
LOCAL_TESTING.md                     Setup, accounts, walkthrough, reset and checks
plan.md                             Confirmed product direction and remaining design
src/workspace/
  app.js                            Express, sessions, CSRF, login/SSO, static files
  database.js                       Pool, transaction, JSON and audit helpers
  session-store.js                   MySQL session storage using current mysql2
  catalog.js                        Permission keys, starter roles, HUST validation
  access.js                         Fresh identity, scoped actions, shared SQL visibility
  validation.js                     IDs, text, dates, HTTP(S) links
  workflows.js                      Version resolution, approver eligibility, transitions
  routes.js                         Records/tasks/comments/files/approvals/export
  admin.js                          Units, roles, appointments, accounts and workflows
public/workspace/
  index.html                        New shell host/dialog/live feedback
  styles.css                        Design tokens, responsive shell and components
  app.js                            Hash routes, API client, forms, Admin Center, EN/VI labels
database/workspace/schema.sql      Standalone schema, unrelated to old migrations
scripts/local/
  database.js                       Start isolated MySQL, initialize private data directory
  setup.js                          Configure new DB/user/secrets and initialize seeds
  seed.js                           Synthetic organization/users/work/workflows
  reset.js                          Explicitly confirmed demo-only reset
  stop.js                           Stop only the matching private MySQL
scripts/check.js                    Active application/tool/test syntax validation
tests/workspace/
  integration.test.js               Real MySQL/HTTP authorization and workflow tests
  browser.js                        Playwright desktop/mobile workflow checks
```

Runtime files are ignored: `.env.local`, `.local/mysql-data`, `.local/mysql-admin.json`, `.local/workspace-uploads`, MySQL logs and screenshots. The old src routes, top-level public assets, SQL migrations, historical dumps and user guides remain as repository history/reference; app.js does not load or serve them. Old database scripts and old cPanel settings must not be used as the new-app setup procedure.

## 3. Runtime and persistence

Node 22; Express 5; MySQL 8 with utf8mb4 and Vietnam (+07:00) database time. Setup starts a separate mysqld bound to 127.0.0.1:3307 under .local/mysql-data. The existing MySQL on 3306 is untouched. Application schema: seee_workspace_local. Tests use separate fixed schemas seee_workspace_test and seee_workspace_browser.

Setup verifies @@datadir before changing a listening server, generates random root/app/session secrets, grants the application account access only to its schema, and seeds only an uninitialized database. Re-running setup preserves user changes. It refuses an unexpected schema version. Reset requires an explicit database confirmation and does not remove uploads or other databases.

`createApplication({db?})` returns app/db/close for tests and runtime. SQL lives in small domain modules. Mutation transactions lock the authorization revision row and reload identity before evaluating permission, serializing grants/revocations against writes. This deliberately favors correctness for one school; benchmark/change the lock design before high write concurrency.

Sessions are stored in workspace_sessions using the same mysql2 pool, with expiry cleanup. The cookie is HTTP-only, SameSite=Lax, 12 hours and Secure in production. Login regenerates the session; session data carries user ID and CSRF token, not authoritative roles. Each request reloads active state, memberships and roles. Mutations require CSRF token and reject mismatched browser Origin. Demo login has a per-IP attempt limit. Helmet supplies a same-origin CSP; no external browser fonts/scripts are required.

## 4. Identity and access semantics

Only @hust.edu.vn and @sis.hust.edu.vn are accepted. Local demo authentication is explicitly enabled by LOCAL_DEMO_AUTH=true, supports synthetic seeded users only and refuses NODE_ENV=production. Demo email addresses do not prove real identity.

Microsoft authorization-code login uses session-bound state, token exchange and OIDC userinfo. Verified new users are basic public users without team roles. Provider subject binds identity; a matching pre-existing demo email is rejected for controlled reconciliation, preventing automatic takeover of mock authority. Real tenant credentials and verified admin bootstrap are separate from the local demonstration.

Recovery owner is van.nguyendinh@hust.edu.vn. A synthetic local Administrator with this address demonstrates the designation; it is not a recovery bypass or proof of the real person's identity.

### Roles

| Role | Scope and behavior |
| --- | --- |
| Basic public user | Every active authenticated HUST user; public published records only |
| Member | Exact unit; baseline ordinary-team reading, default create/submit/comment/upload/assigned-task permissions |
| Leader | Exact unit; team work management, approval when workflow selects it, same-team Member/Leader appointments |
| Dean | Global operational reading, including published team/Leader-exclusive records; no administration or sensitive/history access |
| Administrator | Central roles/accounts/units/workflows, sensitive records, audit and XLSX history; protected system role |
| Custom roles | Centrally created unit/global bundles of supported action permissions; no arbitrary executable policy |

Public and ordinary member read baselines are built into audience evaluation. Checkbox matrix controls actions. Administrative permissions are reserved for Administrator; unit roles cannot receive school.read. Dean remains read-only; another separately assigned role is required for additional actions. Official titles/organizational parent relationships never grant authority.

Role changes affect existing sessions on the next request. Removing Member removes that membership and its unit roles. A team Leader may appoint Members/Leaders in that team but cannot assign global/other-team roles or edit role definitions/global identities. Appointment preserves existing affiliations. Central administrators can revoke/deactivate; the last active Administrator cannot be removed or deactivated. Last-team-Leader protection is a design follow-up, not enforced in this release.

### Audience rules

Records have one owning unit and one audience mode:

- public: default for new ordinary publications; every active signed-in HUST user.
- teams: selected unit IDs; matching active memberships.
- roles: selected role ID plus exact unit/global scope pairs. Entries are OR alternatives, while each role/scope pair is conjunctive.
- admin: sensitive classification, Administrator-only and not downgradable by editing.

Ordinary Member access cannot bypass role-exclusive audiences. Dean operational reading is a system exception for published/completed non-sensitive records. Draft/pending records are readable by their author or Administrator, with a separate limited workflow review view for eligible approvers. No anonymous record access exists.

The same SQL visibility expression filters lists/counts/details, task queries, file metadata/downloads and notifications. Action permission is checked separately from reading. Publication/audience edits require owner-authority plus publish permission; modifying a published record returns it to draft for review. Pending/completed records are not directly editable. Owner transfer is not implemented.

## 5. Domains and workflows

### Records

A unified records table stores activity/document/request kinds, title/body, owning unit, author, audience rules, deadline, optional HTTP(S) link, status, optimistic version and timestamps. Search filters by kind/title/body/unit/status, returning 24 authorized rows per page and authorized total count.

Statuses: draft → pending → published → pending → completed. Rejection/cancellation restores the status before submission. Edit uses a version check to reject stale forms. Published edits return to draft; there is no hidden edit-to-approval bypass. The public default does not republish old data, because no legacy data is imported.

### Tasks, discussion and materials

Tasks belong to a record and have title, one assignee, creator, deadline, status and completed_at. Published work is required for task creation/status changes. Assignees must be eligible active owning-team members with current record visibility and task.update.assigned. Managers can update tasks; assignees can update their own. Reopening clears completed_at.

Comments inherit record access and require comment.create. Files inherit current record access for uploads/downloads. Upload limit is 10 MiB/file and 50 MiB aggregate/record, checked under a record transaction lock. UUID filenames reside outside the static tree. Downloads use attachment disposition after authorization. Supported extensions: PNG/JPG/JPEG/WebP/PDF/TXT/CSV/DOCX/XLSX/PPTX/ZIP. Extension/size validation is not a malware scan; production scanning/content inspection remains follow-up work.

There is no independent task-only audience, multi-assignee model, file deletion UI or ownership transfer in this local release. Tasks/comments/files share the parent boundary. Workflow review returns only the request record snapshot/context, not its unrelated files/tasks.

### Configurable approvals

Supported action types: record.publish and record.complete. Admin Center can publish a school-default or exact-unit override with one to eight ordered steps. Each step selects an approving role, global/owning-unit/specific-unit scope and any/all quorum. Self-approval is explicitly configurable and disabled in seeds.

Definitions are immutable versions. New submissions resolve latest exact-unit override before latest school default. Existing requests retain their definition version. No definition rejects submission; no eligible approver creates a blocked request. Snapshot recipient IDs are checked against current active-role eligibility when deciding. All-approver quorum cannot silently shrink after revocation. Repeated decisions are rejected; record locks and serialized transactions prevent duplicate state transitions.

Approvals produce audit rows and local inbox notifications. Reject returns work to its previous state. Author/Administrator may cancel pending/blocked requests. Administrative correction is cancel → fix roles/new workflow → resubmit, rather than silently editing a running workflow. All-quorum revocation is marked blocked when an approval attempts to advance; a pending request with all eligibility removed otherwise stays pending until cancellation/correction. No background workflow repair job exists.

### Administrative controls

Admin Center provides role permission checkboxes, role creation, global/unit grants/revocations, account active state, unit creation/editing, cycle-safe parent validation, workflow configuration, recent audit and XLSX record export. Unit deactivation requires active children to be moved/deactivated first. A unit switcher is a filter, not a grant.

History export and audit/sensitive controls are Administrator-only. Export includes record ID/kind/title/owning unit/status/audience/deadline/created date. Audit captures access/role/unit/workflow/task/material changes and export activity; the API does not edit audit rows. Audit listing shows the latest 100 events. Complete retention rules and richer reports remain deferred.

## 6. Database tables

Standalone definition: database/workspace/schema.sql. No old numbered migration runner is used.

| Table | Main purpose / invariants |
| --- | --- |
| app_metadata | schema_version=3.0.0 and authorization_revision transaction lock |
| users | Unique HUST email, name, demo hash or Microsoft provider subject, identity source, active flag |
| units | Unique code, EN/VI name, type, confirmed/display parent, color, active; parent FK/cycle validation |
| memberships | Composite user/unit; affiliation stored separately from roles |
| roles | Unique code, name, global/unit scope, JSON permission keys, revision/protected seed flag |
| global_roles | Composite user/role assignments |
| unit_roles | Composite user/unit/role; FK to membership with cascade on membership removal |
| records | Kind/content/ownership/author/audience JSON/status/deadline/link/optimistic version/timestamps |
| workflow_versions | Action type, optional unit override, version, JSON steps, self-approval flag, creator |
| workflow_instances | Record/version/action/submitter/current step, required-user snapshot, state, previous record state |
| workflow_decisions | Actor/instance/step/decision/note; unique actor decision per step |
| tasks | Record/title/assignee/creator/deadline/status/completed_at |
| comments | Record/author/body/time |
| attachments | Record/contributor/original and stored names/bytes/time |
| notifications | Recipient/record/generic title/time; only current-visible records returned |
| audit_events | Actor/action/target/JSON details/time |
| workspace_sessions | Runtime-created session ID, expiry, serialized session; expiry index |

SQL FKs preserve attribution; records are not physically deleted by the new API. Audience/workflow JSON is validated against actual role/unit rows on input; roles are not deleted by the UI. Schema-only initialization and synthetic seeds are separate. Setup preserves an initialized schema; reset and test scripts explicitly target their own fixed local databases.

## 7. Active API map

All domain endpoints require active HUST identity. JSON errors use {error}; write requests require X-CSRF-Token. IDs/strings/dates/audiences/role scope are validated centrally. Failure statuses include 400/401/403/404/409/413/415/429. Files and Excel return binary responses.

| Endpoint | Purpose |
| --- | --- |
| GET /api/session | Public session bootstrap, CSRF token, demo/SSO flags and version |
| GET /api/health | DB connectivity and application identity |
| POST /api/login | Local demo identities only |
| GET /auth/microsoft, /auth/microsoft/callback | Real HUST SSO entry/callback when configured |
| POST /api/logout | Destroy session |
| GET /api/bootstrap | Current roles/memberships, active units, role labels, authorized stats/capabilities |
| GET/POST /api/records | Paginated visible search / create draft |
| GET/PATCH /api/records/:id | Visible detail / version-checked edit back to draft |
| POST /api/records/:id/submit | Start record.publish or record.complete workflow |
| GET /api/tasks | All visible tasks assigned to current user |
| GET /api/records/:id/assignees | Eligible owning-unit assignees, manager-only |
| POST /api/records/:id/tasks | Create/assign task |
| PATCH /api/tasks/:id | Scoped task status |
| POST /api/records/:id/comments | Comment on visible record |
| POST /api/records/:id/attachments | Multipart file upload |
| GET /api/attachments/:id | Protected download |
| GET /api/approvals | Own submissions, current eligible pending requests or Admin overview |
| POST /api/approvals/:id/decision | Approve/reject current assigned step |
| POST /api/approvals/:id/cancel | Author/Admin cancellation |
| GET /api/notifications | Latest 30 currently visible local notifications |
| GET /api/people | Active HUST appointment candidates for Leaders/Admin |
| GET /api/units/:id/members | Team roster for its members/Admin |
| POST /api/units/:id/appointments | Scoped Member/Leader appointment |
| GET /api/admin | Admin data: units/roles/users/assignments/catalog/workflows/audit |
| POST/PATCH /api/admin/units[/:id] | Unit creation/editing/deactivation |
| POST/PATCH /api/admin/roles[/:id] | Role creation/matrix updates |
| POST /api/admin/assignments | Grant/revoke role; Member revocation removes membership |
| PATCH /api/admin/users/:id | Active state with last-admin protection |
| POST /api/admin/workflows | Publish immutable workflow version |
| GET /api/admin/export | Administrator-only XLSX history |

Legacy API URLs are not a compatibility contract. Unknown /api endpoints return JSON 404. Only public/workspace is served statically, so old scripts/assets and storage cannot be requested through the new server.

## 8. UI design and extension conventions

School-wide navigation: Overview, Activities, Documents, Requests, My work, Teams & units, Approvals, Admin Center (Administrator only). Detail routes use #record/:id. The app uses same-origin fetch with session cookies and CSRF, escaped templates, event delegation and native dialogs. Route-generation checks prevent stale page responses from replacing newer routes.

Design: forest green #245c49 / #183e35, warm off-white #f5f6f1, muted #73837b and border #dfe6dc. System sans-serif fonts; no font download. Fixed 242px sidebar, 77px topbar, max content width 1510px, white rounded panels, distinct unit accents, status/audience badges, dark-green overview banner. Responsive breakpoints at 1200/800/530px collapse columns and provide a mobile drawer. Native labels, focus outlines, dialog headings, live toast and feedback support keyboard use.

Language preference is stored as workspace-language; working-unit filter as workspace-unit. Unit filter never changes effective permissions. API state contains role capabilities, not editable authority. Forms show server validation, disable submissions while saving, and re-fetch after writes. Desktop/mobile screenshots and workflow interactions are exercised by Playwright.

When adding a domain/action: define the catalog key, validate role scope, add the domain transaction and shared visibility checks, add workflow support if needed, then capability-driven UI and tests. Do not reintroduce legacy users.role checks or grant powers based on unit hierarchy. Keep draft, pending and publication audience boundaries explicit.

## 9. Configuration, verification and remaining work

WORKSPACE_DB_HOST/PORT/USER/PASSWORD/NAME configure the new DB; WORKSPACE_SESSION_SECRET configures sessions; WORKSPACE_PORT defaults 3000; LOCAL_DEMO_AUTH controls synthetic login. Azure variables configure real SSO. The local setup writes .env.local automatically; .env.example documents manual configuration. No Gmail/OneSignal credentials are used by the new app.

Commands: npm ci; npm run setup:local; npm start; npm run db:start/db:stop; npm run reset:local with explicit confirmation; npm run check; npm test; npm run test:ui. See LOCAL_TESTING.md for exact instructions and accounts.

Verification uses actual disposable MySQL schemas plus HTTP/browser clients, covering HUST/CSRF boundaries, audience list/detail consistency, wrong-unit actions, session revocation, workflows, scoped appointments, protected attachments, export, unit cycles and last-admin protection. The dependency lock includes current mysql2/Multer patches and an ExcelJS uuid override; npm audit reports zero vulnerabilities at the time of this implementation. Recheck on future dependency updates.

Remaining deployment/product work: real Microsoft tenant setup and administrator identity provisioning, production HTTPS/proxy/session configuration, actual unit reporting lines/rosters, complete EN/VI editorial coverage, backup/recovery operations, external delivery, comprehensive accessibility evaluation, task-only sharing/multiple assignees, advanced workflow action types, effective-access explanation UI, and detailed retention/archival policies. This is a working local-test application; those boundaries are not represented as completed production features.
