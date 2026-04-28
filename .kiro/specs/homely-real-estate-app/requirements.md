# Requirements Document

## Introduction

HOMELY is a full-stack real estate web application that enables users to browse property listings and allows agents to create, manage, and delete their own listings. The platform is built on Next.js (App Router) with Supabase as the backend, providing real-time database interactions, secure authentication, file storage, and row-level security. An admin dashboard provides platform-wide moderation, user management, and analytics. The UI follows a teal/dark-navy brand identity with a responsive, search-driven layout.

## Glossary

- **System**: The HOMELY web application as a whole
- **Frontend**: The Next.js App Router application served to the browser
- **Supabase_Client**: The Supabase JavaScript SDK used on the frontend to interact with the database, auth, storage, and realtime services
- **Auth_Service**: Supabase Auth, responsible for user registration, login, session management, and JWT issuance
- **Database**: The PostgreSQL instance hosted on Supabase containing the `profiles` and `properties` tables
- **Storage_Service**: Supabase Storage buckets used to host property gallery images
- **Realtime_Service**: Supabase Realtime WebSocket service that pushes database change events to connected clients
- **RLS**: Row Level Security policies enforced by PostgreSQL on the Database
- **User**: An authenticated or unauthenticated visitor of the application with role `user`
- **Agent**: An authenticated user with role `agent` who can create and manage property listings
- **Admin**: An authenticated user with role `admin` who has full platform management capabilities
- **Listing**: A property record stored in the `properties` table
- **Middleware**: Next.js server middleware that runs before page rendering to enforce route-level access control
- **Admin_Dashboard**: The protected section of the Frontend accessible only to Admins, providing user management, listing moderation, and analytics
- **CDN**: Supabase's content delivery network used to serve optimised property images

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a visitor, I want to register and log in to HOMELY, so that I can access personalised features and manage my account.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email address and password on the registration form, THE Auth_Service SHALL create a new user account and issue a JWT session token.
2. WHEN a visitor submits an email address and password that match an existing account, THE Auth_Service SHALL authenticate the user and establish a session.
3. WHEN a visitor initiates a social login via a supported OAuth provider, THE Auth_Service SHALL redirect the visitor to the provider, handle the callback, and establish a session.
4. IF a visitor submits an email address that is already registered during sign-up, THEN THE Auth_Service SHALL return an error indicating the email is already in use.
5. IF a visitor submits invalid credentials during login, THEN THE Auth_Service SHALL return an authentication error without revealing which field is incorrect.
6. WHEN an authenticated user requests to log out, THE Auth_Service SHALL invalidate the current session and clear the JWT from the client.
7. WHEN a new user account is created, THE Database SHALL automatically insert a corresponding row into the `profiles` table with `role` set to `'user'`.

---

### Requirement 2: User Profile Management

**User Story:** As an authenticated user, I want to view and update my profile, so that my account information stays current.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to their profile page, THE Frontend SHALL display the user's `full_name` and `avatar_url` retrieved from the `profiles` table.
2. WHEN an authenticated user submits updated profile information, THE Supabase_Client SHALL execute an `.update()` on the `profiles` table row where `id` matches the authenticated user's `auth.uid()`.
3. WHEN an authenticated user uploads a new avatar image, THE Storage_Service SHALL store the image in the designated avatars bucket and THE Supabase_Client SHALL update the `avatar_url` field in the `profiles` table.
4. IF an unauthenticated visitor attempts to access the profile page, THEN THE Middleware SHALL redirect the visitor to the login page.

---

### Requirement 3: Property Listing — Read (Browse & Search)

**User Story:** As a visitor, I want to browse and search available property listings, so that I can find properties that match my criteria.

#### Acceptance Criteria

1. THE Frontend SHALL display a paginated grid of Listings retrieved from the `properties` table where `status = 'available'` and `moderation_status = 'approved'`.
2. WHEN a visitor applies a location filter, THE Supabase_Client SHALL execute a `.select()` query with an `.ilike('address', '%<term>%')` modifier to return matching Listings.
3. WHEN a visitor applies a property type filter, THE Supabase_Client SHALL execute a `.select()` query with an `.eq('property_type', <value>)` modifier to return matching Listings.
4. WHEN a visitor applies a minimum price filter, THE Supabase_Client SHALL execute a `.select()` query with a `.gte('price', <value>)` modifier to return matching Listings.
5. WHEN a visitor applies a maximum price filter, THE Supabase_Client SHALL execute a `.select()` query with a `.lte('price', <value>)` modifier to return matching Listings.
6. WHEN a visitor selects a Listing from the grid, THE Frontend SHALL display a detail page showing the Listing's `title`, `description`, `price`, `address`, `bedrooms`, `bathrooms`, `sqft`, and image gallery.
7. THE Frontend SHALL display a "Recently Added" sidebar panel showing the most recently created Listings ordered by `created_at` descending.
8. WHEN property images are displayed, THE Frontend SHALL load image URLs served via the CDN to optimise asset delivery.

---

### Requirement 4: Property Listing — Create

