# Implementation Plan: HOMELY Real Estate Application

## Overview

Build the full HOMELY platform incrementally — from project scaffolding through Supabase backend setup, shared UI, public pages, real-time features, agent tools, user profile, admin dashboard, middleware, pure-logic utilities, and finally the complete test suite. Each task builds directly on the previous ones, ending with all components wired together and verified.

## Tasks

- [x] 1. Project scaffolding and configuration
  - Bootstrap a Next.js 14 App Router project with TypeScript strict mode enabled
  - Install and configure Tailwind CSS with the teal/dark-navy brand palette defined as custom colours in `tailwind.config.ts`
  - Install project dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `fast-check`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `recharts`
  - Create the full `app/` route-group directory structure: `(public)`, `(auth)`, `(protected)`, `admin/`, and `api/webhooks/` as defined in the design
  - Create `vitest.config.ts` with jsdom environment, `@testing-library/jest-dom` setup file, and path aliases matching `tsconfig.json`
  - Create `__tests__/unit/`, `__tests__/property/`, and `__tests__/integration/` directories with `.gitkeep` files
  - Define all shared TypeScript types in `lib/types.ts`: `UserRole`, `ListingStatus`, `ModerationStatus`, `Profile`, `Property`, `PropertyFormInput`, `ListingFilters`, `ActionResult`
  - _Requirements: 13.4_

