# UniSwap Development Journal

## Product Overview & Problem Statement

**UniSwap** is a dedicated second-hand school uniform exchange web application built specifically for parents at **Derby Grammar School**.

### The Problem
Previously, second-hand uniform exchange ran entirely in person. Parents needing uniform had to call reception on Tuesday morning, supply measurements and child details, and attend a single 30-minute window on Wednesday afternoon (3:30–4:00 PM) or wait for rare PTA sales events. Parents with outgrown uniform couldn't see who needed it, and parents needing uniform couldn't see what was available without attending in person.

### The Solution
UniSwap solves the discovery and matching bottleneck by letting parents list, browse, filter, and reserve uniform items online. Once reserved, buyer and seller message each other directly in-app to arrange payment and handover. UniSwap handles zero payments and zero delivery—parents arrange money and logistics directly.

---

## Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM 5
- **Authentication**: HTTP-only Cookie-based JWT sessions (`jose`, `bcryptjs`) with Middleware route protection
- **Styling**: Modern, mobile-first Vanilla CSS (`globals.css`) responsive down to 375px
- **Storage**: Local filesystem storage in `public/uploads/` for uniform item photos
- **Data Models**: `School`, `User`, `Listing`, `ListingImage`, `Reservation`, `MessageThread`, `Message`

---

## Implementation Summary & Features

### 1. Authentication & Route Protection
- Registration with full name, email, password automatically associated with Derby Grammar School.
- Password hashing with `bcryptjs`.
- Session creation stored in secure HTTP-only cookies (`uniswap_session`).
- Middleware (`middleware.ts`) enforcing authenticated access across all routes except `/`, `/login`, and `/register`.

### 2. Browse & Multi-Filter Engine (`/listings`)
- Real-time filtering by:
  - **Item Type** (Blazer, Jumper, Skirt, Trousers, Shirt, Tie, PE Kit, Shoes, Coat, Tracksuit, Other)
  - **Gender** (Boys, Girls, Unisex)
  - **Condition** (As New, Good, Fair)
  - **Listing Type** (For Sale vs Free Donation)
  - **Size** (free-text match)
  - **Price Range** (min / max in pounds)
- Combined with AND logic; filter choices sync directly with URL query parameters for sharing and bookmarking.

### 3. Listing Management (`/listings/new`, `/listings/[id]`, `/listings/[id]/edit`)
- Supports **For Sale** (asking price between £0.50 and £500) and **Free Donation** (price forced to 0).
- Multi-photo upload (1–5 photos) saved to `public/uploads/`.
- **Child Privacy Notice**: Mandatory notice on forms ensuring listings do not accept child names, House details, or photos containing children.

### 4. Reservation System & Lifecycle
- One-click reservation locks the item (`status = RESERVED`) and hides it from browse for all other parents.
- Automatically creates a private `MessageThread` between buyer and seller.
- **Seller Actions**: Edit, Remove, or Mark Completed (`status = COMPLETED`).
- **Buyer Actions**: Cancel Reservation (returns item to `ACTIVE` status in browse).

### 5. In-App Messaging (`/messages`, `/messages/[id]`)
- One thread per reservation.
- **Mandatory Payment & Handover Disclaimer**: Fixed notice banner at top of thread: *"Payment and delivery are arranged directly between the two parents, and UniSwap is not involved in either."*
- Chronological message history with instant read/send.
- Read-only state (`isClosed = true`) when reservation is cancelled or completed.

### 6. My Items Dashboard (`/my-items`)
- Split view into "My Listings" and "My Reservations" with direct management buttons.

### 7. Seed Script & Initial Data
- Seed script (`npx prisma db seed`) populating Derby Grammar School, 2 sample parents (`Sarah Jenkins` and `Mark Taylor`), and 8 sample uniform items with realistic photos.

---

## Verification & Build

- **Type Safety**: Passed `npx tsc --noEmit` and Prisma Client generation.
- **Build**: Successfully passed Next.js production build (`npm run build`).
- **HTTP Endpoints**: Verified 200 OK on public routes and 307 redirects on protected routes.
