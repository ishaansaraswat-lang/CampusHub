

# Fix: Coordinators Display, Breadcrumb Navigation, and Home Page Buttons

## Issue 1: Event Coordinators Not Showing

**Root Cause:** The query in `useEventCoordinators` tries to join `profiles` via `user_id`:
```typescript
.select('*, profiles:user_id(id, name, email, avatar_url)')
```
But `event_coordinators.user_id` has a foreign key to `auth.users`, NOT to `profiles`. The database can't resolve this join, so coordinator data comes back without profile info.

**Fix:** Change `useEventCoordinators` to fetch coordinators first, then fetch their profiles separately using the `user_id` values. This is a two-query approach:

```typescript
// 1. Fetch coordinators
const { data: coordinators } = await supabase
  .from('event_coordinators')
  .select('*')
  .eq('event_id', eventId);

// 2. Fetch profiles for those user_ids
const userIds = coordinators.map(c => c.user_id);
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('user_id', userIds);

// 3. Merge them together
return coordinators.map(c => ({
  ...c,
  profiles: profiles.find(p => p.user_id === c.user_id) || null
}));
```

Also update `CoordinatorsManagement.tsx` to handle the new data shape (accessing `coordinator.profiles` consistently).

**Files:** `src/hooks/useAdminEvents.ts`, `src/pages/super-admin/CoordinatorsManagement.tsx`

---

## Issue 2: Breadcrumb "Page Not Found"

**Root Cause:** The breadcrumb in `MainLayout.tsx` auto-generates links from each path segment. For a URL like `/super-admin/events/:id/coordinators`, it creates a clickable link for "Super Admin" pointing to `/super-admin` -- but no such route exists (the actual route is `/super-admin/dashboard`).

**Fix:** Update the breadcrumb logic to handle known compound segments (like `super-admin`, `placement-admin`) by mapping them to their correct dashboard routes, and skip generating links for UUID segments (event IDs).

```text
Before: Home > Super Admin (/super-admin) > Events > {uuid} > Coordinators
After:  Home > Super Admin (/super-admin/dashboard) > Events (/super-admin/events) > Coordinators
```

- Map `super-admin` to `/super-admin/dashboard`
- Map `placement-admin` to `/placement-admin/dashboard`  
- Map `admin` to `/admin/dashboard`
- Skip rendering UUID path segments entirely

**File:** `src/components/layout/MainLayout.tsx`

---

## Issue 3: Home Page "Get Started" Button

**Root Cause:** Both "Sign In" and "Get Started" buttons link to `/auth`, which defaults to the login tab.

**Fix:** 
- Change "Get Started" to link to `/auth?tab=signup`
- Update `Auth.tsx` to read the `tab` query parameter and set the default tab accordingly

**Files:** `src/pages/Index.tsx`, `src/pages/Auth.tsx`

---

## Summary of File Changes

| File | Change |
|------|--------|
| `src/hooks/useAdminEvents.ts` | Rewrite `useEventCoordinators` to use two-query approach |
| `src/pages/super-admin/CoordinatorsManagement.tsx` | Minor adjustments for new data shape |
| `src/components/layout/MainLayout.tsx` | Smart breadcrumb routing for compound segments, skip UUIDs |
| `src/pages/Index.tsx` | "Get Started" links to `/auth?tab=signup` |
| `src/pages/Auth.tsx` | Read `tab` query param to set default active tab |

