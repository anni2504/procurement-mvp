# Product Requirements Document (PRD): Procurement Workflow MVP

## 1. Executive Summary

The Procurement & Accounts Payable Workflow System MVP is a role-based procurement workflow platform designed to automate and manage the complete purchasing lifecycle within an organization. The application ensures that every purchase request moves through standardized approval, procurement, warehouse verification, invoice validation, financial authorization, and payment processing before completion.

The system provides complete workflow visibility, role-based access control, real-time collaboration, and automated verification through a structured ten-step procurement process. Each stage can only be performed by authorized users, ensuring compliance, accountability, and complete auditability.

---

# 2. User Roles & Permissions

The application supports seven predefined user roles. Each role has dedicated permissions and access only to the workflow stages relevant to their responsibilities.

### Requester (Alice)

The requester initiates procurement requests by creating purchase requisitions containing required items, quantities, pricing estimates, categories, and business justifications. After submission, the requester cannot modify the requisition unless it is rejected during manager approval.

Accessible Pages:

- Dashboard
- Purchase Requisitions

---

### Manager (Bob)

Managers review submitted purchase requisitions and determine whether they should proceed through the procurement process. Managers can either approve a request or reject it with comments for revision.

Accessible Pages:

- Dashboard
- Approval Queue

---

### Procurement Officer (Charlie)

The procurement officer manages supplier communication, creates Requests for Proposal (RFPs), reviews vendor quotations, selects winning vendors, generates purchase orders, performs three-way matching, and resolves procurement-related disputes.

Accessible Pages:

- Dashboard
- Vendor RFPs
- Purchase Orders
- Three-Way Matching
- Vendor Management
- Dispute Resolution

---

### Warehouse Officer (Dave)

Warehouse personnel inspect delivered goods, record received quantities, verify shipment conditions, create Goods Receipt Notes (GRNs), and participate in dispute resolution when delivery discrepancies occur.

Accessible Pages:

- Dashboard
- Goods Receipt Notes
- Dispute Resolution

---

### Vendor (Victor)

External vendors receive RFP invitations, submit quotations, upload invoices, and participate in resolving procurement disputes related to pricing or invoicing.

Accessible Pages:

- Dashboard
- Invoices
- Disputes

---

### Finance Officer (Frank)

Finance verifies successful three-way matching, authorizes payments, records transaction references, and closes completed procurement workflows.

Accessible Pages:

- Dashboard
- Matching Review
- Finance Authorization
- Payments

---

### Administrator

Administrators possess unrestricted access across the application, including user management, workflow monitoring, vendor management, and every procurement stage.

Accessible Pages:

- All System Modules

---

# 3. Procurement Workflow

The procurement lifecycle consists of ten sequential workflow stages. Every stage requires completion before progressing to the next, unless redirected because of rejection or matching discrepancies.

---

## Step 1 – Purchase Requisition

**Responsible Role:** Requester

The requester creates a new procurement request by entering:

- Item name
- Category
- Quantity
- Estimated unit price
- Business justification

Once submitted, the requisition becomes locked and enters the approval queue.

Workflow Status:

Pending Manager Approval

---

## Step 2 – Manager Approval

**Responsible Role:** Manager

Managers review procurement requests and may:

- Approve the requisition
- Reject the requisition

Approval forwards the workflow to procurement.

Rejection returns the requisition to the requester for modification.

---

## Step 3 – Request for Proposal (RFP)

**Responsible Roles:** Procurement Officer and Vendor

The procurement officer creates an RFP and invites vendors to submit quotations.

Each vendor submits:

- Unit pricing
- Total quotation
- Delivery estimates
- Additional remarks

After all quotations are received, procurement selects the preferred vendor.

---

## Step 4 – Purchase Order Generation

**Responsible Role:** Procurement Officer

The system automatically generates an official Purchase Order using the selected vendor quotation.

The purchase order contains:

- Unique PO Number
- Vendor Information
- Ordered Items
- Quantities
- Pricing
- Approval Metadata

The PO becomes the official purchasing document.

---

## Step 5 – Goods Receipt Note (GRN)

**Responsible Role:** Warehouse Officer

When goods arrive, warehouse staff inspect the shipment.

Inspection includes:

- Received quantity
- Damaged items
- Delivery condition
- Remarks

A Goods Receipt Note (GRN) is then generated.

---

## Step 6 – Invoice Submission

**Responsible Role:** Vendor

The selected vendor uploads an invoice containing:

- Invoice Number
- Invoice Date
- Billed Quantity
- Total Amount
- Supporting Documentation

The invoice becomes available for validation.

---

## Step 7 – Three-Way Matching

**Responsible Roles:** Procurement Officer or Finance Officer

The application automatically compares three procurement documents:

Purchase Order

Goods Receipt Note

Vendor Invoice

The system validates:

- Quantities
- Unit prices
- Total values

If every value matches, the workflow is marked as Matched and proceeds directly to Finance Authorization.

If discrepancies are detected, the workflow status changes to Mismatched and moves to Dispute Resolution.

---

## Step 8 – Dispute Resolution

**Responsible Roles:**

- Procurement
- Warehouse
- Vendor

The responsible party depends on the detected issue.

Possible actions include:

Warehouse

- Correct Goods Receipt information
- Reinspect received items

Vendor

- Submit corrected invoice
- Correct pricing or quantities

Procurement

- Amend Purchase Order
- Update purchasing information

After corrections, the workflow returns to Three-Way Matching.

---

## Step 9 – Finance Authorization

**Responsible Role:** Finance Officer

Finance reviews:

- Purchase Order
- Goods Receipt Note
- Vendor Invoice
- Three-Way Matching Results

