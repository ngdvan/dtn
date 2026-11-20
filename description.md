# SEEE Internal Activity and Task Tracking Application

## Project Overview

SEEE Activity Hub is a responsive internal web application for the Youth Union and Student Association of the School of Electrical and Electronic Engineering. It helps teams propose activities, divide work into manageable items, assign responsibilities, monitor deadlines, recognize member contributions, and preserve a searchable history of completed activities.

The interface supports English and Vietnamese and is designed for desktop computers, tablets, and mobile devices.

## Current Project Status

The project currently provides a working Node.js and MySQL application with:

- Account login and logout using MySQL-backed sessions
- HUST email classification: `@hust.edu.vn` accounts are staff/faculty and `@sis.hust.edu.vn` accounts are students, independently of the application's operational authorization role
- A staff/faculty account receives a one-time first-sign-in notice directing them to an administrator or `van.nguyendinh@hust.edu.vn` for more information
- A student is prompted after every sign-in until they declare their class number (for example, `Điện 1` or `Điện tử 2`)
- Student entrance year and cohort are inferred server-side from the first two digits following the name portion of the SIS email: `abc.def26xxxxx@sis.hust.edu.vn` means entrance year 2026 and cohort K71 (`K = 45 + YY`)
- Role-aware access control
- An overview dashboard with active activities, open tasks, overdue work, upcoming activities, and recent updates
- Activity proposal and detail pages
- Team-proposed events and leadership-assigned activities
- Before, during, after, and general task stages
- Task deadlines, priorities, statuses, assignees, teams, and deliverables
- Dedicated task-detail views with schedules, context, assignees, comments, and materials
- Activity participants and volunteering
- Comments, progress updates, issues, evidence, relevant links, and protected file/photo uploads
- Team and people directories
- Team and role filters in the people directory
- Team filtering when adding activity participants, with each member's team names shown in the selector
- The activity participant selector receives normalized team membership data for every eligible member, displays all applicable team names, and filters without losing selections made under another team
- A reports area for exporting Excel workbooks that summarize activities and each team's member tasks and participation over a selected date range
- A shared Documents directory where signed-in users can browse and add named document links with descriptions, applicable years, and the issuing team
- The Documents directory, filters, submission form, actions, validation messages, and empty states are fully adapted in both English and Vietnamese, including labels displayed beside action icons
- Each document has an audience of either issuing-team members or all signed-in team members; administrators can view all documents, and year/team filters expose only records visible to the current user
- Authorized users can edit existing and new documents, including their name, link, description, applicable year, issuing team, and audience
- Database upgrades are applied through a reusable JavaScript migration runner that records completed numbered SQL migrations and safely runs only pending changes on local or hosted MySQL databases
- When migration tracking is introduced to an older installation, the runner detects completed legacy schema milestones before executing pending migrations, avoiding duplicate-column errors without requiring command-line baseline arguments
- Activity proposals may include an optional main proposal document link ("Main activity proposal document" / "Đề án hoạt động"), displayed as an easily accessible link on activity cards and the activity detail page
- Authorized activity editors can add, replace, or clear the main proposal document link on existing activities, including records created before the document field was introduced
- Self-service account settings for email, phone, avatar color, and password; account names remain manager-controlled
- Account creation, editing, and deletion scoped to administrators or the responsible team leader
- Distinct team color signatures on the activities for which each team is responsible
- A searchable archive of completed activities
- English and Vietnamese interface options saved in the browser
- Complete English and Vietnamese adaptation across navigation, filters, forms, dialogs, notifications, validation feedback, and reporting workflows while preserving stable API field values
- Responsive desktop, tablet, and mobile layouts
- Node.js 22 and an existing MySQL 8 server for local or cPanel deployment
- Team-scoped vice-leader accounts with the same operational permissions as leaders but without administrator-only authority
- Database-backed in-app notifications with unread badges, seven-day history, popup alerts, and direct activity links
- OneSignal browser push notifications for new proposals, task assignments and responses, and participant additions
- Asia/Ho_Chi_Minh task-deadline reminders at startup and every 15 minutes, deduplicated per task, assignee, and day
- Administrator-only Gmail test delivery for diagnostics; automatic event email delivery is currently disabled in favor of OneSignal push
- Administrator-only permanent activity deletion with typed-title confirmation, transactional related-record cleanup, stored-file cleanup, and audit logging
- A modular Express backend with explicit application construction and startup contracts while preserving the cPanel/Passenger root entry point and existing API URLs

