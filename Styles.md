# styles.md — BillFlow Design System

**Product:** BillFlow — Receipt & Invoice Generator
**Version:** 2.0
**Author:** Rare Victor
**Stage:** HNG14 — Stage 7
**Date:** 23 May 2026

---

## 1. Design Philosophy

BillFlow sits at the intersection of **professional credibility and human warmth**. The people using it are one-person businesses who want to be taken seriously by their clients. The UI makes them feel like they run a proper operation — without feeling like enterprise software.

**Design reference:** Zoho Invoice — document-centric layout, receivables-first dashboard, contextual action buttons.

**Three words that drive every decision:** Precise. Warm. Grounded.

**What makes it distinctive:** The invoice creation form is a WYSIWYG document — you fill in your invoice as it looks, not a generic web form that produces a document elsewhere. The result feels intentional and trustworthy, not templated.

---

## 2. Color Palette

```css
:root {
  /* Brand — Electric Indigo */
  --color-primary:       #6D28D9;   /* CTAs, links, active states */
  --color-primary-light: #EDE9FE;   /* Hover backgrounds, selected rows, icon backgrounds */
  --color-primary-dark:  #5B21B6;   /* Pressed/active states */

  /* Neutrals */
  --color-ink:           ##EDE9FE;   /* Primary text — near black, not pure black */
  --color-ink-secondary: #5C6070;   /* Labels, metadata, secondary text */
  --color-ink-muted:     #9EA3B0;   /* Placeholders, disabled, tertiary */

  /* Surfaces */
  --color-surface:       #FFFFFF;   /* Cards, modals, document body */
  --color-bg:            #F5F6FA;   /* Page background — warm off-white */
  --color-border:      #E8E4F0;   /* Dividers, input borders, card borders */
  --color-border-strong: #CBD0DB;   /* Active input borders, focused states */

  /* Status — Invoice */
  --color-draft:         #9EA3B0;   /* Gray — neutral, not submitted */
  --color-sent:          #2563EB;   /* Blue — in motion, awaiting action */
  --color-paid:          #16A34A;   /* Green — completed, success */
  --color-overdue:       #DC2626;   /* Red — needs urgent attention */

  /* Status backgrounds */
  --color-success-bg:    #F0FDF4;
  --color-error-bg:      #FEF2F2;
  --color-warning-bg:   #EDE9FE;
  --color-info-bg:       #EFF6FF;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(15, 17, 23, 0.05);
  --shadow-sm: 0 1px 4px rgba(15, 17, 23, 0.08);
  --shadow-md: 0 4px 16px rgba(15, 17, 23, 0.08);
  --shadow-lg: 0 8px 32px rgba(15, 17, 23, 0.10);
}
```