- [x] 2. Supabase project setup — database schema, RLS, storage, and triggers
  - Create `supabase/migrations/001_initial_schema.sql` containing the `profiles` table DDL, `properties` table DDL, `handle_new_user` trigger function, and `on_auth_user_created` trigger exactly as specified in the design
  - Add all RLS policies to the migration file: `profiles_select_own`, `profiles_update_own`, `profiles_admin_all`, `properties_public_select`, `properties_agent_insert`, `properties_agent_update`, `properties_agent_delete`, `properties_admin_all`
  - Create `supabase/migrations/002_storage_buckets.sql` defining the `avatars` bucket (authenticated read/write, 5 MB limit, JPEG/PNG/WebP) and `properties` bucket (public read, authenticated write, 10 MB limit, JPEG/PNG/WebP)
  - Create `.env.local.example` documenting `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
  - _Requirements: 1.7, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.5, 9.6_

- [x] 3. Supabase client utilities
  - Create `lib/supabase/browser.ts` exporting `createBrowserClient()` using `@supabase/ssr` — used in Client Components for real-time and uploads
  - Create `lib/supabase/server.ts` exporting `createServerClient()` that reads the session from Next.js cookies — used in Server Components and Server Actions
  - Create `lib/supabase/middleware.ts` exporting `createMiddlewareClient(request, response)` for use in `middleware.ts`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Next.js Middleware — route protection
  - Create `middleware.ts` at the project root that intercepts all requests
  - Validate the Supabase session cookie on every request using the middleware client
  - Redirect unauthenticated requests to `/login` for routes matching `/profile`, `/agent/*`
  - Return a 403 response for requests to `/admin/*` where the session role is not `'admin'`
  - Redirect non-agent authenticated users away from `/agent/*` routes
  - Export a `config.matcher` that covers `(protected)`, `agent`, and `admin` route groups
  - _Requirements: 2.4, 4.5, 10.6_

  - [ ]* 4.1 Write property test for middleware authorization
    - **Property 9: Middleware enforces route authorization**
    - **Validates: Requirements 2.4, 4.5, 10.6**
    - Create `__tests__/property/middleware.property.test.ts`
    - Use `fc.record({ path: fc.constantFrom(...protectedPaths), role: fc.option(fc.constantFrom('user','agent','admin')) })` as arbitrary
    - Tag: `// Feature: homely-real-estate-app, Property 9: Middleware enforces route authorization`

- [ ] 5. Pure-logic utility functions
  - [x] 5.1 Implement query builder utilities in `lib/queryBuilder.ts`
    - Export `buildPublicListingsQuery(client, filters: ListingFilters)` — applies `.eq('status','available')`, `.eq('moderation_status','approved')`, and all active filter modifiers (`.ilike`, `.eq`, `.gte`, `.lte`, `.range` for pagination)
    - Export `buildListingsQuery(client, filters: ListingFilters)` — admin/agent variant without the public status filter
    - Export `buildRecentlyAddedQuery(client, limit: number)` — orders by `created_at` descending
    - Export `buildListingsUrl(filters: Partial<ListingFilters>): string` — encodes non-empty filter values as URL query parameters for the listings page
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 13.7_

  - [ ]* 5.2 Write property tests for query builder
    - **Property 1: Public listing filter correctness** — `buildPublicListingsQuery`
    - **Property 2: Query filter composition** — `buildListingsQuery`
    - **Property 3: Recently added ordering invariant** — `buildRecentlyAddedQuery`
    - **Property 15: Hero form encodes filters as URL query parameters** — `buildListingsUrl`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 10.2, 13.7**
    - Create `__tests__/property/queryBuilder.property.test.ts`
    - Tag each test: `// Feature: homely-real-estate-app, Property {N}: {property_text}`

  - [x] 5.3 Implement validation utilities in `lib/validation.ts`
    - Export `validateListingForm(input: Partial<PropertyFormInput>): Record<string, string>` — returns an error map with one entry per missing required field (`title`, `price`, `address`, `bedrooms`, `bathrooms`, `sqft`)
    - Export `validateImageFile(file: { type: string; size: number }): { valid: boolean; error?: string }` — rejects non-JPEG/PNG/WebP types and files exceeding 10,485,760 bytes
    - _Requirements: 4.4, 9.3, 9.4_

  - [ ]* 5.4 Write property tests for validation utilities
    - **Property 6: Form validation rejects incomplete listings** — `validateListingForm`
    - **Property 7: File type validation rejects invalid formats** — `validateImageFile`
    - **Property 8: File size validation rejects oversized files** — `validateImageFile`
    - **Validates: Requirements 4.4, 9.3, 9.4**
    - Create `__tests__/property/fileValidation.property.test.ts`
    - Tag each test: `// Feature: homely-real-estate-app, Property {N}: {property_text}`

  - [x] 5.5 Implement listing action payload builders in `lib/listingActions.ts`
    - Export `buildInsertPayload(input: PropertyFormInput, uid: string): Omit<Property, 'id' | 'created_at'>` — sets `agent_id = uid` and `moderation_status = 'pending'` unconditionally
    - Export `buildListingWithImages(input: PropertyFormInput, imageUrls: string[]): PropertyFormInput & { images: string[] }` — merges all returned CDN URLs into the `images` array
    - _Requirements: 4.1, 4.3_

  - [ ]* 5.6 Write property tests for listing action payload builders
    - **Property 4: Listing creation sets correct defaults** — `buildInsertPayload`
    - **Property 5: Uploaded image URLs are stored in listing** — `buildListingWithImages`
    - **Validates: Requirements 4.1, 4.3**
    - Create `__tests__/property/listingActions.property.test.ts`
    - Tag each test: `// Feature: homely-real-estate-app, Property {N}: {property_text}`

  - [x] 5.7 Implement real-time state handler functions in `lib/realtimeHandlers.ts`
    - Export `applyRealtimeUpdate(listings: Property[], event: { new: Property }): Property[]` — replaces the listing whose `id` matches `event.new.id`, leaves all others unchanged
    - Export `applyRealtimeInsert(listings: Property[], event: { new: Property }): Property[]` — prepends the new listing only if `moderation_status === 'approved'`
    - Export `applyRealtimeDelete(listings: Property[], event: { old: { id: string } }): Property[]` — filters out the listing whose `id` matches `event.old.id`
    - _Requirements: 5.4, 5.5, 6.5, 8.2, 8.3, 8.4_

  - [ ]* 5.8 Write property tests for real-time handlers
    - **Property 10: Realtime UPDATE handler applies new data** — `applyRealtimeUpdate`
    - **Property 11: Realtime INSERT handler adds new listing** — `applyRealtimeInsert`
    - **Property 12: Realtime DELETE handler removes listing** — `applyRealtimeDelete`
    - **Validates: Requirements 5.4, 5.5, 6.5, 8.2, 8.3, 8.4**
    - Create `__tests__/property/realtimeHandlers.property.test.ts`
    - Tag each test: `// Feature: homely-real-estate-app, Property {N}: {property_text}`

  - [x] 5.9 Implement analytics aggregation utilities in `lib/analytics.ts`
    - Export `computeAnalytics(properties: Property[], profiles: Profile[]): { totalRevenue: number; activeListings: number; totalUsers: number }` — sums `price` for `status='sold'`, counts `status='available'`, counts all profiles
    - _Requirements: 12.1_

  - [ ]* 5.10 Write property test for analytics aggregation
    - **Property 13: Analytics aggregation correctness** — `computeAnalytics`
    - **Validates: Requirements 12.1**
    - Create `__tests__/property/analytics.property.test.ts`
    - Tag: `// Feature: homely-real-estate-app, Property 13: Analytics aggregation correctness`

- [x] 6. Checkpoint — run all property tests
  - Ensure all property tests in `__tests__/property/` pass with `npx vitest run __tests__/property`, ask the user if questions arise.

- [ ] 7. Server Actions
  - [x] 7.1 Implement listing Server Actions in `actions/listings.ts`
    - `createListing(formData: FormData): Promise<ActionResult>` — validates with `validateListingForm`, uploads images via Storage, builds payload with `buildInsertPayload` and `buildListingWithImages`, inserts into `properties` table; cleans up uploaded images on failure
    - `updateListing(id: string, formData: FormData): Promise<ActionResult>` — validates, updates the `properties` row; wraps in try/catch returning `ActionResult`
    - `deleteListing(id: string): Promise<ActionResult>` — deletes images from the `properties` storage bucket, then deletes the `properties` row
    - All actions use the server Supabase client so RLS is enforced with the user's JWT
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 6.1, 6.3_

  - [x] 7.2 Implement profile Server Action in `actions/profile.ts`
    - `updateProfile(formData: FormData): Promise<ActionResult>` — uploads avatar to `avatars` bucket if provided, updates `profiles` row for `auth.uid()`
    - _Requirements: 2.2, 2.3_

  - [x] 7.3 Implement admin Server Actions in `actions/admin.ts`
    - `moderateListing(id: string, status: ModerationStatus): Promise<ActionResult>` — updates `moderation_status` on the target listing
    - `updateUserRole(userId: string, role: UserRole): Promise<ActionResult>` — updates `role` on the target profile
    - `banUser(userId: string): Promise<ActionResult>` — updates profile banned status and calls Supabase Admin API to revoke sessions
    - `deleteUser(userId: string): Promise<ActionResult>` — deletes the profile row and calls Supabase Admin API to delete the auth account
    - _Requirements: 10.3, 10.4, 10.5, 11.2, 11.3, 11.4, 11.5_

- [ ] 8. Core shared UI components
  - [x] 8.1 Implement `<Navbar>` in `components/Navbar.tsx`
    - Client Component; accepts `session` prop (null for unauthenticated)
    - Renders HOMELY brand logo, property search input, and nav links (Listings, About, Services)
    - Renders "Sign In" link when `session` is null; renders user avatar/profile link when authenticated
    - Applies teal/dark-navy colour scheme via Tailwind classes
    - _Requirements: 13.1, 13.2_

  - [ ]* 8.2 Write unit tests for `<Navbar>`
    - Test unauthenticated state renders "Sign In" and no profile link
    - Test authenticated state renders profile link and no "Sign In"
    - **Property 14: Unauthenticated navbar shows Sign In** (example-based)
    - **Validates: Requirements 13.2**
    - Create `__tests__/unit/components/Navbar.test.tsx`

  - [x] 8.3 Implement `<Footer>` in `components/Footer.tsx`
    - Server Component; renders link groups for Company, Legal, and Socials sections
    - _Requirements: 13.6_

  - [x] 8.4 Implement root layout in `app/layout.tsx`
    - Wraps all pages with `<Navbar>` (passing server-fetched session) and `<Footer>`
    - Includes global Tailwind CSS import and `error.tsx` global error boundary
    - _Requirements: 13.1, 13.4, 13.5_

  - [x] 8.5 Implement `<ImageUploader>` in `components/ImageUploader.tsx`
    - Client Component; multi-file picker that calls `validateImageFile` on each selected file
    - Displays inline errors for invalid type or oversized files immediately on selection
    - Exposes selected valid files via callback prop
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9. Authentication pages
  - [x] 9.1 Implement registration page at `app/(auth)/register/page.tsx`
    - Client Component form with email and password fields
    - Calls `supabase.auth.signUp()` on submit; displays "An account with this email already exists." on duplicate email error
    - Redirects to home on success
    - _Requirements: 1.1, 1.4_

  - [x] 9.2 Implement login page at `app/(auth)/login/page.tsx`
    - Client Component form with email and password fields
    - Calls `supabase.auth.signInWithPassword()` on submit; displays generic "Invalid email or password" on failure (never reveals which field)
    - Supports `?reason=session_expired` and `?reason=oauth_error` query params to show contextual messages
    - Includes OAuth provider button(s) that call `supabase.auth.signInWithOAuth()`
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 9.3 Implement OAuth callback route at `app/api/auth/callback/route.ts`
    - Exchanges the OAuth code for a session via `supabase.auth.exchangeCodeForSession()`
    - Redirects to home on success; redirects to `/login?reason=oauth_error` on failure
    - _Requirements: 1.3_

  - [x] 9.4 Add sign-out action
    - Create `actions/auth.ts` exporting `signOut(): Promise<void>` — calls `supabase.auth.signOut()` and redirects to `/login`
    - Wire sign-out button in `<Navbar>` to this action
    - _Requirements: 1.6_

- [ ] 10. Public pages — Home, Listings, Listing Detail, About, Services
  - [x] 10.1 Implement `<HeroSearch>` component in `components/HeroSearch.tsx`
    - Client Component with controlled inputs for location, property type (select), min price, and max price
    - On submit, calls `buildListingsUrl(filters)` and uses `router.push()` to navigate to the listings page with query params
    - _Requirements: 13.3, 13.7_

  - [x] 10.2 Implement Home page at `app/(public)/page.tsx`
    - Server Component; renders `<HeroSearch>` and a preview listings grid (first 6 approved/available listings)
    - _Requirements: 13.3_

  - [x] 10.3 Implement `<PropertyCard>` in `components/PropertyCard.tsx`
    - Displays price, address, bedrooms, bathrooms, sqft, status badge, and CDN image
    - _Requirements: 3.6, 3.8_

  - [x] 10.4 Implement `<PropertyGrid>` in `components/PropertyGrid.tsx`
    - Client Component; accepts initial listings and filters as props
    - Manages local listings state; subscribes to the `listings-public` Realtime channel on mount using `applyRealtimeUpdate`, `applyRealtimeInsert`, `applyRealtimeDelete` handlers
    - Unsubscribes on unmount
    - Renders a paginated grid of `<PropertyCard>` components
    - Falls back to polling every 30 seconds if Realtime subscription fails
    - _Requirements: 3.1, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 10.5 Implement `<RecentSidebar>` in `components/RecentSidebar.tsx`
    - Server Component; fetches the 5 most recent approved/available listings using `buildRecentlyAddedQuery`
    - _Requirements: 3.7_

  - [x] 10.6 Implement Listings page at `app/(public)/listings/page.tsx`
    - Server Component; reads filter query params, fetches initial listings with `buildPublicListingsQuery`, renders `<PropertyGrid>` and `<RecentSidebar>`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 10.7 Implement Listing Detail page at `app/(public)/listings/[id]/page.tsx`
    - Server Component for initial data fetch; renders title, description, price, address, bedrooms, bathrooms, sqft, and image gallery
    - Client sub-component subscribes to the `listing-{id}` Realtime channel to update price and status in real time
    - _Requirements: 3.6, 5.3, 5.4, 5.5_

  - [ ]* 10.8 Write unit test for `<ListingDetail>`
    - Test that all required fields (title, description, price, address, bedrooms, bathrooms, sqft) are rendered from a mock listing
    - Create `__tests__/unit/components/ListingDetail.test.tsx`
    - _Requirements: 3.6_

  - [x] 10.9 Implement About page at `app/(public)/about/page.tsx` and Services page at `app/(public)/services/page.tsx`
    - Static Server Components with brand-consistent layout
    - _Requirements: 13.1_

- [ ] 11. Agent features — listing management
  - [x] 11.1 Implement `<ListingForm>` in `components/ListingForm.tsx`
    - Client Component used for both create and edit; accepts optional `initialData: Property` prop
    - Controlled inputs for all required fields; uses `validateListingForm` for inline validation before submission
    - Embeds `<ImageUploader>` for multi-image selection
    - Calls `createListing` or `updateListing` Server Action on submit
    - Displays loading indicator and disables submit button while submitting
    - Displays form-level error banner on `ActionResult { success: false }`
    - _Requirements: 4.4, 4.6, 5.1_

  - [ ]* 11.2 Write unit test for `<ListingForm>`
    - Test that submit button is disabled and loading indicator is shown during submission
    - Test that inline validation errors appear for missing required fields
    - Create `__tests__/unit/components/ListingForm.test.tsx`
    - _Requirements: 4.4, 4.6_

  - [x] 11.3 Implement Agent listings page at `app/(protected)/agent/listings/page.tsx`
    - Server Component; fetches only the authenticated agent's listings (no public filter)
    - Renders a table of the agent's listings with Edit and Delete action buttons
    - _Requirements: 5.1, 6.1_

  - [x] 11.4 Implement Create Listing page at `app/(protected)/agent/listings/new/page.tsx`
    - Server Component shell rendering `<ListingForm>` with no initial data
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 11.5 Implement Edit Listing page at `app/(protected)/agent/listings/[id]/edit/page.tsx`
    - Server Component; fetches the listing by `id`, passes it as `initialData` to `<ListingForm>`
    - _Requirements: 5.1, 5.2_

  - [x] 11.6 Wire delete listing action to the agent listings table
    - Add a Delete button that calls `deleteListing(id)` Server Action with a confirmation dialog
    - On success, remove the listing from the displayed list without a page refresh
    - _Requirements: 6.1, 6.3, 6.5_

- [ ] 12. User profile page
  - [x] 12.1 Implement `<ProfileForm>` in `components/ProfileForm.tsx`
    - Client Component with `full_name` text input and avatar upload (via `<ImageUploader>` restricted to single file)
    - Calls `updateProfile` Server Action on submit
    - _Requirements: 2.2, 2.3_

  - [x] 12.2 Implement Profile page at `app/(protected)/profile/page.tsx`
    - Server Component; fetches the authenticated user's profile row, renders `<ProfileForm>` with pre-populated values
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 13. Admin dashboard
  - [x] 13.1 Implement Admin layout at `app/admin/layout.tsx`
    - Server Component shell with `<AdminSidebar>` (Client Component) containing navigation links to Analytics, Users, and Properties sections
    - _Requirements: 10.1, 11.1, 12.1_

  - [x] 13.2 Implement `<UserGrid>` in `components/admin/UserGrid.tsx`
    - Client Component; accepts initial profiles array as prop
    - Renders a searchable, paginated table of profiles with columns for name, role, and status
    - Search input calls `updateUserRole` / `banUser` / `deleteUser` Server Actions via inline controls
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 13.3 Write unit test for `<UserGrid>`
    - Test that profiles data is rendered in the table rows
    - Create `__tests__/unit/components/UserGrid.test.tsx`
    - _Requirements: 10.1_

  - [x] 13.4 Implement Admin Users page at `app/admin/users/page.tsx`
    - Server Component; fetches all profiles using the service-role client (bypasses RLS), renders `<UserGrid>`
    - _Requirements: 10.1, 10.2_

  - [x] 13.5 Implement `<PropertyModerationGrid>` in `components/admin/PropertyModerationGrid.tsx`
    - Client Component; renders a searchable, paginated table of all listings with `moderation_status` column
    - Inline Approve / Reject / Archive action buttons call `moderateListing` Server Action
    - Delete button calls `deleteListing` Server Action
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 13.6 Implement Admin Properties page at `app/admin/properties/page.tsx`
    - Server Component; fetches all listings (admin view, no public filter), renders `<PropertyModerationGrid>`
    - _Requirements: 11.1_

  - [x] 13.7 Implement `<AnalyticsCards>` in `components/admin/AnalyticsCards.tsx`
    - Client Component; fetches analytics data on mount using `computeAnalytics` over Supabase query results
    - Displays summary cards: total revenue, active listings, total users
    - Refreshes data every 60 seconds via `setInterval`
    - _Requirements: 12.1, 12.3_

  - [ ]* 13.8 Write unit test for `<AnalyticsCards>`
    - Test that the refresh interval is ≤ 60 seconds
    - Create `__tests__/unit/components/AnalyticsCards.test.tsx`
    - _Requirements: 12.3_

  - [x] 13.9 Implement `<UserGrowthChart>` in `components/admin/UserGrowthChart.tsx`
    - Client Component using Recharts `LineChart`; accepts time-series data derived from `profiles.created_at`
    - _Requirements: 12.2_

  - [ ]* 13.10 Write unit test for `<UserGrowthChart>`
    - Test that the chart renders without error when given time-series data
    - Create `__tests__/unit/components/UserGrowthChart.test.tsx`
    - _Requirements: 12.2_

  - [x] 13.11 Implement Admin Analytics page at `app/admin/analytics/page.tsx`
    - Server Component shell rendering `<AnalyticsCards>` and `<UserGrowthChart>` with initial server-fetched data
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 13.12 Implement Admin root page at `app/admin/page.tsx`
    - Redirects to `app/admin/analytics/page.tsx` as the default admin landing page
    - _Requirements: 12.1_

- [x] 14. Checkpoint — run all unit and property tests
  - Ensure all tests in `__tests__/unit/` and `__tests__/property/` pass with `npx vitest run`, ask the user if questions arise.

- [ ] 15. Unit tests for query builder and validation utilities
  - [ ]* 15.1 Write unit tests for `lib/queryBuilder.ts`
    - Test `buildPublicListingsQuery` applies correct filters for each filter combination
    - Test `buildListingsUrl` produces correct query strings for edge cases (empty filters, all filters set)
    - Create `__tests__/unit/lib/queryBuilder.test.ts`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.7_

  - [ ]* 15.2 Write unit tests for `lib/validation.ts`
    - Test `validateListingForm` returns errors for each missing required field individually
    - Test `validateImageFile` accepts valid MIME types and rejects invalid ones
    - Test `validateImageFile` accepts files at exactly 10 MB and rejects files above
    - Create `__tests__/unit/lib/validation.test.ts`
    - _Requirements: 4.4, 9.3, 9.4_

  - [ ]* 15.3 Write unit tests for `lib/realtimeHandlers.ts`
    - Test `applyRealtimeUpdate` replaces only the matching listing
    - Test `applyRealtimeInsert` adds only approved listings
    - Test `applyRealtimeDelete` removes only the matching listing
    - Test that Realtime subscription is established on mount and cleaned up on unmount (via `<PropertyGrid>` test)
    - Create `__tests__/unit/lib/realtimeHandlers.test.ts`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 16. Final checkpoint — full test suite
  - Ensure all tests pass with `npx vitest run`, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 6, 14, and 16 ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–13, 15 from design.md)
- Unit tests validate specific examples and edge cases
- Integration tests (in `__tests__/integration/`) are run manually against a local Supabase instance via `supabase start` and are not part of the automated `vitest run` suite
- The `SUPABASE_SERVICE_ROLE_KEY` is used only in Server Components/Actions — never exposed to the browser