The current implementation supports a coordinating team plus multiple supporting teams on each activity. Activities can contain multiple independently scheduled sub-items, and each sub-item can have its own responsible team, start date, deadline, deliverable, and one or more assignees.

## Current Release and Notifications

Release v2.5.3 expands yearbook editing access from administrators to all management roles. Signed-in administrators, team leaders, and vice leaders can open `/admin/ky-yeu`, see its bilingual navigation link, and use every yearbook editing API; regular members and signed-out visitors remain blocked. All changes continue to record the acting account in the audit log. No migration or notification change is required.

Release v2.5.2 adds an administrator-only left navigation link to `/admin/ky-yeu`, labeled “Yearbook administration” in English and “Quản trị kỷ yếu” in Vietnamese. Every signed-in administrator sees the link regardless of email domain; other roles do not. No migration or notification change is required.

Release v2.5.1 permits every authenticated administrator to open `/admin/ky-yeu` and use all yearbook administration APIs, regardless of email domain. Signed-out users and non-administrator roles remain blocked. Existing content and audit behavior are preserved; no migration or notification change is required.

Release v2.5.0 adds flexible term-specific yearbook groups. Administrators can create, rename, order, and remove groups such as Ban Thư ký Hội Sinh viên, Ban Chấp hành Đoàn Thanh niên, Liên chi Đoàn, or Đoàn Trường and add any number of members to each. Group and membership changes are included in the yearbook audit trail. The public and sample pages render variable group membership; the sample demonstrates approximately five Student Association secretariat members and fifteen Youth Union executive committee members. Apply migration `020_yearbook_flexible_groups.sql` before deployment; existing yearbook terms and leadership records remain compatible.

Release v2.4.4 renames the public and sample yearbook presentation to “Kỷ yếu Đoàn Thanh niên Trường Điện - Điện tử”, including the browser title, page heading, and footer. This display-only correction does not change yearbook content or require a database migration.

Release v2.4.3 adds a public, database-independent yearbook presentation template at `/ky-yeu-mau`. It demonstrates a complete two-page term using clearly fictional placeholder people and portraits, is visibly marked as sample content, and does not affect real yearbook data or audit history. No database migration is required.

Release v2.4.2 corrects the public yearbook identity to “Trường Điện - Điện tử” and removes the former 2026 final-year restriction. Terms must still begin in or after 1956 and have an end year no earlier than their start year, but administrators can now create future terms without a fixed application-level cutoff. This is backward compatible and requires no new database migration.

Release v2.4.1 integrates the saved feature work with current main, retaining Microsoft SSO, public activities, comment tagging, notification delivery status, participant removal, and task deletion. Apply migrations 017–019 with `npm run migrate` before deployment; existing migrations 001–016 remain unchanged. This release is backward compatible with existing main records. Verification covers the JavaScript syntax check, 23 existing tests, both upgrade and fresh-schema migration execution repeated twice, and local HTTP checks for version reporting, authentication, description uploads, yearbook publication and access control, member self-reporting, and activity deletion.

The current release is v2.5.3 (build 2026-11-20.1). The browser cache-busters, package metadata, visible version, and API build identifier are synchronized with this release.

