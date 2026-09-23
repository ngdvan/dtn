# Plan: School-wide SEEE organization and permission architecture

Status: new-application product plan. A fresh local-test implementation now exists; description.md records its implemented scope and LOCAL_TESTING.md explains how to run it. Broader features below remain design targets where not listed as implemented.
Prepared: 2026-09-23. Baseline: description.md and current Express/MySQL code.

## 1. Requirements and scope

Expand Activity Hub from Youth Union/Student Association coordination into a shared SEEE workspace for the Dean group, academic departments, administration, student organizations and other school units. Support everyday work alongside events, with central administration of permissions.

Required principles:

1. Public is the baseline read audience for signed-in HUST users. Active team membership supplies ordinary team-resource visibility; exclusive resources and actions require selected roles.
2. A user can have multiple global roles and different roles in different units.
3. Central administrators define the permission matrix and workflows. Team leaders can appoint members and additional leaders within their own teams, using centrally defined roles.
4. Permissions are checked on the server for each action and resource, including lists, reports, files and notifications.
5. Start with a new isolated database and synthetic data; do not migrate, modify or connect to the old application database. Keep student-organization units represented in the school-wide model.

Recommended scope for the first release: one school, configurable unit hierarchy, global/unit roles, cross-unit activities, explicit sharing, task collaboration, central access administration, audited role changes and safe local initialization. Use a fresh Node/Express/MySQL application with independent configuration. Include Admin Center configuration of approval workflows by action type in the first release. Microservices, multi-school tenancy, arbitrary policy scripting and arbitrary per-user permission overrides are deferred.

## 2. Legacy lessons informing the new application

| Current implementation | Required change |
| --- | --- |
| users.role is one admin/leader/vice_leader/member enum | Multiple explicitly assigned roles with global or unit scope |
| user_teams combines membership with is_lead/is_vice_lead | Independent memberships and role assignments |
| Team membership grants activity visibility without resource exceptions | Preserve ordinary team viewing, add explicit audience/role restrictions for exclusive resources |
| admin bypasses almost all policy | Distinguish security administration from operational/data authority |
| Creator can manage activity | Ownership records accountability; authority still needs a grant |
| Any issuing-team member can edit documents | Separate document read/create/edit/share permissions |
| Global leadership synchronized from team flags | Unit role changes never silently grant school-wide authority |
| Session caches operational role | Resolve current authorization from versioned server-side assignments |
| is_public/all_teams reaches every signed-in user | Public HUST baseline, selected-team and selected-role audiences controlled by authorized publishers |
| Team managers can alter shared user identities | Separate unit roster administration from central account administration |
| Permissions repeated in SQL, routes and UI | One authorization service with reusable query scopes |
| Event-oriented copy and stages | Everyday work plus optional event stages |

The old sources inform the design only. Active new-app code is src/workspace/, public/workspace/ and database/workspace/. The new entry point does not load legacy routers or static assets. No API or database backward compatibility is required.

## 3. Proposed organization model

Use **organizational unit** as the shared domain term. Unit type describes organization, never privileges. A department head and a student-team coordinator may use different role templates even if their units occupy the same hierarchy depth.

### Published structure and proposed representation

