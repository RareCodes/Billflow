# PRD.md — Billit: Receipt & Invoice Generator

**Version:** 1.0
**Author:** Rare Victor
**Stage:** HNG14 — Stage 7 
**Date:** 23rd May 2026
**Status:** Built & Deployed

---

## 1. Overview

Billit is a modern billing web application built for freelancers, creators, small businesses, and vendors in Africa and beyond. It helps users generate professional invoices and receipts from a single workspace — fast, clean, and without requiring accounting knowledge.

The product solves a real, daily pain point: most small business owners in Nigeria still create invoices manually in Word or WhatsApp chat. Billit gives them a professional, trustworthy tool that feels built for them and adapted for the Nigerian market.

### Experience Goals
The product experience is designed to feel:
- **Professional** — clean document-style invoices and receipts that clients take seriously
- **Fast** — invoice creation in under 2 minutes from signup
- **Trustworthy** — financial data is private, persistent, and protected per user
- **Easy for non-technical users** — guided onboarding, contextual action buttons, no jargon

---

## 2. Problem Statement

Freelancers and small vendors across Africa:
- Lack access to professional billing tools that reflect their reality (naira, mobile-first, simple UX)
- Lose track of who has paid and who hasn't
- Can't easily convert a paid invoice into a receipt
- Struggle to maintain invoice numbering continuity and financial records
- Use overly complex tools (QuickBooks, Wave) built for larger businesses
- Have no onboarding guidance when trying new billing tools

---

## 3. Target Users

| User Type | Profile |
|---|---|
| Freelancer | Designer, developer, writer. Bills 5–20 clients/month |
| Creator | Content creator, photographer. Needs quick invoice on the go |
| Small Business | Fashion brand, food vendor. Wants to look professional |
| Agency | Small team billing multiple clients |

**Primary Persona:** Solo freelancer, 22–35, Nigerian, uses phone heavily, wants to look professional but needs speed above all.

---

## 4. Goals & Success Metrics

**Goals:**
- User can create a complete invoice in under 2 minutes from signup
- Invoice and receipt PDFs are downloadable directly from the browser
- Financial records persist across sessions (Supabase)
- New users are guided through setup with an onboarding checklist
- Dashboard gives a clear picture of business health at a glance

**Success Metrics:**
- Time-to-first-invoice < 2 minutes from signup
- PDF download works on all major browsers
- Zero data loss across sessions
- Onboarding checklist completion drives first invoice creation
- Lighthouse mobile score > 80

---

## 5. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev experience, modern |
| Styling | Tailwind CSS v3 + shadcn/ui (Base/Luma) | Utility-first, consistent components |
| Backend/DB | Supabase | Auth + PostgreSQL + RLS, zero backend code |
| PDF Export | jsPDF + html2canvas | Client-side, no server needed |
| Routing | React Router v6 | Industry standard |
| Deployment | Vercel | Zero-config, instant deploys |

---

## 6. Information Architecture

```
/auth                → Login + Signup (tabbed, with password strength meter)
/dashboard           → Overview — onboarding checklist, stats, chart, recent invoices
/invoices            → Invoice list with search + status filter tabs
/invoices/new        → Invoice creation — document-style WYSIWYG form
/invoices/:id        → Invoice detail + status actions + PDF download
/receipts            → Receipts list table
/receipts/:id        → Receipt detail view + PDF download
/clients             → Saved client profiles (card grid)
/settings            → Business profile + invoice defaults
```

---

## 7. Core Functionality Coverage

This section maps every required and suggested feature from the project brief to its implementation in Billit.

### 7.1 Required Core Functions

