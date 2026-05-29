# DistribuCore — Claude Code Build Prompt

Paste this entire prompt into Claude Code (VS Code) to begin the build.

---

## Project Overview

You are building **DistribuCore**, a full-stack distribution warehouse management system for a Food & Beverage company. The system has two parts:

- `distribution-dashboard` — internal management system (inventory, orders, analytics, clients)
- `distribution-web` — public-facing company website (informational, WhatsApp ordering)

Build both from scratch. The company distributes food and beverage products across B2B clients, wholesalers, and distributors.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python) |
| Database | Neon (PostgreSQL) — use `asyncpg` + `SQLAlchemy 2.0` async |
| ORM / Migrations | SQLAlchemy 2.0 + Alembic |
| Frontend | React 18 + Vite + TailwindCSS |
| Charts | Recharts |
| Barcode scanning | `@ericblade/quagga2` (camera) + USB HID keyboard input |
| Auth | JWT (python-jose) with bcrypt password hashing |
| PDF generation | ReportLab (Python) — build later, scaffold the route only |
| HTTP Client | Axios |
| State management | Zustand |
| Form handling | React Hook Form + Zod |

---

## Brand Identity

Apply consistently across both apps:

| Token | Value |
|---|---|
| Primary (Navy) | `#0D3B6E` |
| Accent (Mint Green) | `#4ECFA8` |
| Warning (Amber) | `#E8A838` |
| Background | `#F4F6FA` |
| Dark text | `#1A1A2E` |
| Logo mark | "DC" monogram on navy background with mint text |
| Font | Inter (Google Fonts) |

Use Navy for navbars, headers, and primary buttons. Mint green for success states, active badges, and chart accents. Amber strictly for warnings — low stock, expiry alerts, overdue payments.

---

## Project Structure

```
distribucore/
├── backend/
│   ├── main.py
│   ├── database.py               # Neon async connection
│   ├── config.py                 # env vars (DATABASE_URL, SECRET_KEY, etc.)
│   ├── models/
│   │   ├── product.py
│   │   ├── batch.py
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── client.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── payment.py
│   │   └── user.py
│   ├── schemas/                  # Pydantic v2 schemas
│   ├── routes/
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── batches.py
│   │   ├── suppliers.py
│   │   ├── clients.py
│   │   ├── orders.py
│   │   ├── payments.py
│   │   ├── analytics.py
│   │   └── export.py
│   ├── services/                 # business logic layer
│   └── requirements.txt
│
├── distribution-dashboard/       # React app — Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/                # Zustand stores
│   │   ├── hooks/
│   │   ├── api/                  # Axios API layer
│   │   └── utils/
│   └── package.json
│
└── distribution-web/             # React app — Vite
    ├── src/
    └── package.json
```

---

## Database Schema

Create all tables via SQLAlchemy models and generate Alembic migrations.

### users
```
id, username, email, hashed_password, role (investor | ceo | operations), created_at
```
Seed 3 users on first run: investor, ceo, operations — all with password `changeme123`.

### categories
```
id, name (Dairy | Juice | Beverage | Dried Goods | Confectionery), created_at
```
Seed all 5 categories on first run.

### suppliers
```
id, name, contact_name, phone, email, address, notes, created_at, is_active
```

### products
```
id, barcode (unique), name, category_id (FK), supplier_id (FK),
cost_price, selling_price, min_stock_threshold, created_at, is_active
```

### batches
```
id, product_id (FK), quantity, expiry_date, purchase_date,
cost_price_at_time, notes, created_at
```
Stock is tracked at the batch level. Total product stock = sum of all batch quantities.

### clients
```
id, name, type (b2b | wholesaler | distributor), phone, email,
address, notes, outstanding_balance (default 0), created_at, is_active
```

### orders
```
id, client_id (FK), order_date, status (pending | fulfilled | partial | credited),
total_amount, paid_amount, balance_due (computed), notes, created_at
```

### order_items
```
id, order_id (FK), product_id (FK), batch_id (FK), quantity,
unit_price, subtotal
```
When an order is fulfilled, deduct quantities from the linked batch.

### payments
```
id, order_id (FK), client_id (FK), amount, payment_date,
method (cash | bank_transfer | cheque), notes, created_at
```

---

## Backend API Routes

### Auth
- `POST /auth/login` — return JWT access token
- `GET /auth/me` — current user info

### Products
- `GET /products` — list all, filter by category/supplier, search by name/barcode
- `POST /products` — create product
- `GET /products/{id}` — product detail + all batches
- `PUT /products/{id}` — update
- `DELETE /products/{id}` — soft delete
- `GET /products/barcode/{barcode}` — lookup by barcode (used by scanner)

### Batches
- `POST /batches` — add new batch to a product
- `PUT /batches/{id}` — edit batch
- `DELETE /batches/{id}` — remove batch
- `GET /batches/expiring` — batches expiring within N days (default 30)
- `GET /batches/low-stock` — products where total qty < min_stock_threshold