Release v2.4.0 adds the public `/ky-yeu` online commemorative yearbook and a protected `/admin/ky-yeu` content workspace. Only signed-in administrators whose account email belongs to `hust.edu.vn` or a HUST subdomain may use the administration page and APIs. They can create and publish terms, enter biographies, organize office holders, and upload JPG, PNG, or WebP portraits up to 3 MB. Migration `019_public_yearbook.sql` creates the yearbook content and immutable audit-log tables; every create, edit, delete, and portrait-upload operation records the acting account, target, timestamp, and before/after details. Existing activity data and workflows remain backward compatible.

Release v2.3.0 adds card/calendar switching to the Activities area with month navigation and responsive day cells. It also adds self-reported completed tasks as a clearly marked alternative to manager assignment: the reporter must belong to an involved activity team, is recorded as the contributor, and the task remains available to normal history and Excel reporting.

Release v2.2.0 adds persistent safe formatting to activity and task descriptions, description-specific attachments capped below 5 MB per activity or task, and one-day-before deadline reminders. Reminder recipients include activity creators, members of every involved team, participants, activity contacts, task assignees, and task assigners as applicable; delivery is deduplicated through durable in-app notification source keys and sent through in-app, OneSignal push, and configured Gmail delivery.

Release v2.1.2 adds repository-level `AGENTS.md` instructions requiring every completed update to synchronize and verify the semantic package version, package lock, visible UI version, API build identifier, browser asset cache-busters, and the current-release entry in this description. Version-only consistency is now part of the mandatory validation checklist for all future work.

Activity and task descriptions support safe, persistent formatting for headings, emphasis, lists, links, and line breaks. Each activity and each task may also have description attachments with a combined maximum size below 5 MB. One day before a deadline, every involved or explicitly tagged user must receive the applicable reminder through in-app notification, OneSignal push, and configured email delivery, with recipients deduplicated and notification failures isolated from core workflow updates.

The Activities area provides both list/card and month-calendar views based on activity start dates and deadlines. In addition to manager-assigned tasks, an authenticated member who can view an activity may self-report completed work to that activity for an involved team to which they belong; the record is explicitly marked as self-reported, attributed to that member, included in task history and reports, and does not impersonate a manager assignment.

The application includes the public “Kỷ yếu Đoàn Thanh niên Trường Điện - Điện tử” online commemorative yearbook at `/ky-yeu`, presenting Youth Union leadership terms from 1956 onward in a book-style interface. The yearbook does not impose a fixed final year, so administrators can add future terms beyond 2026. Each term supports an unrestricted set of named organizational groups and any number of members per group. This accommodates structures such as a roughly five-person Ban Thư ký Hội Sinh viên and a roughly fifteen-person Ban Chấp hành Đoàn Thanh niên while allowing both names and membership counts to change by term, including historical names such as Liên chi Đoàn or Đoàn Trường. An administration workspace at `/admin/ky-yeu` allows authenticated administrators, team leaders, and vice leaders to create and edit terms and groups, enter leadership biographies directly, order office holders and group members, and upload portrait images. Regular members and signed-out visitors cannot access the workspace or its APIs. Every yearbook create, update, delete, and upload action is recorded in an immutable audit log with the acting account, timestamp, target, action, and before/after details.

A public, database-independent presentation template is available at `/ky-yeu-mau`. It shows a clearly labelled fictional term with representative secretary, deputy secretary, Student Association president, Ban Thư ký Hội Sinh viên, and Ban Chấp hành Đoàn Thanh niên content so the book layout can be reviewed before real yearbook records and portraits are published. Template content is static, does not enter the audit log, and never appears in the production yearbook data feed.

Notification events are stored in MySQL and delivered in the application and through OneSignal push. Automatic Gmail notification emails are temporarily disabled, while the administrator test-email action remains available for diagnosing Gmail configuration. Notification events cover new activity proposals, task assignments, task responses, participant additions, and tasks due today. Task responses notify the original task assigner and other assignees, excluding the responder and removing duplicate recipients. Existing tasks use their activity creator as the best available historical assigner.