| Requirement | Status | Implementation |
|---|---|---|
| Create invoices quickly | ✅ Built | Document-style WYSIWYG form — under 2 minutes |
| Track payment status | ✅ Built | 4 statuses: Draft → Sent → Paid → Overdue |
| Convert paid invoices into receipts | ✅ Built | Auto-generated on "Mark as Paid" |
| Manage reusable client/business info | ✅ Built | Clients page + Settings business profile |
| Maintain organized financial records | ✅ Built | Supabase persistence, invoice list, receipt list |
| Generate downloadable invoices | ✅ Built | jsPDF + html2canvas, A4 PDF export |
| Generate downloadable receipts | ✅ Built | Separate receipt detail page with PDF export |
| Save reusable business information | ✅ Built | Settings page — business name, email, address, phone |
| Save reusable client information | ✅ Built | Clients page — name, email, phone, address |
| Maintain invoice numbering continuity | ✅ Built | Auto-incremented INV-001, INV-002... sequence |
| Authentication | ✅ Built | Supabase Auth — email + password, protected routes |

### 7.2 User Inputs Supported

| Input | Status | Location |
|---|---|---|
| Business name | ✅ | Settings page |
| Business logo | ✅ Post-MVP | Business initials avatar used as placeholder |
| Business details (email, phone, address) | ✅ | Settings page |
| Client information | ✅ | Bill To section + Clients page |
| Invoice items/services | ✅ | Line items table — description field |
| Quantities | ✅ | Line items table — Qty column |
| Pricing | ✅ | Line items table — Rate column |
| Due dates | ✅ | Invoice form — auto-calculated from payment terms |
| Payment methods | ✅ | Invoice form — Bank Transfer, Cash, POS, PayPal, Stripe, Other |
| Notes/terms | ✅ | Collapsible Notes & Terms section — Customer Notes + Terms & Conditions fields |

### 7.3 Suggested Features

| Feature | Status | Implementation |
|---|---|---|
| Invoice status tracking | ✅ Built | Draft / Sent / Paid / Overdue with color-coded badges |
| Currency support | ✅ Built | NGN, USD, GBP, EUR, CAD — per invoice |
| Tax/VAT calculation | ✅ Built | Inline tax % field, auto-calculates tax amount |
| Automatic totals | ✅ Built | Live calculation: subtotal + tax − discount = total |
| PDF export | ✅ Built | Invoice and Receipt — jsPDF + html2canvas, A4 |
| Email invoice sharing | ✅ Post-MVP | Architecture ready (Resend API planned); not in MVP |
| Dashboard analytics | ✅ Built | Receivables strip, monthly revenue bar chart, overdue alert |
| Recurring invoices | ✅ Post-MVP | Planned for v2 |
| Search/filtering | ✅ Built | Invoice list — search by client/number + filter by status |
| Mobile responsiveness | ✅ Built | Responsive grid layouts, mobile-friendly forms |
| Invoice templates/themes | ✅ Post-MVP | Single clean template in MVP; multi-theme in v2 |

---

## 8. UX Direction

### 8.1 Design Reference
The invoice creation and dashboard UX is modelled after **Zoho Invoice** — the industry standard for small business billing. Key patterns borrowed:

- **Document-style invoice form** — the form looks like the actual invoice being created (WYSIWYG). No separate preview panel.
- **Receivables summary strip** on dashboard — Total Receivables, Overdue, Awaiting Payment, Paid This Month
- **Contextual action buttons** — button labels and colours change based on invoice status (Mark as Sent → Mark as Paid → View Receipt)
- **Toolbar navigation** on full-page forms — breadcrumb back navigation + primary actions in top bar

### 8.2 First-Time User Experience
New users land on a dashboard with:
1. **Onboarding checklist** — 4 steps (Create account, Setup profile, Add client, Create invoice) with a progress bar. Each step links directly to the relevant page. Dismissable permanently via localStorage.
2. **Empty state hero** — clear illustration, headline, and single CTA rather than empty tables
3. **Quick action cards** — labelled cards explaining what each section of the app does

### 8.3 Active User Dashboard
- Time-based greeting ("Good morning/afternoon/evening, [Business Name]")
- Receivables summary strip (4 stat cards in a connected strip)
- Revenue bar chart — last 6 months of paid invoices (pure CSS, no external library)
- Overdue alert banner — red, links directly to invoice list
- Quick actions panel — persistent sidebar of common tasks
- Recent invoices table — last 8 invoices with status badges