### Suppliers
- Full CRUD — `GET, POST, PUT, DELETE /suppliers`
- `GET /suppliers/{id}/products` — products from this supplier

### Clients
- Full CRUD — `GET, POST, PUT, DELETE /clients`
- `GET /clients/{id}/orders` — order history
- `GET /clients/{id}/balance` — outstanding balance detail
- `GET /clients/credit` — all clients with outstanding balance > 0, aged (30/60/90+ days)

### Orders
- `GET /orders` — list, filter by status/client/date range
- `POST /orders` — create order with items array, deduct batch stock
- `GET /orders/{id}` — full order detail with items + payments
- `PUT /orders/{id}/status` — update status
- `POST /orders/{id}/payments` — record a payment, update client outstanding_balance

### Analytics
- `GET /analytics/sales-monthly?year=YYYY` — revenue per month
- `GET /analytics/top-products?limit=10&period=30d` — top selling items by qty and revenue
- `GET /analytics/category-breakdown?period=30d` — sales by category (for pie chart)
- `GET /analytics/profit-margins` — per product: cost, selling price, margin %
- `GET /analytics/credit-overview` — outstanding balances grouped by client + age buckets
- `GET /analytics/inventory-value` — total cost value vs total selling value of current stock
- `GET /analytics/expiry-risk` — stock expiring in 30/60/90 day buckets
- `GET /analytics/low-stock` — products below threshold with urgency score

### Export
- `GET /export/products` — download products as .xlsx
- `GET /export/orders` — download orders as .xlsx (date range filter)
- `GET /export/clients` — download clients + balances as .xlsx
- `POST /import/products` — upload .xlsx to bulk-import products

---

## Dashboard App — Pages & Modules

### 1. Authentication
- Login page with DistribuCore logo, email + password, JWT stored in Zustand + localStorage
- Protected routes — redirect to login if no token

### 2. Layout
- Left sidebar: logo, nav links (Dashboard, Inventory, Orders, Clients, Suppliers, Analytics, Settings)
- Top bar: current user name, alerts bell icon (shows count of low-stock + expiry warnings)
- Main content area with navy sidebar and white content panel

### 3. Dashboard (Home)
Metric cards at top:
- Total revenue this month (mint accent)
- Orders this month
- Outstanding credit balance (amber if > 0)
- Total active products

Below cards:
- Low stock alert list — products below threshold, amber badge, sorted by urgency
- Expiry warning list — batches expiring within 30 days, color-coded (red < 7 days, amber < 30)
- Quick action buttons: "+ Add Item", "+ New Order", "+ Record Payment"

### 4. Inventory Page
- Product table: name, barcode, category, supplier, total stock, cost price, selling price, status
- Search by name or barcode
- Filter by category (dropdown), supplier (dropdown)
- "+ Add Item" button opens a right-side drawer:
  - Barcode field: auto-receives USB scanner input (focused on open), OR activates camera scanner via toggle
  - Camera scanner uses QuaggaJS — shows camera feed with scanning overlay, auto-fills barcode on detect
  - Fields: name, category, supplier, cost price, selling price, min stock threshold
  - After saving product, immediately opens "Add Batch" modal: quantity, expiry date, purchase date
- Each row expandable to show all batches inline (qty, expiry date, purchase date)
- Import button — upload .xlsx to bulk-import
- Export button — download current filtered list as .xlsx

### 5. Orders Page
- Orders table: order #, client, date, status badge, total, paid, balance due
- Filter by status, client, date range
- "+ New Order" opens full-page order builder:
  - Step 1: select client (searchable dropdown)
  - Step 2: add items — scan barcode OR search by name, set quantity, shows unit price and subtotal
  - Step 3: review — order summary, total, record initial payment (optional)
  - Confirm → creates order, deducts stock from batches (FIFO by purchase date)
- Click order row → order detail page: items list, payment history, record payment button, status controls

### 6. Clients Page
- Client table: name, type badge, phone, email, outstanding balance (amber if > 0), total orders
- "+ Add Client" drawer: all client fields
- Click client → client profile page:
  - Header: name, type, contact info, total purchases, outstanding balance
  - Tabs: Order History | Credit & Payments
  - Credit tab shows all orders with outstanding balance, grouped by age (current / 30 / 60 / 90+ days)
  - Record payment button directly on profile

### 7. Suppliers Page
- Supplier table with name, contact, phone, email, product count
- Click supplier → supplier profile: contact info + linked products list

### 8. Analytics Page (Priority module — build thoroughly)

Layout: full-width cards in a 2-column grid. Each card is a chart with a title, date-range filter, and key stat.

**Card 1 — Monthly Sales Revenue**
- Recharts BarChart, revenue per month for selected year
- Year selector dropdown
- Mint green bars, navy axis labels