The notification menu is available beside the EN/VN control on desktop and mobile. Opening it marks notifications as seen and clears the unread count. Records are retained for seven days, and ownership checks prevent one user from reading or changing another user's notifications. Browser identification with OneSignal occurs only after the signed-in user has an opted-in subscription and a valid push token.

## Revised Role Model

The application has four operational roles.

### 1. Administrator

An administrator manages the organization and has visibility across the entire application. An administrator can:

- Create new user accounts
- Edit or delete accounts across all teams
- Create and organize teams
- Add users to one or more teams
- Assign jobs to teams or individual users
- View every activity, task, team, member, deadline, update, and result
- Monitor organization-wide progress and overdue work
- Open every team overview to review its members, current tasks, deadlines, overdue work, activities, and completion progress
- Review the complete activity archive

### 2. Team Leader

A team leader manages one or more teams. A team leader can:

- Add existing members to a team that they lead
- Create, edit, or delete member accounts belonging to a team that they lead
- View the members and workload of their teams
- Propose new activities
- Add their teams to activities
- Create jobs or sub-items within activities
- Assign jobs to members of their teams
- Set and update deadlines, priorities, deliverables, and task statuses
- Confirm participation where applicable
- View the progress, overdue work, and completed work of their teams
- Add progress updates, issues, results, and evidence

A team leader must not manage membership or assignments for teams that they do not lead unless they also have administrator permission.

### 3. Vice Leader

A vice leader has the same team-scoped operational responsibilities as a team leader for teams where `is_vice_lead` is assigned. A vice leader can manage activities, tasks, participants, members, reports, and team settings within those teams, but does not receive administrator-only permissions. Administrators can promote or demote existing team members between member, vice leader, and leader, and the user's global role is synchronized with their highest team leadership assignment.

### 4. Member

Every active member must belong to at least one team and may belong to multiple teams. A member can:

- View an overview of activities and projects in which they are involved
- View tasks assigned directly to them
- View relevant tasks assigned to their teams
- See deadlines, priorities, deliverables, and activity context for their work
- Update the progress of their assigned tasks
- Mark assigned work as ready for review or completed, subject to the activity workflow
- Comment, report issues, and provide evidence on activities in which they participate
- Review their own participation and contribution history
- Edit their own email address, phone number, avatar color, and password, but not their account name or role

Members should not automatically see private operational details for unrelated activities unless those activities are explicitly visible to the wider organization.

## Teams and Membership

The organization consists of configurable teams such as Communications, Logistics, Academic Activities, Events, External Relations, and Student Support.

- Administrators can create, edit, deactivate, and reorganize teams.
- A user can belong to one or more teams.
- Each team can have one or more designated team leaders.
- Each team can also have one or more designated vice leaders with team-scoped management authority.
- Each team has a configurable color signature. Activity cards, task context, and team labels use the responsible or coordinating team's signature color.
- Each active member must belong to at least one active team.
- Team membership should record whether the user is a leader and, when useful, the dates on which membership started or ended.

## Account Management and Permissions

- Every signed-in user can update their own email address, phone number, avatar color, and password.
- A user cannot change their own account name or role through self-service settings.
- Administrators can create, edit, and delete accounts across all teams, including changing names, roles, memberships, and active status.
- Team leaders can create member accounts for teams they lead and can edit or delete accounts that belong to at least one team they lead.
- Team leaders cannot create or promote administrators, change administrator accounts, or manage accounts that are outside all teams they lead.
- Vice leaders follow the same team boundaries as leaders and cannot perform administrator-only actions.
- A team leader's account changes must retain at least one membership within that leader's managed teams.
- Deletion must be rejected when it would break retained activity history or ownership references; in that case the account is deactivated instead or the administrator must transfer ownership first.
- Passwords are never returned by the API and are replaced only when a valid new password is supplied.

## Activities

Any team leader or administrator can propose an activity. Each activity should contain:

