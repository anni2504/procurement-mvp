# Procurement Workflow System — MVP

A single-page web application that simulates the complete procurement lifecycle, from initial requisition through to payment. Built as a proof-of-concept to validate the core workflow logic including **automated 3-way matching** and **dispute resolution**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173/`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| UI Components | shadcn/ui (Button, Card, Input, Badge, etc.) |
| Styling | Tailwind CSS 3.4 |
| State Management | React Context + localStorage persistence |
| Icons | Lucide React |

---

## 📋 Workflow Overview

The application guides a procurement transaction through **10 sequential steps**:

| Step | Name | Description |
|---|---|---|
| 1 | **Procurement Request** | User specifies item, quantity, price, and justification |
| 2 | **Manager Approval** | Manager reviews and approves/rejects the request |
| 3 | **RFP & Vendor Selection** | Add vendor quotes, evaluate, and select a vendor |
| 4 | **Purchase Order** | Auto-generated PO from request + vendor (locked once issued) |
| 5 | **Goods Receipt (GRN)** | Record actual quantity received from vendor |
| 6 | **Invoice Submission** | Vendor submits invoice with billed quantity and amount |
| 7 | **3-Way Match** | Automated comparison of PO qty vs GRN qty vs Invoice qty |
| 8 | **Dispute Resolution** | Resolve mismatches by responsible party |
| 9 | **Finance Approval** | Finance reviews matched invoice and authorizes payment |
| 10 | **Payment** | Payment processed and transaction closed |

---

## 🔍 3-Way Matching Logic

The core value proposition — automated validation that what was **ordered**, **received**, and **billed** all match.

### How It Works

The system compares three quantities from three separate documents:

- **PO Quantity** — what was officially ordered (or amended PO quantity)
- **GRN Quantity** — what was physically received by the warehouse
- **Invoice Quantity** — what the vendor claims to have supplied

### Match Scenarios

| PO Qty | GRN Qty | Invoice Qty | Result |
|---|---|---|---|
| 10 | 10 | 10 | ✓ **MATCHED** → Finance Approval |
| 10 | 8 | 10 | ✗ **MISMATCH** → Dispute Resolution |
| 10 | 10 | 8 | ✗ **MISMATCH** → Dispute Resolution |

---

## ⚖️ Dispute Resolution

When a mismatch is detected, the user identifies who is responsible:

| Responsible Party | Root Cause | Corrective Action |
|---|---|---|
| **Vendor** | Wrong invoice issued | Vendor corrects invoice qty/amount |
| **Procurement** | PO had incorrect qty | Raise **PO Amendment** (separate document) |
| **Warehouse** | GRN count error | Correct received quantity |

### PO Amendment
The original PO is **never directly editable** after issuance. When Procurement needs to correct a quantity, a **PO Amendment** is raised — a separate tracked document that references the original PO and records the change with a reason. This preserves a complete audit trail.

After correction, the 3-way match re-runs automatically. The loop continues until all three values align.

---

## 💾 State Persistence

Workflow state is automatically saved to `localStorage`. You can:
- **Refresh the page** mid-workflow without losing progress
- **Reset** the entire workflow using the Reset button in the top bar

---

## 🎨 UI Features

- **Sidebar navigation** — all 10 steps visible and clickable
- **Step locking** — future steps show informational empty states
- **Completed views** — finished steps show read-only summary cards
- **Toast notifications** — feedback on every action
- **Smooth animations** — fade-in, slide-in transitions
- **Responsive layout** — sidebar + main content area
- **glassmorphism header** with gradient progress bar

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Main layout with sidebar + step routing
├── main.tsx                   # React entry point
├── index.css                  # Design system + animations
├── context/
│   ├── ProcurementContext.tsx  # Global state + all actions + localStorage
│   └── ToastContext.tsx        # Toast notification system
├── components/
│   ├── Step1Request.tsx        # Procurement request form
│   ├── Step2Approval.tsx       # Manager approval
│   ├── Step3RFP.tsx            # RFP & vendor selection
│   ├── Step4PO.tsx             # Purchase order (auto-generated)
│   ├── Step5GRN.tsx            # Goods receipt note
│   ├── Step6Invoice.tsx        # Invoice submission
│   ├── Step7Match.tsx          # 3-way match result
│   ├── Step8Dispute.tsx        # Dispute resolution
│   ├── Step9Finance.tsx        # Finance approval
│   ├── Step10Payment.tsx       # Payment & close
│   └── ui/                    # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       └── textarea.tsx
└── lib/
    └── utils.ts               # Tailwind merge utility
```

---

## 🧪 Testing Scenarios

### Happy Path
1. Create request (10 units) → Approve → Add vendor → Select → PO generated
2. GRN: receive 10 units → Invoice: bill 10 units → **Match passes** ✓
3. Finance approves → Payment processed

### Mismatch Path
1. Same setup, but GRN: receive **8 units** → Invoice: bill 10 units
2. **Match fails** → Dispute Resolution activated
3. Select "Warehouse" → Correct GRN to 10 → Re-run match → **Match passes** ✓
4. Finance approves → Payment processed

### PO Amendment Path
1. Mismatch detected → Select "Procurement" as responsible
2. Raise PO Amendment with new quantity and reason
3. Re-run match with amended PO quantity → Continue workflow

---

## 📌 Out of Scope (Phase 2)

- User authentication & login
- Role-based access control
- Email/in-app notifications
- Vendor portal
- Reporting & analytics
- Multi-currency support
- ERP integration