---

## 9. Feature Specifications

### 9.1 Authentication
- Email + password signup/login via Supabase Auth
- Password strength meter with 4 rules (length, uppercase, number, special char)
- Show/hide password toggle with Eye/EyeOff icons
- Friendly error messages (no raw Supabase errors shown to users)
- Session persistence across browser sessions
- Protected routes — all financial data is private per user
- Row Level Security on all Supabase tables

### 9.2 Business Profile (Settings)
- Business name, email, phone, address
- Default currency (NGN, USD, GBP, EUR, CAD)
- Default tax rate — pre-fills on every new invoice
- Default payment notes/terms — pre-fills on every new invoice
- Live avatar preview (first letter of business name)
- Business info appears on all invoice and receipt documents

### 9.3 Client Management
- Add reusable client profiles (name, email, phone, address)
- Card grid layout with avatar initials
- Delete on hover (trash icon appears on card hover)
- Clients available as dropdown in invoice creation form
- Selecting a client auto-fills all Bill To fields
- Empty state with CTA to add first client

### 9.4 Invoice Creation (WYSIWYG Document Form)
**Top toolbar:**
- Breadcrumb back navigation (← Invoices)
- Save as Draft button
- Save and Send button

**Invoice header section:**
- Business info displayed left (from Settings profile)
- Invoice # right — auto-generated (INV-001, INV-002...)
- Invoice date — defaults to today
- Currency selector (NGN, USD, GBP, EUR, CAD)
- Payment terms — Net 7 / Net 15 / Net 30 / Net 45 / Net 60 / Due on Receipt / Custom
- Due date — auto-calculated from payment terms, manually overridable

**Bill To section:**
- Left column: saved client dropdown + manual entry fields (name, email, phone, address)
- Right column: payment method selector + live invoice summary card
- Live summary card shows: invoice #, customer name, item count, due date, payment method, running total

**Line items table:**
- Spreadsheet-style layout
- Columns: Description / Qty / Rate / Amount
- Hover-to-reveal borders on inputs (clean until interaction)
- Delete button appears on row hover only (Trash2 icon)
- "Add Line Item" button below table
- Amount column auto-calculates per row (qty × rate)

**Notes & Terms section:**
- Collapsible — Plus icon to open, Minus icon to close
- Customer Notes textarea
- Terms & Conditions textarea

**Totals section:**
- Subtotal (sum of all line item amounts)
- Tax % — inline editable input field, auto-calculates tax amount
- Discount — inline editable flat amount field
- Total = subtotal + tax − discount (live calculation)

**Bottom action bar:**
- Cancel / Save as Draft / Save and Send

### 9.5 Invoice Status Tracking
Statuses: `Draft → Sent → Paid → Overdue`

| Status | Badge Color | Available Actions |
|---|---|---|
| Draft | Gray | Mark as Sent |
| Sent | Blue | Mark as Paid, Mark as Overdue (in ··· menu) |
| Paid | Green | View Receipt |
| Overdue | Red | Mark as Paid |

- Status updates saved to Supabase instantly
- Overdue banner on dashboard for any overdue invoices
- Color-coded badges throughout invoice list and detail views

### 9.6 Invoice Detail View
- Full document view matching the creation form visual language
- Paid banner with receipt link when status is paid
- Overdue banner with due date when status is overdue
- Contextual primary action button (changes per status)
- PDF download — jsPDF + html2canvas, A4, filename: `INV-001_ClientName.pdf`
- Print button (window.print)
- Overflow menu (···): Mark as Overdue, Print, Delete invoice
- Delete with confirmation dialog