**Card 2 — Top Selling Items**
- Toggle between "by quantity" and "by revenue"
- Horizontal Recharts BarChart, top 10 products
- Date range filter (last 30 / 90 / 365 days)

**Card 3 — Category Breakdown**
- Recharts PieChart / Donut chart
- Each category a different color slice with label + percentage
- Date range filter

**Card 4 — Profit Margin per Product**
- Table: product name, cost price, selling price, margin ($), margin (%)
- Sortable columns
- Color-code margin % (green > 30%, amber 15–30%, red < 15%)
- Export as .xlsx button

**Card 5 — Credit & Outstanding Payments**
- Summary numbers: total outstanding, 30-day, 60-day, 90+ day buckets
- Recharts PieChart showing proportion per age bucket
- Table below: client name, amount owed, oldest invoice date, days overdue

**Card 6 — Inventory Value**
- Two big numbers: total cost value vs total selling value of all current stock
- Recharts BarChart showing value by category (cost vs selling price side by side)

**Card 7 — Expiry Risk Dashboard**
- Three columns: expiring in < 30 days / 31–60 days / 61–90 days
- Each column lists product name, batch qty, expiry date
- Color: red / amber / yellow per column

**Card 8 — Low Stock Alerts**
- Table: product name, category, current stock, min threshold, shortage (units below threshold)
- Sorted by shortage descending
- Direct "Add Batch" button per row to quickly restock

### 9. Settings Page
- User accounts: list of 3 users, change password
- Category management: add / rename categories
- Min stock threshold: edit threshold per product (bulk table edit)
- Import / Export: full database export to Excel, import template download

---

## Public Website — `distribution-web`

Single-page React app with smooth scroll sections:

### Sections
1. **Hero** — full-width banner, company name, tagline ("Your trusted F&B distribution partner"), WhatsApp CTA button
2. **About** — who we are, company overview, 3-partner structure (kept general, no names)
3. **What We Distribute** — 5 category cards: Dairy, Juice, Beverage, Dried Goods, Confectionery — each with an icon and short description
4. **Why Choose Us** — 3–4 feature highlights (reliability, fresh stock, fast delivery, wide network)
5. **Contact** — WhatsApp button (opens `https://wa.me/{number}` — use placeholder), email, location
6. **Footer** — logo, tagline, social media icons: Facebook, Instagram, TikTok (placeholder links)

### Design
- Use the same brand colors: navy header/footer, mint accent, amber for CTAs
- Clean, professional, mobile-responsive
- No login, no cart, purely informational

---

## Environment Variables

Create a `.env` file at `backend/.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Create `distribution-dashboard/.env`:
```
VITE_API_URL=http://localhost:8000
```

Create `distribution-web/.env`:
```
VITE_WHATSAPP_NUMBER=96170000000
VITE_FACEBOOK_URL=https://facebook.com/distribucore
VITE_INSTAGRAM_URL=https://instagram.com/distribucore
VITE_TIKTOK_URL=https://tiktok.com/@distribucore
```

---

## Build Order

Follow this sequence:

1. Set up `backend/` — FastAPI app, Neon database connection, all SQLAlchemy models, Alembic migration, seed script
2. Implement all API routes with full CRUD and business logic
3. Set up `distribution-dashboard/` — Vite + React + Tailwind, routing, auth, layout
4. Build Dashboard home page, then Inventory, Orders, Clients, Suppliers in order
5. Build Analytics page — this is the most important module, spend the most effort here
6. Build Settings page
7. Set up `distribution-web/` — Vite + React + Tailwind, all sections, mobile responsive
8. Final: add export/import Excel functionality using `openpyxl` (backend) and `xlsx` npm package (frontend)

---

## Important Notes

- All monetary values stored as integers in cents to avoid float precision issues. Display formatted as currency in the UI.
- Batch stock deduction on order fulfilment uses FIFO — oldest purchase_date batches deducted first.
- The barcode field in the "Add Item" drawer must auto-focus on open so a USB scanner can immediately input the code without the user clicking.
- Low stock threshold check: after every order fulfilment, re-evaluate affected products and surface alerts.
- Expiry check: run on dashboard load, flag any batch where `expiry_date <= today + 30 days`.
- All tables must be paginated (default 20 rows per page).
- Use React Router v6 for routing in both apps.
- Use TailwindCSS utility classes only — no custom CSS files except for the global font import.
- Add CORS middleware to FastAPI allowing `http://localhost:5173` and `http://localhost:5174`.

---

## Out of Scope (Do Not Build Yet)

- Invoice PDF generation (route scaffold only — `POST /orders/{id}/invoice` returns 501 Not Implemented)
- Sales vs Target module
- Role-based access control
- WhatsApp API integration
- Mobile app

---

Begin with step 1: scaffold the backend, create all models, run the first Alembic migration, and confirm the database connection to Neon is working before moving to the API routes.