### Color Usage Rules
- **Primary blue** is reserved for primary CTAs and active navigation only. Never use it decoratively.
- **Green (#16A34A)** is strictly for paid/success states and receipt UI. Never use for general success toasts.
- **Red (#DC2626)** is strictly for overdue/error states. Never use for general warnings.
- **Page background (#F5F6FA)** creates visual separation between the app chrome and white card content.

---

## 3. Typography

### Font Stack
```css
/* Display — Headings, logo, invoice "INVOICE" wordmark */
font-family: 'Outfit', sans-serif;
/* Geometric, modern, distinctive. Communicates authority without coldness. */

/* Body — All UI text, labels, descriptions */
font-family: 'Nunito Sans', sans-serif;
/* Warm, highly readable at small sizes. Feels approachable, not corporate. */

/* Monospace — Invoice numbers, amounts, financial figures */
font-family: 'IBM Plex Mono', monospace;
/* Tabular numbers align perfectly in tables. Adds a technical, precise quality to financial data. */
```

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale
| Token | Size | Line Height | Usage |
|---|---|---|---|
| `text-[10px]` | 10px | 1.4 | Table column headers (ALL CAPS + tracking) |
| `text-[11px]` | 11px | 1.4 | Form field labels (ALL CAPS + tracking) |
| `text-xs` | 12px | 1.5 | Table cell content, metadata, badges |
| `text-sm` | 14px | 1.5 | Body text, form inputs, button labels |
| `text-base` | 16px | 1.6 | Card headings |
| `text-lg` | 18px | 1.4 | Section titles |
| `text-xl` | 20px | 1.3 | Page headings |
| `text-2xl` | 24px | 1.2 | Stat numbers on dashboard |
| `text-3xl` | 30px | 1.1 | Invoice/Receipt wordmark on document |

### Font Weight Rules
- **400** — body text, descriptions, table cell content
- **500** — secondary navigation, metadata labels
- **600** — form field labels, section headings, button text
- **700** — page titles (Sora), stat numbers, invoice totals, logo

### Special Typography Patterns
```css
/* Table column headers */
font-size: 10px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.05em;
color: var(--color-ink-muted);

/* Form field labels */
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.08em;
color: var(--color-ink-secondary);

/* Invoice number / Receipt number */
font-family: 'DM Mono', monospace;
font-weight: 600;
letter-spacing: 0.02em;

/* Financial amounts */
font-family: 'DM Mono', monospace;
font-weight: 700;
```

---

## 4. Spacing System

8px base unit. All spacing is multiples of 4.

```
4px   — gap between icon and text inline
8px   — between label and input
12px  — tight internal card padding
16px  — standard card padding unit
20px  — card padding (compact cards)
24px  — card padding (standard), between form sections
32px  — page content padding (desktop)
40px  — between major page sections
48px  — document (invoice/receipt) internal padding
64px  — hero vertical rhythm
```

---

## 5. Border Radius

```css
--radius-sm:   4px     /* Status badges, mini pills */
--radius-md:   8px     /* Inputs, buttons, small cards */
--radius-lg:   12px    /* Standard cards, panels */
--radius-xl:   16px    /* Modals, large panels */
--radius-full: 9999px  /* Status badge pills */
```

---

## 6. Component Specifications

### Buttons

```
Primary (Blue):
  background: #6D28D9
  color: white
  height: 40px (h-10)
  padding: 0 16px (px-4)
  border-radius: 8px (rounded-lg)
  font: 14px / semibold / DM Sans
  hover: opacity 90%
  disabled: background #9EA3B0, cursor not-allowed

Secondary (Outlined):
  background: white
  border: 1px solid #E4E7EE
  color: ##EDE9FE
  Same dimensions as primary
  hover: background #F5F6FA

Ghost (Text):
  background: transparent
  color: #5C6070
  hover: color ##EDE9FE
  No border

Danger:
  background: #FEF2F2
  color: #DC2626
  border: 1px solid #FCA5A5
```

### Form Inputs

```
height: 36px (h-9) — tighter than standard, matches Zoho density
border: 1px solid #E4E7EE
border-radius: 8px
font-size: 14px
font-family: DM Sans
padding: 0 12px
background: white
color: ##EDE9FE
placeholder: #9EA3B0

focus:
  border-color: #6D28D9
  box-shadow: 0 0 0 2px rgba(27, 79, 255, 0.08)

Line item inputs (table cells):
  border: 1px solid transparent (invisible until hover/focus)
  hover: border-color #E4E7EE
  focus: border-color #6D28D9
  — This gives the spreadsheet-like feel
```

### Cards

```
background: white
border: 1px solid #E4E7EE
border-radius: 12px
padding: 24px
box-shadow: 0 1px 2px rgba(15, 17, 23, 0.05)
```

### Status Badges

```
border-radius: 9999px (pill)
padding: 4px 10px
font-size: 12px
font-weight: 600
text-transform: capitalize

Draft:   bg #F3F4F6  color #6B7280
Sent:    bg #EFF6FF  color #2563EB
Paid:    bg #F0FDF4  color #16A34A
Overdue: bg #FEF2F2  color #DC2626
```

### Sidebar Navigation

```
width: 224px (w-56)
background: white
border-right: 1px solid #E4E7EE
position: fixed

Nav items:
  height: 40px
  padding: 0 12px
  border-radius: 8px
  font-size: 14px / medium
  gap: 12px (icon + label)
  color (default): #5C6070
  color (hover): ##EDE9FE
  background (hover): #F5F6FA

Active state:
  background: #EDE9FE
  color: #6D28D9
  font-weight: 500

Logo area:
  padding: 20px 24px
  border-bottom: 1px solid #E4E7EE
```

---

## 7. Invoice & Receipt Document Layout

The invoice and receipt are rendered as visual documents — white cards on the gray page background that could be printed or PDF'd directly.

### Invoice Document Structure (top to bottom)
```
1. Top toolbar (sticky) — breadcrumb + action buttons
2. Document card (white, border, rounded-xl, shadow-sm)
   a. Header row — business info (left) + invoice meta (right)
      — Border bottom separates from body
   b. Bill To row — client info (left) + payment method + live summary (right)
      — Border bottom separates
   c. Line items table — full width, spreadsheet feel
      — Column headers: 10px uppercase gray
      — Rows: hover reveal borders on inputs
      — Delete button: appears on row hover only
   d. Notes + Totals row — notes (left) + subtotal/tax/discount/total (right)
   e. Bottom action bar — gray bg, Cancel + Save Draft + Save and Send
```

### Receipt Document Differences
```
- Green gradient header bar (2px, top of card)
- "RECEIPT" wordmark in green (#16A34A) instead of blue
- Table header row in green-50 background
- "Received From" instead of "Bill To"
- "Total Paid" instead of "Total" — green color
- "Payment Confirmed" stamp at bottom left
- Footer: green-50 background, green text
```

### PDF Export
- Captured via html2canvas (scale: 2 for retina quality)
- Converted to A4 via jsPDF
- Filename: `INV-001_ClientName.pdf` / `REC-001.pdf`
- Print layout excludes toolbar and action buttons (only the document card is captured via ref)

---

## 8. Dashboard Layout Patterns

### Receivables Strip
```
4 cards in a connected strip (gap-px bg-border)
Each card: white bg, 20px horizontal padding, 16px vertical
Icon: 40px box, rounded-lg, colored background + matching icon
Label: 12px / medium / ink-secondary
Value: 18px / bold / DM Mono / ink
Sub: 12px / ink-muted (e.g. "3 invoices")
```

### Revenue Bar Chart (custom, no library)
```
Container: h-16, flex items-end gap-1.5
Each bar: flex-1, rounded-t-sm
Active month: #6D28D9
Past months: #E4E7EE
Label: 9px, ink-muted
Max height: 52px (scales proportionally to max value)
Min height: 6px (if value > 0), 2px (if 0) — always visible
```

### Onboarding Checklist
```
Card: white, border #6D28D930 (primary at 19% opacity), rounded-xl
Header: Zap icon (primary-light bg) + title + dismiss button
Progress bar: h-1.5, bg #E4E7EE, filled #6D28D9, rounded-full
Steps: 4 items, each with circle indicator + label + description + arrow
  Complete: green circle with CheckCircle icon, label line-through, opacity 60%
  Incomplete: gray circle → primary-light on hover, arrow → primary on hover
  Clickable: navigates to relevant page
Dismissed: stored in localStorage ('bf_onboarding_dismissed')
```

---

## 9. Iconography

**Library:** Lucide React
**Stroke width:** 1.5px (Lucide default)

| Context | Size |
|---|---|
| Inline with text | 14–15px |
| Button icons | 14–16px |
| Navigation sidebar | 18px |
| Empty state | 36–40px |
| Card header icons | 17–18px |

**Key icon mapping:**
```
LayoutDashboard  → Dashboard nav
FileText         → Invoices nav + invoice items
Receipt          → Receipts nav
Users            → Clients nav
Settings         → Settings nav
LogOut           → Logout
Plus             → Create new, add item, add notes
Minus            → Collapse notes section (toggle with Plus)
Trash2           → Delete (appears on hover only)
Download         → PDF export
Send             → Send invoice
Save             → Save draft
CheckCircle      → Mark as paid, paid status, onboarding complete
Clock            → Overdue, awaiting payment
AlertCircle      → Overdue alert
ArrowLeft        → Back navigation in toolbar
ChevronRight     → "View all" links
ChevronDown      → Select/dropdown indicator
MoreHorizontal   → Overflow menu (···)
Printer          → Print
Eye / EyeOff     → Password show/hide toggle
Zap              → Onboarding checklist header
TrendingUp       → Total receivables stat
Building2        → Settings business profile section
Mail             → Client email
Phone            → Client phone
MapPin           → Client address
```

---

## 10. Motion & Transitions

```css
/* Standard UI transition */
transition: all 150ms ease;

/* Color/opacity transitions (nav hover, button hover) */
transition: color 150ms, background 150ms, opacity 150ms;

/* Border reveals (line item inputs) */
transition: border-color 150ms;

/* Progress bar fill (onboarding) */
transition: width 700ms ease;

/* Bar chart bars */
transition: height 500ms ease;

/* Spinner (loading states) */
animation: spin 1s linear infinite;
border: 2px solid currentColor;
border-top-color: transparent;
border-radius: 50%;
```

Keep all motion subtle and purposeful. No bouncing, no overshooting. Transitions under 200ms for UI feedback. Longer transitions (500–700ms) only for data visualisation reveals.

---

## 11. Empty States

Each empty state includes:
- Lucide icon at 36px, color `ink-muted`
- Short bold headline: "No invoices yet"
- Secondary line: "Create your first invoice to get started"
- Primary CTA button (only where creation is the next action)

Never show an empty table — replace with the empty state component instead.

---

## 12. Responsive Behaviour

```
Mobile (< 768px):
  - Sidebar collapses (not yet implemented in MVP — post-launch)
  - Invoice form: single column
  - Dashboard: stat cards stack 2x2
  - Tables: horizontal scroll

Desktop (>= 1024px):
  - Full sidebar visible (224px fixed)
  - Invoice form: two-column document layout
  - Dashboard: 4-column stat strip, 2/3 + 1/3 chart layout
```

---

## 13. Tailwind Config

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: '#6D28D9',
        light: '#EDE9FE',
        dark: '#5B21B6',
        foreground: "hsl(var(--primary-foreground))",
      },
      ink: {
        DEFAULT: '##EDE9FE',
        secondary: '#5C6070',
        muted: '#9EA3B0',
      },
      surface: '#FFFFFF',
      bg: '#F5F6FA',
    },
    fontFamily: {
      display: ['Sora', 'sans-serif'],
      body:    ['DM Sans', 'sans-serif'],
      mono:    ['DM Mono', 'monospace'],
    },
    borderRadius: {
      sm:  '4px',
      md:  '8px',
      lg:  '12px',
      xl:  '16px',
    },
  },
}
```

---

## 14. Writing Style (UI Copy)

- **Headings:** Title case. "New Invoice", "Invoice Details", "Bill To"
- **Labels:** ALL CAPS + letter-spacing. "INVOICE #", "BILL TO", "DUE DATE"
- **Empty states:** Conversational. "No invoices yet" not "No invoices found"
- **CTAs:** Action-first. "Create Invoice" not "Invoice Creation"
- **Error messages:** Friendly, never raw API errors. "Incorrect email or password" not "Invalid login credentials"
- **Success messages:** Specific. "You're in! We sent a confirmation link to your email." not "Success."
- **Loading states:** Simple. "Loading invoices..." not "Fetching data, please wait..."
- **Greeting:** Time-aware. "Good morning, [Business]" — feels personal without being creepy