Source reviewed 2026-09-23: [SEEE organizational structure](https://seee.hust.edu.vn/vi/gioi-thieu/co-cau-to-chuc/). The page describes three functional areas and separately displays leadership/governance bodies. It says its information remains under review. The outline below summarizes the chart; indentation is not a verified legal reporting or permission hierarchy.

```text
SEEE (within HUST)
  Governance/leadership bodies shown
    Party committee
    School council
    School leadership board
    Trade union
  School office
  Teaching [functional grouping]
    Electrical Engineering department
    Automation department
    Communication Engineering department
    Electronics department
    Electrical/Electronic practical training center
      56 teaching laboratories
    43 specialist groups across departments
  Research [functional grouping]
    Electrical/Electronic research and development center
      16 laboratories
      Research groups
```

Use official Vietnamese labels when preparing unit seeds: Ban Giám hiệu, Văn phòng Trường, Khoa Điện, Khoa Tự động hóa, Khoa Kỹ thuật truyền thông, and Khoa Điện tử. English labels above are descriptive translations. Lab/group counts are reference totals, not sufficient evidence to create unnamed unit records. Individual lab/group identities and affiliations require further verification.

### Architecture decisions derived from the chart

The following are proposed application decisions, not claims about the school's formal governance:

- Represent actual bodies, offices, departments, centers, laboratories and groups with distinct unit types. Keep Teaching/Research as display categories unless administrators confirm they are independently managed units; do not create fictional permission-bearing parents for layout headings.
- Map the earlier “Dean group” requirement to a leadership workspace, with official terminology in the UI. Map “administration team” initially to the school-office workspace, subject to operational confirmation. Neither becomes the application's security administrator automatically.
- Retain the Youth Union/Student Association and existing student teams as required application units. Their placement is not established by this chart; verify it separately rather than removing them or asserting an official parent.
- Keep a canonical parent for confirmed administrative ownership. If governance, coordination or academic affiliation needs additional links, introduce typed unit relationships; do not force every relationship into parent_id. Such links confer no permissions.
- Store office-holder appointments separately from access assignments when titles/terms are needed. Never seed access from public staff names, academic rank or chart prominence. A person may hold several appointments and roles independently.
- Maintain seed provenance (source URL, review date, confirmation status) and stable codes. Treat published personnel/counts as a review snapshot, not a synchronization feed that can grant/revoke access.

A user can belong to multiple units, with optional primary affiliation and job title. A title such as Dean, lecturer or secretary does not automatically assign an application role. HUST staff/student email classification also remains separate from authority.

Units have stable IDs/codes, name, type, parent, active status, description and optional color. Parent relationships support navigation/reporting but **do not inherit permission by default**. Initial role assignments apply to exactly one unit or the global scope. If subtree access is later required, add an explicit centrally controlled scope mode and audit its consequences; do not implement it as an implicit ancestor bypass.

Deactivate rather than delete units referenced by history. Prevent parent cycles. Moving a unit must not silently move historical activity ownership or change access through inheritance. Explicit grants to inactive units cease to confer operational access; designated global archival authority handles retained records.

## 4. Confirmed authorization model

### Identity, baseline access and scoped roles

- Identity: active, verified HUST account. Public means every signed-in HUST user, not anonymous internet access. Accept @hust.edu.vn and @sis.hust.edu.vn only.
- Basic public user: authenticated user without team membership. Can view public published records and manage permitted own-profile fields; cannot create, approve or administer merely by signing in.
- Membership: affiliation in a team/unit. Creating active membership atomically assigns the baseline team Member role, which supplies ordinary team viewing. Storage remains separate for membership history and role definitions.
- Unit roles: Member, Leader and any centrally configured specialized roles. Extra actions and exclusive resources depend on the scoped role matrix, not title, hierarchy depth or email classification.
- Global roles: Administrator, Dean/School leadership and other centrally configured roles. Team roles never imply global roles.

Central administrators maintain permission definitions and role bundles. Team leaders use those definitions; they do not edit the matrix. Ending membership revokes its unit assignments in the same transaction. Membership/role expiry and account deactivation affect subsequent requests, including existing sessions. Public access remains after leaving a team while the HUST account remains active.

### Audience and action evaluation

Use default deny for actions without a permission. Viewing has explicit built-in Public and Member baselines rather than the earlier membership-with-no-access model.

1. Validate active verified HUST identity/session. Reject non-HUST and unverified local identities.
2. Load current memberships, scoped roles, policy revision, resource audience and workflow state.
3. Apply administrator-only classification first for deferred historical reporting, audit and sensitive-work functions. Neither public publication nor Dean visibility overrides this classification.
4. For ordinary reads, allow a public published record, matching selected-team membership, matching selected role in its designated scope, or the explicit Dean broad-operational-read entitlement.
5. For writes, require the relevant global or exact-unit action permission plus resource authority. Audience visibility alone never grants editing, assignment, deletion or approval.
6. For approvals, also require the active workflow step, matching approver role/scope and workflow constraints. General edit permission cannot perform an approval transition.
7. Deny if no valid path exists, using the same semantics for detail, lists, aggregates, files, selectors and exports.

Roles combine within their scope: editing B does not grant editing A. Resource audience is a read boundary for ordinary users: a role-exclusive record replaces the normal member audience instead of adding another allow beside it. Team Leader exclusives remain inaccessible to ordinary team members. Dean broad read covers operational public/team/role-exclusive resources across units; administrator-only sensitive records and privileged functions are excluded. This is the initial concrete meaning of ?Dean sees most things,? not unrestricted administrator access.

### Permission catalog and starter roles

Keys are code-defined/versioned; Admin Center uses checkboxes to compose supported permissions. No arbitrary executable policy text.

| Domain | Initial actions |
| --- | --- |
| Access administration | security.roles.manage, security.assignments.manage, security.audit.read |
| Organization | unit.read/create/update/deactivate, membership.manage, team.roles.assign.member, team.roles.assign.leader |
| Identity | account.read.directory, account.manage, account.deactivate |
| Activities | activity.read/create/edit/submit/approve/close/share/publish/delete, activity.read.school |
| Tasks | task.read/create/assign/edit/update.assigned/review |
| Collaboration | update.read/create, attachment.read/create/delete.own, participant.manage |
| Documents | document.read/create/edit/share/publish |
| Workflows | workflow.define, workflow.publish, workflow.instance.read, workflow.approve |
| Restricted administration | report.history.use, audit.read, sensitive.manage; Administrator-only initially |

| Role | Scope | Initial responsibility |
| --- | --- | --- |
| Basic public user | Authenticated baseline | Read public published records; limited own-account settings |
| Member | Unit, assigned with membership | View ordinary team records; contribution actions only if matrix grants them |
| Leader | Unit | View team records/exclusives, configured team operations, appoint Members and Leaders in this team |
| Coordinator / contributor | Unit | Optional defined work permissions; no implicit approval |
| Approver | Global or unit as configured | Approve only matching workflow steps with appropriate scope |
| Dean / School leadership | Global | Broad operational read across units; no matrix/workflow/account administration, no administrator-only history/audit/sensitive access |
| Administrator | Global | Central matrix, global assignments, organization/account administration, workflow definitions, restricted administrative functions |

These are application roles, not automatic mappings from official job titles. The central administrator assigns the Dean role explicitly. Approver role labels alone do not permit approval outside the configured workflow/scope.

### Team-level role assignment and recovery

Central administration may assign global or unit roles. A current team Leader can add an existing basic public HUST user to their own team as Member or Leader and promote a Member to Leader. The operation creates membership and its corresponding role assignment transactionally. A user already affiliated elsewhere keeps all other affiliations and roles.

Appointing another Leader is an intended capability, not prohibited escalation. Leaders cannot assign Administrator/Dean/global roles, operate on another team's roles, redefine a role, or edit another person's global identity. Additional assignable role types require central configuration; demotion/removal uses separately defined permissions rather than being inferred from appointment rights. Prevent unauthorized self-promotion. Protect the last active Administrator; recommend also preventing removal of the final team Leader unless central administration transfers responsibility.

Recovery owner: **van.nguyendinh@hust.edu.vn**. Bind recovery to a verified HUST identity and document an audited recovery procedure. Recording the owner does not itself create an account, grant an active administrator session or implement a password/email-string bypass. Verify the recovery mechanism during deployment rehearsal.

### Admin-configurable action workflows

Admin Center must let an Administrator define a workflow for a supported action type, including which role can approve. Start with a bounded configuration model rather than scripts:

- Action type (for example activity proposal, document publication or a supported work request), applicability (school default or exact-unit override), ordered steps and allowed outcomes.
- Each step specifies approver role, global/owning-unit/explicit-unit scope, and any-one versus all eligible approvers. Prefer any-one as the initial default and explicitly configure all when needed.
- Define submit, approve, reject, return-for-changes and cancel behavior. Set self-approval explicitly (recommended initial default: disabled).
- Reject ambiguous active definitions for the same action type/scope; resolve exact-unit override before school default. No definition means the action is unavailable until configured, not silently auto-approved.
- Draft, validate and publish immutable workflow versions. In-flight requests retain their version; new submissions use the current published version.
- Snapshot required approver identities for all-approver steps while rechecking their current role/active status at decision time. Changed eligibility must block/reroute through an audited administrator operation, never silently reduce quorum or authorize a revoked approver.
- Execute workflow transitions and resulting domain changes atomically, with idempotency/concurrency protection and decision history. If no eligible approver exists, show blocked status and route resolution to administration rather than auto-approving.

Ordinary task comments/status actions need workflow approval only when their supported action type is configured to require it. View permission and workflow approval authority are distinct; eligible approvers receive a defined request-review view, not unrelated resources.

## 5. Ownership, publisher-selected audiences and collaboration

Each activity/document has one owning unit. Organizational parent links and participating-unit labels do not automatically grant access beyond the configured Public/Member rules. Ownership transfer is transactional, requires source/destination authority and revalidates audiences, assignees and pending workflow scope.

For new ordinary published records, the visibility selector defaults to **Public: all signed-in HUST users**. Drafts/pending requests stay with the author and authorized workflow reviewers until publication. Changing defaults must not expose existing restricted records; the initial release seeds independent synthetic content.

The authorized publisher can check/tick the intended audience:

| Audience mode | Read behavior |
| --- | --- |
| Public (default) | Every active signed-in HUST account |
| Selected teams | All active members of checked teams, through baseline Member access |
| Selected roles | Only holders of checked roles in explicitly checked team/global scopes; use this for Leader-only resources |
| Administrator-only | Sensitive/deferred administrative resources; locked by classification, not reducible through publisher choices |

Public/team/role modes are alternatives. Within Selected roles, multiple role/scope rows are OR alternatives, but each row requires both its role AND its scope. A Leader in A is not a Leader in B. Avoid combining a broad team audience with a Leader-exclusive audience that accidentally restores member visibility. Preview the resulting audience before saving. Dean operational read is shown as a system-level exception; publisher cannot grant system administration or downgrade administrator-only classification.

Publisher control applies to their authorized records, not arbitrary school records. Changing audience requires publish/share authority and is audited; if the action type has a publication workflow, audience changes follow that workflow too. Viewing never grants the right to republish. Visibility settings constrain body, metadata and attachments consistently. Child tasks/comments/files inherit the parent by default and may narrow scope; they cannot broaden a restricted parent without a distinct authorized publication operation.

Cross-unit example: a public Department A activity is visible to everyone. If changed to selected-team A, B's ordinary members cannot read it. Checking B adds B members; selecting only Leader roles in A/B restricts ordinary readers to those scoped roles (plus Dean operational read). Coordination/assignment actions still require their separate permissions.

Task assignees require an eligible HUST account, task access and task.update.assigned; assignment or tagging cannot bypass a role-exclusive boundary. Validate access before adding assignees/participants or tags, and guide an authorized publisher to adjust the audience when needed. Task-only collaboration may use a limited parent-context projection; it must not expose unrelated tasks/discussions/files.

Only HUST accounts are supported across login, provisioning, recovery, profile email changes, role assignment, invitations and recipient selection. Prefer Microsoft HUST SSO as the verified identity path. Do not introduce non-HUST login paths or import old application identities. A local password login, if retained for verified HUST accounts, must verify eligibility/identity linkage rather than treating an email suffix as identity proof. Disable external collaborator invitations. Old accounts remain outside this application; a future import would require a separate reviewed identity-reconciliation project.

## 6. Proposed data changes

Exact column names may change in implementation; retain the invariants below.

| Table/change | Purpose and constraints |
| --- | --- |
| organizational_units | Stable ID/code, confirmed parent_id, type, display category, name, description, color, active; source/review metadata; unique code and cycle validation |
| unit_relationships (if required) | Typed non-parent governance/coordination/academic links; never permission inheritance |
| unit_appointments (if required) | User/unit, position title and term dates; separate from role assignments |
| unit_memberships | User/unit, active/effective dates, optional title/primary flag; atomically pair active membership with baseline Member assignment; prevent overlapping duplicates |
| permissions | Unique code, domain, supported scopes, description; seeded from application catalog |
| roles | Unique code, label, allowed scope, active/protected flags, revision |
| verified_identities | User, identity provider/subject, verified HUST email and verification state; never use a mutable email alone as proof of identity |
| role_permissions | Unique role/permission, FKs; validate supported scope combinations |
| global_role_assignments | User/role, effective dates, grantor/revocation metadata; global-compatible roles only |
| unit_role_assignments | User/unit/role, dates/grantor/revocation; effective only with active membership |
| activity_access_grants | Selected unit or role+scope audience entries; typed FKs, validity, issuer/revocation; no unscoped team-role matches |
| task_access_grants | Bounded task-only access where activity-wide sharing is inappropriate |
| document_access_grants | Document targets/bundles with analogous constraints |
| activities/documents | Owning unit, public/selected-teams/selected-roles/admin-only audience, classification, publisher/publication state; new database with explicit per-record audience |
| activity_units/tasks | Participating/responsible units; separate from authorization |
| workflow_definitions / workflow_versions / workflow_steps | Supported action type, applicability, immutable published versions, outcomes, approver role/scope and quorum |
| workflow_instances / workflow_decisions | Request/version/current step, submitter, required approvers, decisions, status and idempotency/version fields; retain history |
| authorization_state | Policy revision and per-user access version for reliable invalidation |
| audit_events | Actor, action, target, scope, before/after, reason, request/time; restricted append-only application access |
| seed fixtures | Independent synthetic units/identities/roles/records and approval scenarios; no imported legacy identities or data |

Prefer separate global/unit assignment tables over ambiguous nullable-scope uniqueness. Prefer typed grant tables with real FKs over an unchecked resource_type/resource_id free-form ACL. Index user/unit/role validity lookups, owning units, grant targets and audit target/time. Defer archival/anonymization retention decisions; restrict historical reporting, audit inspection and sensitive-work controls to Administrator for now. Preserve attribution when accounts are deactivated; no automatic purge is introduced.

Create a standalone schema and seed fixtures. Do not run old numbered migrations or retain compatibility role columns in the new database. Any future data import is a separate explicitly scoped project.

## 7. Backend and UI architecture

Keep the modular monolith. Extract authorization and domain transactions from route handlers before broadening functionality.

```text
src/authorization/
  catalog.js          Supported permission keys/scopes and grant bundles
  evaluator.js        can(user, action, resource/context)
  scopes.js           Authorized SQL scopes for list/aggregate/export queries
  assignments.js      Effective roles, membership validity and invalidation
  explain.js          Restricted effective-access explanations
src/services/
  organization.js     Unit/membership lifecycle
  access-admin.js     Role/assignment/delegation transactions and audit
  activities.js       Ownership/audiences/domain transitions
  workflows.js        Versioned definitions, approval resolution and execution
  audit.js            Structured audit insertion
src/routes/
  organization.js     Units and memberships
  access-admin.js     Matrix/roles/assignments/effective access
  workflows.js        Admin definitions and authorized request/approval operations
```

Authorization must support both single-object checks and SQL filtering using the same semantics. Never load unrestricted collections and merely hide forbidden rows in the browser. Paginate after authorized filtering and apply policy before aggregating counts or building reports. Restrict selectable people/units and directory fields independently of record access.

Sessions primarily carry identity. Load account state/access version on authenticated requests; cache effective roles by user and policy revision, invalidating on assignment, membership, role definition and deactivation changes. Expiry must be respected even without a write event. Evaluate authorization and privileged writes against a consistent transaction/version to prevent revoke-versus-write races. Do not trust client-supplied unit, role or capability flags.

UI receives effective capabilities for the active context/resource; replace global-role checks such as canManage() and body[data-role]. An active-unit switcher changes working context, never grants authority. Provide My work, unit work and school-wide views only when authorized.

Add central administration screens:

- Unit hierarchy and lifecycle, including membership distinct from role assignment.
- Checkbox role matrix by resource/action and exact scope, with permission descriptions.
- Workflow editor by action type: steps, approving roles/scopes, outcomes and publication versions.
- Central global/unit assignments plus scoped Member/Leader appointment screen for team Leaders.
- Publisher audience picker: Public, selected teams, selected roles with team/global scope, effective-viewer preview.
- Effective-access explanation: why this user can perform an action on a record.
- Change preview showing affected roles/users/scopes, followed by audited save.
- Audit search restricted to authorized administrators.

Keep the current palette, responsive layouts and EN/VI support. Generalize student-only copy, add unit-type labels, and expose everyday work using the existing general stage before adding more complex scheduling. Job title, affiliation and granted role must be visually distinct. Never infer capability from selected unit or displayed title.

## 8. New-application implementation sequence and status

The owner chose a fresh application instead of an upgrade. No migration/cutover from Activity Hub is required. The following replaces the previous ten-step legacy migration sequence.

### Step 1 ? Freeze the confirmed local-test contract

Implemented baseline: Public HUST user, Member, Leader, Dean and Administrator; exact-unit scope; publisher-selected audiences; local role appointments; admin-configurable publication/completion approvals. Section 11 remains authoritative. Real organizational parent links and additional action types remain future configuration work.

### Step 2 ? Create an independent application and schema

Implemented in src/workspace/, public/workspace/ and database/workspace/schema.sql. Root app.js starts only the new application. Legacy source remains reference-only, with no compatibility promises or automatic data import.

### Step 3 ? Provision a private local database and mock fixtures

Implemented: isolated MySQL on 3307, seee_workspace_local, generated local credentials, 13 structural units, 8 demo identities, 10 records, tasks and approval requests. Setup is repeatable; reset requires explicit demo-database confirmation. Existing MySQL on 3306 is untouched.

### Step 4 ? Centralize access and assignment rules

Implemented: live identity/role resolution, shared SQL read scopes, action permissions, CSRF, session regeneration, same-team Member/Leader appointment, role matrix, Administrator-only sensitive/audit/history controls and last-admin protection. General effective-access explanation UI and per-assignment expiry administration are follow-ups.

### Step 5 ? Build operational work and audience controls

Implemented: activity/document/request records, create/edit/submit, team/role audience selectors, tasks with one assignee, comments and protected attachments. Owner transfer, multiple assignees, independent task-only sharing and participant management are not yet exposed.

### Step 6 ? Implement configurable action approvals

Implemented: record.publish and record.complete, default/exact-unit definitions, ordered steps, role/scope selection, any/all quorum, self-approval setting, immutable versions, reject/cancel/block behavior and audited decisions. Other action types need explicit domain integration; arbitrary scripts are not supported.

### Step 7 ? Build central administration and school-wide UI

Implemented: new responsive dashboard/navigation, working-unit filter, unit directory, role matrix, account/assignment controls, unit editor, workflow editor, approval inbox and admin audit/export. Core EN/VI labels are included; full editorial localization remains follow-up work.

### Step 8 ? Test with separate disposable databases

Implemented integration/browser suites use seee_workspace_test and seee_workspace_browser, not the demo database. Cover role boundaries, visibility, revocation, appointments, CSRF, approvals, files, export, and desktop/mobile paths. Add cases with every future domain feature.

### Step 9 ? Document and hand over local testing

Implemented setup/start/stop/reset commands, local account matrix, test walkthroughs, fresh architecture reference and demo-versus-real identity boundaries in LOCAL_TESTING.md and description.md.

### Step 10 ? Prepare real deployment only after local validation

Not claimed complete: real HUST tenant registration, verified initial-admin/recovery provisioning, production HTTPS/proxy setup, official unit roster/parent validation, backup/recovery drills, complete localization/accessibility review, external notification delivery and retention policy. Current local demo is not a production certification.

## 9. Fresh-data and reset safeguards

- No legacy database migration, synchronization, account import or schema mutation is performed.
- Private setup verifies the server data directory before creating/configuring its database and account.
- Store generated secrets, MySQL files, uploads and screenshots outside tracked source.
- Normal setup preserves an initialized demo. Explicit reset targets only seee_workspace_local; tests reset only their fixed test schemas.
- Reset destroys demo rows/sessions and requires app restart. Uploaded files remain for manual cleanup and are not served without authorized metadata.
- New-record Public defaults never change the audience of other records automatically.
- Before any real deployment, use a fresh verified identity/bootstrap process; demo email matches cannot claim real roles through SSO.
- Schema evolution after this initial release needs a new-app migration strategy, separately from the retained old migrations.

## 10. Required acceptance scenarios

| Scenario | Expected result |
| --- | --- |
| Verified HUST user, no team | View public published records; no team-only/exclusive resources or management |
| Anonymous or non-HUST account | No application resource access, including Public records |
| User added as team Member | Ordinary selected-team resources visible immediately; no Leader-exclusive access |
| Leader-exclusive record in A | Members in A and Leaders in B denied; A Leader allowed; Dean operational read applies unless admin-only |
| Editor in A, Member in B | Edit A within matrix; ordinary B viewing, no B editing from A role |
| Team Leader appoints HUST public user as Member/Leader | Same-team membership/role created atomically; other affiliations preserved |
| Team Leader assigns global role or another team's Leader | Denied; cannot alter central role definitions |
| Basic public user/Member self-promotes | Denied |
| Dean role | Broad operational view; no system, matrix, account or workflow administration |
| Dean opens admin-only history/audit/sensitive function | Denied unless separately assigned Administrator |
| Parent organizational unit | No automatic descendant role/action authority |
| Publisher chooses Public | All signed-in HUST users can view after any required publication approval |
| Publisher switches to selected roles | Only matching role AND scope entries plus documented system exceptions; Member baseline cannot bypass |
| Publisher tries to downgrade admin-only classification | Denied |
| Assignment/tag references exclusive inaccessible record | Rejected or require separately authorized audience change |
| Membership ends | Team access ends on next request; Public baseline remains for active HUST user |
| Direct URL/list/count/export/download | Same audience and action policy; admin-only reporting remains restricted |
| Approval by matching role in wrong team | Denied |
| Edit status used to bypass approval | Denied; workflow transition required |
| Workflow definition changes mid-request | Existing request retains published version; new submission uses new version |
| Approver revoked or no eligible approver exists | No auto-approval; blocked/audited administrative rerouting |
| Duplicate/concurrent approval request | One valid transition and one resulting domain mutation |
| Non-HUST login/profile-email change/invitation | Rejected; old historical attribution retained |
| Last Administrator removal | Rejected; recovery procedure bound to verified van.nguyendinh@hust.edu.vn |
| Fresh setup versus repeat setup | Seed once, preserve later edits, never connect to or mutate the old database |

## 11. Confirmed decisions and working interpretations

Confirmed by the project owner on 2026-09-23. These replace the earlier open questions and membership-without-access proposal. The owner subsequently chose a fresh application/database; section 8 and description.md distinguish the local implementation from remaining design targets.

1. **Organization versus access:** the official chart models organization, not authority. Provide check/tick configuration for team accessibility. Public is the baseline; membership allows viewing most team activities/resources, with exclusive role-based exceptions such as Leader-only viewing/actions. Working interpretation: Public is every active signed-in HUST user, consistent with decision 7, not anonymous web access.
2. **Recovery owner:** van.nguyendinh@hust.edu.vn. Bind to verified identity and audit recovery; this plan creates no credentials or live privileges.
3. **Dean:** sees most operational information across SEEE but is not the system administrator. Initial boundary: ordinary operational records, including team/Leader visibility, are readable; Administrator-only history/audit/sensitive functions remain excluded. Editing and approvals still require their own configured permissions/workflows.
4. **Workflows:** Administrator configures workflows by supported action type in Admin Center, including approving roles. Implement scope-aware approvers, ordered steps, immutable published versions, outcomes and auditable decisions. This is first-release functionality, not a deferred workflow feature.
5. **Assignments:** central administration assigns roles, and each team Leader can appoint a new Leader or Member in that team, including promotion of a basic public HUST user. Same-team Leader appointment is deliberately allowed. Global roles, other teams and role-definition changes remain central.
6. **Publisher-controlled visibility:** an authorized record publisher chooses who may view through public/team/role selectors. Role selections include their scope. Viewing and approving remain distinct from publishing. Enforce Administrator-only classification and required publication workflows before changes take effect.
7. **HUST-only accounts:** support @hust.edu.vn and @sis.hust.edu.vn. No external/non-HUST application accounts. Enforce verified identity across entry/update/assignment paths without importing or changing legacy accounts. Whether local password login remains for already verified HUST identities is an implementation choice; it must never admit unverified/non-HUST users.
8. **Deferred governance detail:** defer historical-reporting, audit-retention and sensitive-work policy design. Working interpretation of the temporary restriction: historical reporting, audit inspection and sensitive-work controls are usable only by Administrator, not Dean or team Leader. Keep required internal audit capture and existing history; do not invent retention periods or automatic deletion.

Remaining implementation details are the exact checkbox matrix, initial supported action types/workflow definitions, official unit parent mappings, named laboratory/group rosters, self-approval choice and real HUST identity provisioning. These refine confirmed decisions rather than reopening them. Recommended workflow defaults (such as no self-approval) remain explicit design defaults until configured by Administrator.

First implementation slice: verified HUST identity, organizational units, Public/Member/Leader/Admin/Dean roles, same-team Leader appointment, audience selection, one admin-configurable action approval workflow, and consistent detail/list/file/report authorization tests. Expand to remaining action types and operational domains after those boundaries pass. This slice is available for local testing; production readiness remains a separate milestone.