- Title and description
- Activity type
- Creator and proposal history
- One or more involved teams
- A designated primary or coordinating team when required
- Participating members
- Start date and overall deadline
- Priority and current status
- Location or requesting authority where applicable
- Multiple sub-items or tasks with separate deadlines
- Comments, progress updates, issues, and document links
- Completion summary, results, lessons learned, and evidence

### Multiple Involved Teams

An activity can involve multiple teams. The relationship between an activity and a team should record:

- Whether the team is the primary/coordinating team or a supporting team
- The team's responsibility in the activity
- The team leader or contact person for the activity
- The team's current progress when a team-level summary is needed

Team selection uses individually clickable or tappable choices. Users can select or deselect each involved team without holding Ctrl or Command, including on mobile devices.

Removing a team from an activity must not silently delete historical tasks or contributions. Completed activity history must remain traceable.

### Sub-Items and Separate Deadlines

An activity can contain multiple sub-items or tasks. Every sub-item can have its own:

- Title and description
- Event stage or category
- Responsible team
- Assigned member or members
- Start date and deadline
- Priority and status
- Required deliverable
- Progress updates and evidence
- Relevant links, documents, and photos contributed by involved users
- Optional completion comments and evidence when work is marked complete
- Completion date and result

The activity's overall deadline and each sub-item deadline are separate. A sub-item may be overdue even when the overall activity deadline has not passed. Dashboards and progress summaries must calculate and display both levels correctly.

When creating a task, the assignee selector lists active users who belong to the selected responsible team. The creator can select or deselect one or more members with ordinary clicks or taps. Changing the responsible team refreshes the available assignee list.

Each task has a shared 50 MB file quota across all contributors. Supported uploads include common image, PDF, Office document, text, CSV, and ZIP formats. File metadata records the contributor, purpose, size, and upload time. Stored files are not publicly exposed and require an authenticated, activity-visible account to access them. Relevant external links do not count toward the file quota.

## Activity Types

### Team-Proposed Events

These are formal events proposed and organized by the Youth Union or Student Association. They can involve multiple teams and contain tasks in three stages:

- **Before the event:** planning, approval, communications, registration, logistics, budgeting, venue preparation, and documentation
- **During the event:** reception, technical support, coordination, photography, communications, attendance, and incident handling
- **After the event:** reporting, financial settlement, media publication, feedback, documentation, and lessons learned

Tasks in each stage may have different responsible teams, assignees, and deadlines while remaining connected to the same activity.

### Leadership-Assigned Activities

These are smaller or ad-hoc assignments received from School leadership, lecturers, or supervising officers. They may use a simpler workflow but must still record:

- Who requested the activity
- Which teams and members received it
- Its overall deadline
- Its sub-items and their individual deadlines
- Progress updates and issues
- Who completed each item
- The final result and evidence

## Progress, Visibility, and Archive

Dashboards should provide role-appropriate views:

- Administrators see organization-wide activities, tasks, teams, deadlines, and progress.
- Team leaders see activities involving their teams, team workloads, overdue work, and member progress.
- Members see activities in which they participate and tasks assigned to them or their teams.

The application must preserve a transparent activity history, including:

- How and when the activity was proposed
- Every involved team and its responsibility
- Every participant and assignee
- Task status and assignment changes
- Original and revised deadlines
- Completion dates
- Produced documents and evidence
- Problems, responses, outcomes, and lessons learned

This history supports leadership handover, organizational learning, accountability, and recognition of student and lecturer contributions.

## Reports

Administrators and team leaders can open a dedicated Reports tab and export an Excel workbook for a selected start date, end date, and team. Administrators may report across all teams; team leaders are limited to teams they lead. The workbook contains an activity summary plus team-member task and participation detail for records whose activity dates overlap the selected duration. Member access to reports is not permitted.

The export includes activity status and schedule, involved teams, task totals and completion, participant totals, and per-member task assignment/status/deadline/completion and confirmed or volunteered activity participation. A team-specific export includes members of that team and work attributed to that team.