If everything is verified, payment is authorized.

---

## Step 10 – Payment Processing

**Responsible Role:** Finance Officer

Finance records payment details including:

- Payment Date
- Transaction Reference
- Payment Method
- Settlement Confirmation

After successful payment, the workflow status changes to Completed.

---

# 4. System Architecture

The application follows a modern full-stack architecture.

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Backend

- Node.js
- Express
- TypeScript

Database

- MongoDB
- Mongoose ODM

Authentication

- JWT Authentication
- Role-Based Access Control

Real-Time Communication

- Socket.IO
- Polling Fallback

---

# 5. Database Design

## User Collection

Stores authenticated application users.

Fields:

- Name
- Email
- Password Hash
- Role
- Created At
- Updated At

Supported Roles:

- Admin
- Requester
- Manager
- Procurement
- Warehouse
- Vendor
- Finance

---

## Vendor Collection

Stores supplier information.

Fields:

- Name
- Email
- Phone
- Category
- Rating
- Price Tier
- Location
- Active Status

---

## Workflow Collection

Represents a complete procurement lifecycle.

Fields:

- Workflow Status
- Requester
- Manager
- Procurement Officer
- Selected Vendor
- Finance Officer
- Current Step
- Workflow Timeline
- Ten Step Objects
- Created Date
- Updated Date

Each workflow step stores:

- Status
- Started Time
- Completed Time
- Assigned User
- Metadata

---

## Vendor Quote Collection

Stores quotations submitted for Requests for Proposal.

Fields:

- Workflow ID
- Vendor ID
- Quote Amount
- Selected Status
- Submission Timestamp

---

## Purchase Order Collection

Stores generated Purchase Orders.

Fields:

- PO Number
- Workflow ID
- Vendor ID
- Ordered Items
- Total Amount
- Creation Date

---

## Goods Receipt Collection

Stores warehouse inspection records.

Fields:

- Workflow ID
- Received Quantity
- Damage Status
- Inspector
- Remarks
- Receipt Date

---

## Invoice Collection

Stores vendor invoices.

Fields:

- Workflow ID
- Vendor ID
- Invoice Number
- Invoice Amount
- Invoice Date
- Uploaded File
- Submission Timestamp

---

## Payment Collection

Stores payment history.

Fields:

- Workflow ID
- Payment Reference
- Amount
- Payment Method
- Authorized By
- Payment Date
- Status

---

# 6. Authentication

Authentication is implemented without external cryptography libraries.

Password Security

Passwords are hashed using Node.js native crypto module with scrypt and unique salts.

Stored Format:

salt.hash

JWT Authentication

After successful login, the backend generates a signed JWT containing:

- User ID
- Name
- Email
- Active Role

Each protected API validates the Bearer Token before processing requests.

Unauthorized users receive HTTP 401 responses.

---

# 7. Role-Based Authorization

Every API endpoint validates user permissions before execution.

Examples:

Requester

- Can create requisitions
- Cannot approve requests
- Cannot generate purchase orders

Manager

- Can approve or reject requisitions
- Cannot process invoices

Vendor

- Can submit quotations
- Can upload invoices
- Cannot access finance modules

Finance

- Can authorize payments
- Cannot modify procurement requests

Administrator

- Full unrestricted access

---

# 8. Real-Time Synchronization

The application uses Socket.IO for instant collaboration.

Broadcast Events

- workflow_updated
- vendor_created
- quote_submitted
- payment_processed
- dispute_updated

Workflow Rooms

Each workflow creates a dedicated Socket.IO room.

Example:

workflow:{workflowId}

Only users viewing that workflow receive updates.

Serverless Compatibility

Since Vercel Serverless Functions cannot maintain persistent WebSocket connections indefinitely, the frontend automatically switches to background polling every five seconds whenever the socket disconnects.

This ensures all clients remain synchronized even when WebSocket connectivity is unavailable.

---

# 9. User Interface Requirements

The interface follows strict role-based navigation.

Sidebar Navigation

Users only see modules relevant to their assigned role.

Hidden pages cannot be accessed through direct URLs.

Actor Switching

A developer mode allows instant switching between demo users.

When roles change:

- Sidebar updates automatically
- Unauthorized pages close automatically
- Dashboard becomes the default landing page

Security Lock

Unauthorized pages display:

- Warning Banner
- Disabled Forms
- Disabled Buttons
- Read-only Components
- Pointer Event Blocking

---

# 10. Functional Requirements

The MVP must support:

- User Authentication
- Role-Based Authorization
- Purchase Requisition Creation
- Manager Approval Workflow
- Vendor RFP Management
- Vendor Quote Submission
- Purchase Order Generation
- Goods Receipt Notes
- Invoice Upload
- Automated Three-Way Matching
- Dispute Resolution
- Finance Authorization
- Payment Processing
- Real-Time Workflow Updates
- Audit Trail
- Workflow History
- Secure API Access

---

# 11. Non-Functional Requirements

Performance

- API responses under 300 milliseconds for standard operations.
- Workflow pages load within two seconds under normal conditions.

Security

- JWT authentication.
- Password hashing using scrypt.
- Role-based authorization on every protected endpoint.
- Server-side validation for all API requests.

Scalability

- Modular Express architecture.
- Independent service layers.
- Repository-based database access.
- Socket.IO event-driven communication.

Reliability

- Automatic workflow state persistence.
- Recovery through polling when WebSockets disconnect.
- Complete audit logs for every workflow transition.

Maintainability

- TypeScript throughout frontend and backend.
- Modular controllers, services, middleware, and models.
- Consistent REST API conventions.
- Clear separation of business logic and presentation.