**User Story:** As an Agent, I want to create a new property listing, so that I can advertise properties to potential buyers.

#### Acceptance Criteria

1. WHEN an Agent submits a completed listing creation form, THE Supabase_Client SHALL execute an `.insert()` into the `properties` table with `agent_id` set to the Agent's `auth.uid()` and `moderation_status` set to `'pending'`.
2. WHEN an Agent uploads property images during listing creation, THE Storage_Service SHALL store each image in the properties storage bucket and return a public URL.
3. WHEN property images are successfully uploaded, THE Supabase_Client SHALL store the returned public URLs in the `images` array field of the Listing.
4. IF an Agent submits the listing creation form with any required field (`title`, `price`, `address`, `bedrooms`, `bathrooms`, `sqft`) left empty, THEN THE Frontend SHALL display a validation error for each missing field and SHALL NOT submit the form to the Database.
5. IF an unauthenticated visitor or a User with role `'user'` attempts to access the listing creation form, THEN THE Middleware SHALL redirect them to the login page or display an authorisation error.
6. WHILE the listing creation form is being submitted, THE Frontend SHALL display a loading indicator and disable the submit button to prevent duplicate submissions.

---

### Requirement 5: Property Listing — Update

**User Story:** As an Agent, I want to edit my existing property listings, so that I can keep listing details accurate and reflect price changes.

#### Acceptance Criteria

1. WHEN an Agent submits an updated listing form, THE Supabase_Client SHALL execute an `.update()` on the `properties` table row where `id` matches the Listing's `id`.
2. THE RLS SHALL enforce that an Agent can only execute an `.update()` on a Listing row where `agent_id` matches the Agent's `auth.uid()`.
3. WHEN the `price` field of a Listing is updated in the Database, THE Realtime_Service SHALL broadcast the change event to all connected clients subscribed to that Listing.
4. WHEN a connected client receives a price change event from THE Realtime_Service, THE Frontend SHALL update the displayed price without requiring a page refresh.
5. WHEN an Agent updates the `status` field of a Listing to `'sold'`, THE Realtime_Service SHALL broadcast the status change to all connected clients, and THE Frontend SHALL reflect the sold status in real time.
6. IF an Agent attempts to update a Listing where `agent_id` does not match the Agent's `auth.uid()`, THEN THE RLS SHALL reject the operation and return a permission error.

---

### Requirement 6: Property Listing — Delete

**User Story:** As an Agent, I want to delete my property listings, so that I can remove listings that are no longer relevant.

#### Acceptance Criteria

1. WHEN an Agent confirms deletion of a Listing, THE Supabase_Client SHALL execute a `.delete()` on the `properties` table row where `id` matches the Listing's `id`.
2. THE RLS SHALL enforce that an Agent can only execute a `.delete()` on a Listing row where `agent_id` matches the Agent's `auth.uid()`.
3. WHEN a Listing is deleted, THE Storage_Service SHALL remove all images associated with that Listing from the properties storage bucket.
4. IF an Agent attempts to delete a Listing where `agent_id` does not match the Agent's `auth.uid()`, THEN THE RLS SHALL reject the operation and return a permission error.
5. WHEN a Listing is successfully deleted, THE Frontend SHALL remove the Listing from the displayed grid without requiring a page refresh.

---

### Requirement 7: Row Level Security (RLS)

**User Story:** As a platform operator, I want database access controlled by RLS policies, so that users can only read or modify data they are authorised to access.

#### Acceptance Criteria