## Current Technical Structure

### Runtime and Server

- `app.js` — cPanel/Passenger-compatible application startup entry point
- `src/app.js` — explicit Express application construction without starting the HTTP listener at module import time
- `src/server.js` — explicit HTTP runtime and `start()` contract
- `src/config/`, `src/middleware/`, `src/policies/`, and `src/routes/` — configuration, request middleware, access rules, and domain-specific route modules produced by the v2.0.0 server refactor
- `package.json` — Node.js 22 runtime requirement, dependencies, and start/check scripts
- `.env` / `.env.example` — server, session, and existing MySQL connection settings
- `.cpanel.yml` — checked-in repository-root cPanel Git Deployment configuration that installs production dependencies, automatically applies pending database migrations, and restarts Passenger with a targeted LiteSpeed worker fallback when required; cPanel deployment additionally requires a clean server-side working tree
- `node_modules` (including cPanel's virtual-environment symlink) and `tmp/` are runtime-generated paths excluded from Git so dependency installation and Passenger restart files do not disable cPanel deployment

### Database

- `database/schema.sql` — MySQL schema, relationships, indexes, initial teams, demo accounts, activities, tasks, participants, and updates
- Current tables include `users`, `teams`, `user_teams`, `activities`, `activity_teams`, `tasks`, `task_assignees`, `task_attachments`, `participants`, `updates`, `documents`, durable notifications, migration history, audit records, and the session table created by the session-store library

The database uses `activity_teams` for the many-to-many relationship between activities and teams and `task_assignees` for multiple assignees. Task assigner tracking identifies who should receive task-response notifications. The legacy `activities.team_id` and `tasks.assignee_id` columns remain as primary references for compatibility with existing records. Migrations `007` through `010` add vice-leader/document-audience support, durable notifications, and activity/task cascade cleanup.

### Browser Application

- `public/index.html` — application shell, login screen, navigation, dialogs, and language controls
- `public/styles.css` — responsive layouts and visual design
- `public/app.js` — client-side routing, API calls, rendering, forms, English/Vietnamese localization, and interaction handling

### Documentation

- `README.md` — local MySQL and cPanel deployment instructions
- `description.md` — product requirements, current status, roles, data rules, and project structure
- `docs/huong-dan-su-dung-vi.html` — Vietnamese end-user guide covering the complete activity lifecycle with stage-specific interface captures and step-by-step actions for running a full-scale activity
- `activityflow.md` — Vietnamese actor and workflow reference from proposal through completion, archive, and reporting

## Implemented Requirement Update

The current application now includes:

1. Four operational roles: administrator, team leader, vice leader, and member.
2. Administrator account creation with mandatory team selection for member accounts.
3. Team membership management by administrators and the designated leader of that team.
4. Role-scoped dashboards, activity lists, people lists, and archives.
5. Multiple coordinating/supporting teams per activity.
6. Multiple sub-items with separate start dates and deadlines.
7. Multiple assignees per task, restricted to members of the responsible team.
8. Team-aware assignment permissions and member-only task updates.
9. Multi-team activity progress and overdue calculations.
10. Click/tap multi-team and multi-assignee selectors that do not require keyboard modifier keys.
11. Administrator and team-leader team overviews with membership, workload, current tasks, activities, and progress.
12. Issuing-team or all-team document audiences with server-enforced filtering and authorized document editing.
13. Durable in-app and OneSignal push notifications with task-response routing and deadline reminders.
14. Administrator-only permanent activity deletion with transactional cleanup and audit logging.
15. A modular server architecture that preserves all established public route URLs and cPanel startup behavior.

Detailed historical auditing of every membership, assignment, deadline, and status change remains a recommended future enhancement beyond the current update/comment history.

## Main Objective

The application is both a task-management system and an institutional activity archive. It should improve coordination, make responsibilities and deadlines clear, recognize individual and team contributions, and preserve enough context for future student cohorts to understand how previous activities were planned and delivered.
