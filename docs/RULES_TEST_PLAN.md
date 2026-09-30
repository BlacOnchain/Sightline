# Sightline - Firestore Security Rules Test Plan

This document outlines the test cases and matrix validating Sightline's Firestore security rules (`firestore.rules`) against the workspace Role-Based Access Control (RBAC) model.

---

## 1. Role-Based Access Matrix

| Resource & Operation | Unauthenticated | Non-Member | Viewer | Analyst | Owner |
|---|:---:|:---:|:---:|:---:|:---:|
| `users/{uid}` - Read own | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `users/{uid}` - Read other | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| `users/{uid}` - Create/Update own | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `users/{uid}` - Delete | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY |
| `workspaces/{wid}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `workspaces/{wid}` - Create | ❌ DENY | ✅ ALLOW (as owner) | ✅ ALLOW (as owner) | ✅ ALLOW (as owner) | ✅ ALLOW (as owner) |
| `workspaces/{wid}` - Update name | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW |
| `workspaces/{wid}` - Delete | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW |
| `members/{uid}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `members/{uid}` - Create / Invite | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW |
| `members/{uid}` - Update role | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW |
| `members/{uid}` - Remove member | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW |
| `members/{uid}` - Leave workspace | ❌ DENY | ❌ DENY | ✅ ALLOW (self) | ✅ ALLOW (self) | ✅ ALLOW (self) |
| `brands/{bid}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `brands/{bid}` - Create / Edit / Delete | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW |
| `queries/{qid}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `queries/{qid}` - Create / Edit / Delete | ❌ DENY | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW |
| `runs/{rid}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `runs/{rid}` - Write (Create/Edit) | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY (Server Admin SDK Only) |
| `reports/{repId}` - Read | ❌ DENY | ❌ DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW |
| `reports/{repId}` - Write (Create/Edit) | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY | ❌ DENY (Server Admin SDK Only) |

---

## 2. Test Cases Specification

### 2.1 Authentication & User Profiles
- **TC-AUTH-01 (Unauthenticated User Profile Access)**:
  - Input: Unauthenticated request to read `/users/user_123`.
  - Expected: `PERMISSION_DENIED`.
- **TC-AUTH-02 (Authenticated User Reading Own Profile)**:
  - Input: Authenticated as `user_123` reading `/users/user_123`.
  - Expected: `ALLOW`.
- **TC-AUTH-03 (Authenticated User Reading Another Profile)**:
  - Input: Authenticated as `user_456` attempting to read `/users/user_123`.
  - Expected: `PERMISSION_DENIED`.
- **TC-AUTH-04 (User Profile Deletion Prevention)**:
  - Input: `user_123` attempting to delete `/users/user_123`.
  - Expected: `PERMISSION_DENIED` (user documents cannot be deleted directly).

### 2.2 Workspace Management & Isolation
- **TC-WS-01 (Non-member Access Prevention)**:
  - Input: User `user_outside` attempting to read `/workspaces/ws_alpha`.
  - Expected: `PERMISSION_DENIED`.
- **TC-WS-02 (Owner Creating Workspace)**:
  - Input: Authenticated user creating `/workspaces/ws_new` with `ownerId: request.auth.uid`.
  - Expected: `ALLOW`.
- **TC-WS-03 (Analyst Updating Workspace Name)**:
  - Input: Member with role `'analyst'` updating `/workspaces/ws_alpha.name`.
  - Expected: `PERMISSION_DENIED`.
- **TC-WS-04 (Owner Updating Workspace Name)**:
  - Input: Owner updating `/workspaces/ws_alpha.name`.
  - Expected: `ALLOW`.
- **TC-WS-05 (Analyst Deleting Workspace)**:
  - Input: Member with role `'analyst'` attempting to delete `/workspaces/ws_alpha`.
  - Expected: `PERMISSION_DENIED`.
- **TC-WS-06 (Owner Deleting Workspace)**:
  - Input: Owner deleting `/workspaces/ws_alpha`.
  - Expected: `ALLOW`.

### 2.3 Member Management & Permissions
- **TC-MEM-01 (Analyst Inviting Member)**:
  - Input: Member with role `'analyst'` creating `/workspaces/ws_alpha/members/new_user`.
  - Expected: `PERMISSION_DENIED`.
- **TC-MEM-02 (Owner Adding Member)**:
  - Input: Owner creating `/workspaces/ws_alpha/members/user_bob` with role `'analyst'`.
  - Expected: `ALLOW`.
- **TC-MEM-03 (Owner Updating Member Role)**:
  - Input: Owner updating `/workspaces/ws_alpha/members/user_bob` role from `'analyst'` to `'viewer'`.
  - Expected: `ALLOW`.
- **TC-MEM-04 (Viewer Self-Removal)**:
  - Input: Member `user_bob` deleting `/workspaces/ws_alpha/members/user_bob`.
  - Expected: `ALLOW`.

### 2.4 Brands & Queries Operations
- **TC-BQ-01 (Viewer Creating Brand)**:
  - Input: Viewer attempting to create `/workspaces/ws_alpha/brands/brand_1`.
  - Expected: `PERMISSION_DENIED`.
- **TC-BQ-02 (Analyst Creating Brand with Valid Schema)**:
  - Input: Analyst creating brand with name, kind `'competitor'`, and aliases list.
  - Expected: `ALLOW`.
- **TC-BQ-03 (Analyst Creating Brand with Oversized Name)**:
  - Input: Analyst creating brand with name > 100 characters.
  - Expected: `PERMISSION_DENIED`.
- **TC-BQ-04 (Viewer Creating Query)**:
  - Input: Viewer attempting to create `/workspaces/ws_alpha/queries/q_1`.
  - Expected: `PERMISSION_DENIED`.
- **TC-BQ-05 (Analyst Creating Query with Valid Frequency)**:
  - Input: Analyst creating query with frequency `'daily'` and active `true`.
  - Expected: `ALLOW`.
- **TC-BQ-06 (Analyst Creating Query with Invalid Frequency)**:
  - Input: Analyst creating query with frequency `'hourly'`.
  - Expected: `PERMISSION_DENIED`.

### 2.5 Run Records & Reports Write Protection
- **TC-PROT-01 (Client Directly Creating Run Record)**:
  - Input: Owner attempting to write directly to `/workspaces/ws_alpha/runs/run_fake`.
  - Expected: `PERMISSION_DENIED` (client-side writes strictly forbidden; server Admin SDK only).
- **TC-PROT-02 (Client Directly Creating Report Record)**:
  - Input: Owner attempting to write directly to `/workspaces/ws_alpha/reports/rep_fake`.
  - Expected: `PERMISSION_DENIED` (client-side writes strictly forbidden; server Admin SDK only).
- **TC-PROT-03 (Member Reading Run Records)**:
  - Input: Viewer or Analyst reading `/workspaces/ws_alpha/runs/run_1`.
  - Expected: `ALLOW`.

---

## 3. Automated Test Execution Instructions

For CI/CD and local automated testing using `@firebase/rules-unit-testing`:

```bash
# Start local Firestore emulator
firebase emulators:start --only firestore

# Execute rules testing suite
npm run test:rules
```