### 9.7 Receipt Generation & Management
- Auto-generated the moment an invoice is marked as paid
- Separate receipt number sequence: REC-001, REC-002...
- Invoice snapshot saved to `receipts` table (immutable — changes to invoice don't affect receipt)
- Receipts list page — table with receipt number, invoice ref, customer, date paid, amount, download button
- Receipt detail page — full document view
- Green-themed receipt document (distinct from blue invoice theme)
- Green gradient header bar
- "Received From" section (vs "Bill To" on invoice)
- "Total Paid" label in green
- "Payment Confirmed" stamp at bottom
- PDF download + Print

### 9.8 Currency Support
- Supported: NGN (₦), USD ($), GBP (£), EUR (€), CAD (CA$)
- Set per invoice at time of creation
- Default currency set in Settings, pre-fills on new invoices
- Currency symbol used throughout document, totals, and PDF export

### 9.9 Tax / VAT Calculation
- Tax rate field on invoice creation form (inline in totals section)
- Default tax rate can be set in Settings (pre-fills on new invoices)
- Tax amount auto-calculated: `subtotal × (tax_rate / 100)`
- Displayed as separate line in totals section
- Shown on invoice document and PDF

### 9.10 Automatic Totals
Live calculation on every keystroke:
```
Subtotal  = sum(quantity × unit_price) for all line items
Tax       = subtotal × (tax_rate / 100)
Discount  = flat amount entered
Total     = subtotal + tax − discount
```
Totals update in real time as user types — no save needed to see calculations.

### 9.11 PDF Export
- **Invoice PDF:** Captures the invoice document div via html2canvas (scale: 2 for retina), converts to A4 jsPDF. Filename: `INV-001_ClientName.pdf`
- **Receipt PDF:** Same mechanism. Filename: `REC-001.pdf`
- Clean output — toolbar, action buttons excluded from capture via React ref
- Works entirely client-side, no server required

### 9.12 Dashboard Analytics
**New user state:**
- Onboarding checklist with 4 steps and progress bar
- Quick action cards (4 cards explaining app sections)

**Active user state:**
- **Total Receivables** — sum of all Sent + Overdue invoice totals
- **Overdue** — sum + count of overdue invoices
- **Awaiting Payment** — sum + count of sent invoices
- **Paid This Month** — sum + count of invoices paid in current calendar month
- **Revenue bar chart** — 6-month view of paid invoice totals, current month highlighted in primary blue
- **Overdue alert banner** — appears at top of dashboard when any overdue invoices exist

### 9.13 Search & Filtering
Invoice list page:
- **Search bar** — searches by client name or invoice number (case-insensitive)
- **Status filter tabs** — All / Draft / Sent / Paid / Overdue
- Filters combine (search + status filter active simultaneously)
- Empty state per filter combination

### 9.14 Mobile Responsiveness
- Responsive grid layouts using Tailwind breakpoints (sm, lg)
- Dashboard stat cards: 2×2 on mobile, 4×1 on desktop
- Invoice form: single column on mobile, two-column document layout on desktop
- Tables: horizontal scroll on small screens
- All interactive elements are touch-friendly (minimum 40px tap targets)

---

## 10. Database Schema

### `profiles` (extends auth.users)
```sql
id uuid references auth.users on delete cascade
business_name text
business_email text
business_phone text
business_address text
logo_url text
default_currency text default 'NGN'
default_tax_rate numeric default 0
default_notes text
created_at timestamp default now()
primary key (id)
```

### `clients`
```sql
id uuid default gen_random_uuid() primary key
user_id uuid references profiles(id) on delete cascade
name text not null
email text
phone text
address text
created_at timestamp default now()
```

### `invoices`
```sql
id uuid default gen_random_uuid() primary key
user_id uuid references profiles(id) on delete cascade
invoice_number text not null              -- INV-001, INV-002...
client_id uuid references clients(id) on delete set null
client_snapshot jsonb                     -- frozen copy of client at creation time
status text default 'draft'              -- draft | sent | paid | overdue
currency text default 'NGN'
items jsonb default '[]'                 -- [{description, quantity, unit_price, total}]
subtotal numeric default 0
tax_rate numeric default 0
tax_amount numeric default 0
discount numeric default 0
total numeric default 0
due_date date
payment_method text
notes text
issued_date date default current_date
created_at timestamp default now()
updated_at timestamp default now()
```

### `receipts`
```sql
id uuid default gen_random_uuid() primary key
user_id uuid references profiles(id) on delete cascade
receipt_number text not null             -- REC-001, REC-002...
invoice_id uuid references invoices(id) on delete set null
invoice_snapshot jsonb                   -- frozen copy of invoice at payment time
paid_at timestamp default now()
created_at timestamp default now()
```

### Row Level Security
All four tables have RLS enabled. Each user can only read/write their own rows via `auth.uid()` policies.

### Auto-profile Trigger
A PostgreSQL trigger (`handle_new_user`) automatically inserts a row into `profiles` when a new user signs up via Supabase Auth, ensuring every user always has a profile.

---

## 11. User Flows

### Flow 1: First-Time User Onboarding
1. Land on `/auth` → Sign up with email + password (strength meter guides password creation)
2. Redirect to `/dashboard` → Onboarding checklist appears (4 steps, progress bar at 25%)
3. Click "Set up your business profile" → `/settings` → fill business details → Save Changes
4. Progress bar updates to 50%. Click "Add your first client" → `/clients` → Add Client form → Save
5. Progress bar updates to 75%. Click "Create your first invoice" → `/invoices/new`
6. Fill invoice → Save and Send → redirected to invoice detail
7. All 4 steps complete → "You're all set!" banner → user dismisses checklist permanently

### Flow 2: Create & Send Invoice
1. Click "+ New Invoice" from dashboard or invoices page
2. Invoice date defaults to today; due date auto-calculates from Net 30 terms
3. Select saved client from dropdown → Bill To fields auto-fill
4. Add line items — amounts calculate live in the table + summary card updates
5. Optionally expand Notes & Terms section (Plus icon → Minus when open)
6. Review live summary card (right column) showing total
7. Click "Save and Send" → status becomes Sent → redirect to invoice detail page

### Flow 3: Mark Paid → Receipt Auto-Generated
1. Open a Sent invoice
2. Click green "Mark as Paid" button in toolbar
3. System creates receipt automatically with frozen invoice snapshot
4. Invoice status updates to Paid
5. Green "This invoice has been paid" banner appears with "View Receipt →" link
6. Click link → Receipt detail page opens
7. Download receipt as PDF

### Flow 4: Track Overdue Invoices
1. Dashboard shows red overdue alert banner at top
2. Click "Review →" → `/invoices` page with overdue invoices visible
3. Or: from any Sent invoice detail → `···` menu → "Mark as Overdue"
4. Overdue invoices highlighted with red badge throughout app

### Flow 5: Download PDF
1. Open any invoice or receipt detail page
2. Click "Download PDF" button in toolbar
3. html2canvas captures the document div at 2× scale
4. jsPDF converts to A4 and triggers browser download
5. File saved as `INV-001_ClientName.pdf` or `REC-001.pdf`

---

## 12. Post-MVP Roadmap

| Feature | Priority | Notes |
|---|---|---|
| Email invoice sharing | High | Resend API integration — send invoice PDF to client email |
| Business logo upload | High | Supabase Storage — replace initials avatar with real logo |
| Recurring invoices | Medium | Schedule auto-creation on weekly/monthly/custom intervals |
| Invoice templates/themes | Medium | Multiple PDF layouts (minimal, branded, detailed) |
| Payment gateway | Medium | Paystack integration for Nigerian market |
| Mobile app | Low | React Native — same Supabase backend |
| Multi-user/team accounts | Low | Roles: Owner, Accountant, View-only |
| Expense tracking | Low | Complement invoicing with expense recording |

---

## 13. Deliverables

| Deliverable | Status |
|---|---|
| Live Vercel link | ✅ |
| GitHub repository | ✅ |
| PRD.md (this file) | ✅ |
| styles.md | ✅ |
| Demo credentials: `demo@Billit.app` / `Demo@2026!` | ✅ |
| Social media post | ✅ |