1. THE RLS SHALL permit any visitor (authenticated or unauthenticated) to execute a `SELECT` on `properties` rows where `status = 'available'` and `moderation_status = 'approved'`.
2. THE RLS SHALL permit an authenticated Agent to execute `INSERT` on the `properties` table only when the `agent_id` value in the new row equals the Agent's `auth.uid()`.
3. THE RLS SHALL permit an authenticated Agent to execute `UPDATE` or `DELETE` on a `properties` row only when the `agent_id` value in that row equals the Agent's `auth.uid()`.
4. THE RLS SHALL permit an authenticated user to execute `SELECT`, `UPDATE` on the `profiles` row where `id` equals the user's `auth.uid()`.
5. THE RLS SHALL permit an Admin to execute `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all rows in both the `profiles` and `properties` tables, overriding all other RLS policies.

---

### Requirement 8: Real-Time UI Updates

**User Story:** As a visitor, I want the property listings page to reflect live changes, so that I always see the most current availability and pricing without refreshing.

#### Acceptance Criteria

1. WHEN the Frontend mounts the listings page, THE Supabase_Client SHALL subscribe to the Realtime_Service channel for the `properties` table.
2. WHEN the Realtime_Service broadcasts an `UPDATE` event for a Listing, THE Frontend SHALL update the affected Listing card in the grid with the new data.
3. WHEN the Realtime_Service broadcasts an `INSERT` event for a new approved Listing, THE Frontend SHALL add the new Listing card to the grid.
4. WHEN the Realtime_Service broadcasts a `DELETE` event for a Listing, THE Frontend SHALL remove the corresponding Listing card from the grid.
5. WHEN the Frontend unmounts the listings page, THE Supabase_Client SHALL unsubscribe from the Realtime_Service channel to prevent memory leaks.

---

### Requirement 9: File Storage & Image Management

**User Story:** As an Agent, I want to upload multiple property images, so that listings are visually appealing to potential buyers.

#### Acceptance Criteria

1. THE Storage_Service SHALL accept image uploads in JPEG, PNG, and WebP formats for property listings.
2. WHEN an Agent uploads a property image, THE Storage_Service SHALL enforce a maximum file size of 10 MB per image.
3. IF an Agent attempts to upload a file that is not a JPEG, PNG, or WebP, THEN THE Frontend SHALL display a validation error and SHALL NOT submit the file to the Storage_Service.
4. IF an Agent attempts to upload a file exceeding 10 MB, THEN THE Frontend SHALL display a file size error and SHALL NOT submit the file to the Storage_Service.
5. WHEN a property image is stored, THE Storage_Service SHALL make the image accessible via a public CDN URL.
6. THE Storage_Service SHALL enforce that only the owning Agent or an Admin can delete images from the properties storage bucket.

---

### Requirement 10: Admin Dashboard — User Management

**User Story:** As an Admin, I want to view and manage all user profiles, so that I can maintain platform integrity and handle policy violations.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Users section of the Admin_Dashboard, THE Frontend SHALL display a searchable, paginated data grid of all rows in the `profiles` table.
2. WHEN an Admin searches the user grid by name, THE Supabase_Client SHALL execute a `.select()` with an `.ilike('full_name', '%<term>%')` modifier and THE Frontend SHALL update the grid with matching results.
3. WHEN an Admin updates a user's `role` field, THE Supabase_Client SHALL execute an `.update()` on the `profiles` table row for that user.
4. WHEN an Admin sets a user's account status to banned, THE Supabase_Client SHALL update the user's profile record to reflect the banned status and THE Auth_Service SHALL revoke the user's active sessions.
5. WHEN an Admin deletes a user profile, THE Supabase_Client SHALL execute a `.delete()` on the `profiles` table row and THE Auth_Service SHALL delete the corresponding auth account.
6. IF a non-Admin user attempts to access any Admin_Dashboard route, THEN THE Middleware SHALL intercept the request and return a 403 response before the page renders.

---

### Requirement 11: Admin Dashboard — Listing Moderation

**User Story:** As an Admin, I want to review and moderate property listings, so that only compliant listings are visible to the public.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Properties section of the Admin_Dashboard, THE Frontend SHALL display a searchable, paginated data grid of all Listings including their `moderation_status`.
2. WHEN an Admin sets a Listing's `moderation_status` to `'approved'`, THE Supabase_Client SHALL execute an `.update()` on that Listing row and THE Listing SHALL become visible in public search results.
3. WHEN an Admin sets a Listing's `moderation_status` to `'rejected'`, THE Supabase_Client SHALL execute an `.update()` on that Listing row and THE Listing SHALL be excluded from public search results.
4. WHEN an Admin archives a Listing by setting its `status` to `'archived'`, THE Supabase_Client SHALL execute an `.update()` on that Listing row and THE Listing SHALL be excluded from public search results.
5. WHEN an Admin deletes a Listing, THE Supabase_Client SHALL execute a `.delete()` on the `properties` table row and THE Storage_Service SHALL remove all associated images.

---

### Requirement 12: Admin Dashboard — Analytics

**User Story:** As an Admin, I want to view platform analytics, so that I can monitor growth and make informed business decisions.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Analytics section of the Admin_Dashboard, THE Frontend SHALL display summary cards showing total platform revenue (sum of `price` for Listings with `status = 'sold'`), total active Listings (count of Listings with `status = 'available'`), and total registered users (count of rows in `profiles`).
2. WHEN an Admin views the Analytics section, THE Frontend SHALL display a chart showing user growth over time based on `profiles.created_at` timestamps.
3. THE Frontend SHALL refresh Analytics data at a maximum interval of 60 seconds to reflect recent platform activity.

---

### Requirement 13: Responsive UI & Navigation

**User Story:** As a visitor, I want a responsive, branded interface, so that I can comfortably use HOMELY on any device.

#### Acceptance Criteria

1. THE Frontend SHALL render a navigation bar containing the HOMELY brand logo, a property search input, and links to Listings, About, Services, and the authenticated user's profile.
2. WHEN a visitor is not authenticated, THE Frontend SHALL display a "Sign In" link in the navigation bar in place of the user profile link.
3. THE Frontend SHALL render a hero section on the home page containing filter controls for location, property type, and price range.
4. THE Frontend SHALL apply the teal and dark-navy colour scheme defined in the Tailwind CSS configuration consistently across all pages.
5. THE Frontend SHALL render all pages with a responsive layout that adapts to viewport widths from 320px to 1920px without horizontal scrolling.
6. THE Frontend SHALL render a footer containing links grouped under Company, Legal, and Socials sections.
7. WHEN a visitor submits the hero search form, THE Frontend SHALL navigate to the listings page with the selected filters pre-applied as query parameters.
