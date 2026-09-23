# Test SEEE Workspace locally

This branch runs a **new application**, SEEE Workspace 3.0. It does not upgrade or connect to the old Activity Hub database. See description.md for the implemented architecture and plan.md for the product decisions.

## Quick start

Requirements: Node 22, npm and a MySQL 8 server binary. On this Windows machine the setup script discovers MySQL at `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe`. Set MYSQLD_BIN if it lives elsewhere. Other systems use mysqld from PATH.

```powershell
npm ci
npm run setup:local
npm start
```

Open **http://localhost:3000**. The server binds to loopback only. Setup starts its own MySQL on **127.0.0.1:3307**, creates **seee_workspace_local**, and seeds synthetic records. The existing server on port 3306 is untouched.

Setup is repeatable: it preserves an initialized database. The MySQL data directory is `.local/mysql-data`; random local DB/root credentials and session secret are stored only in ignored `.local/mysql-admin.json` and `.env.local`. Do not share those files. The app uses a database-specific account, not root. Startup rejects demo authentication if NODE_ENV=production.

After a reboot, run `npm run db:start` before `npm start`. Stop the app with Ctrl+C; stop this private MySQL with `npm run db:stop`. MySQL stop/reset tools check the resolved data directory before changing it. If port 3307 belongs to another server, setup refuses to change that database.

## Demo accounts

All accounts below are synthetic local identities. Their addresses simulate HUST accounts; no email is sent and no actual person is authenticated by selecting a demo.

**Shared local-only password: `SeeeDemo!2026`**

| Account | Email | What to test |
| --- | --- | --- |
| Administrator | admin.demo@hust.edu.vn | Matrix, global/unit assignments, workflows, audit, export, sensitive record |
| Dean | dean.demo@hust.edu.vn | Broad published operational visibility; no Admin Center or sensitive/history access |
| Electrical Leader | leader.demo@hust.edu.vn | Team tasks, exclusive records, approval, Member/Leader appointments |
| Electrical co-leader | coleader.demo@hust.edu.vn | Approve the Leader's submissions when self-approval is disabled |
| Electrical Member | member.demo@sis.hust.edu.vn | Ordinary team work, assigned tasks, create and submit drafts |
| Public user | public.demo@sis.hust.edu.vn | Public records only until appointed to a team |
| Office Leader | office.demo@hust.edu.vn | Office team scope; no Electrical-only records |
| Recovery administrator simulation | van.nguyendinh@hust.edu.vn | Second Administrator; recovery-owner designation from requirements |

The login page has credential-fill shortcuts. Selecting a shortcut does not sign in automatically. Demo login is a deliberate local substitute for verified Microsoft identity; it must not be enabled on a real deployment.

## Suggested walkthrough

1. Sign in as Public. View the welcome activity and public organization document. Electrical-only, Leader-exclusive and administrator-only records are absent.
2. Sign in as Member. Open Electrical lab readiness review, update your inventory task, comment, upload a small TXT/PDF file, and download it.
3. Open New teaching-material workshop (seeded draft), or create a new record. Choose Public, Selected teams or Selected roles. Submit for approval.
4. Sign in as Electrical Leader. Open Approvals and approve/reject the Member's request. The seeded Workshop room reservation is also waiting for approval.
5. As Leader, go to Teams & units → Electrical Engineering → Appoint member / leader. Promote the Public user to Member or Leader. That user's next request uses the new role without needing a new login.
6. Sign in as Dean. View published operational records across units, including the Electrical Leader-exclusive example. Administrator-only sensitive content and Admin Center remain unavailable.
7. Sign in as Administrator. Change role action checkboxes, assign/revoke roles, add/edit units, or deactivate an account. Member revocation removes membership and all unit roles for that team. The last active Administrator is protected.
8. In Workflows publish a version for record publication or completion. Configure role, global/owning/specific-unit scope, any/all quorum, multiple ordered steps, and self-approval. Existing requests retain their version; future requests use the latest exact-unit override or school default.
9. In Audit & reports inspect changes and download the XLSX history export. These functions are Administrator-only.

No eligible approver means **blocked**, never auto-approved. An Administrator can cancel the request, fix the role/workflow configuration, and the author can resubmit. If a required all-approver loses eligibility, the workflow must not silently shrink its quorum.

Edits to published content return it to draft for another publication approval. Pending/completed records cannot be directly edited. An audience grants reading, not actions. Files inherit the parent record's current access. Owner transfer and independent task-only sharing are not exposed in this local release.

## Seed coverage

13 structural units, 8 identities, 4 role templates, 10 records, 2 tasks, 1 comment, four initial workflow definitions and one pending approval request. Units reflect the published SEEE bodies/units plus the required student organization workspace; parentage is a **local display arrangement**, not a claim of verified official reporting lines. No unnamed laboratories are generated from published counts.

Records demonstrate public, selected-team, selected-role and administrator-only access. Data is intentionally synthetic. Uploads go to `.local/workspace-uploads`; no Gmail/OneSignal messages are sent.

## Reset the demo

Stop the application first. This command irreversibly replaces **only the private local demo database** and reseeds it:

```powershell
npm run reset:local -- --confirm=seee_workspace_local
npm start
```

It does not reset the old database, drop other schemas, or remove uploaded files. Old uploads remain on disk for manual review; after reset their former DB references no longer exist.

## Checks

```powershell
npm run check
npm test
npx playwright install chromium
npm run test:ui
npm audit --omit=dev
```

API tests recreate **seee_workspace_test**. Browser tests recreate **seee_workspace_browser**. Both verify they are connected to this repository's private MySQL before resetting their fixed test schema; neither alters the demo DB. They require `npm run setup:local` first.

API tests cover real MySQL/HTTP sessions, audiences, scoped actions, immediate revocation, CSRF, HUST restrictions, approvals/quorum/versioning, appointments, attachments, export and last-admin protection. Browser tests cover create → submit → approve, appointments, Dean restrictions, Admin workflow/export, mobile navigation and language switching. Screenshots are saved in ignored `.local/workspace-*.png`.

## Microsoft identity and deployment boundary

Microsoft HUST authorization-code login is wired under `/auth/microsoft`. It needs real AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT and AZURE_REDIRECT_URI settings from an app registration. Fresh verified users are public users. Existing demo email matches are not silently linked to real SSO identities or granted their mock privileges. Account reconciliation/bootstrap for a real deployment must be controlled separately.

Real Entra tenant configuration has not been tested by the local demo suite. This release is prepared for local testing, not a production deployment certification. External email/push, full EN/VI editorial coverage, advanced retention policies, verified organizational reporting lines and operational recovery procedures remain follow-up work. The legacy cPanel deployment file and legacy source/migrations are not a deployment recipe for this new application.
