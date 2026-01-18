# Technical Due Diligence Briefing

**Project:** HALLU - Motor Insurance Quotation & Renewal Web Application  
**Company:** DC AUTO SERVICES  
**Date:** January 2026  
**Version:** 0.1.0

---

## Project Overview

This is a modern, responsive frontend application that enables customers to compare and purchase vehicle insurance policies online. Built with enterprise-grade technologies for reliability, security, and scalability.

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 15.5.4 | React framework with server-side rendering & static site generation |
| **UI Library** | React | 19.1.0 | Latest React with concurrent features |
| **Language** | TypeScript | 5.x | Type-safe JavaScript for reliability |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework |
| **UI Components** | shadcn/ui + Radix UI | Latest | Accessible, customizable component library |
| **Form Handling** | React Hook Form | 7.63.0 | Performant form management |
| **Validation** | Zod | 4.1.11 | Schema-based runtime validation |
| **Payment Gateway** | SenangPay | - | Malaysian payment processor integration |
| **Testing** | Jest + React Testing Library | 30.x | Unit & integration testing |
| **Code Quality** | Biome | 2.2.0 | Linting & formatting |

---

## Application Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Quote     │ → │   Loading   │ → │   Results   │ → │   Payment   │
│    Form     │    │  (API call) │    │  (Compare)  │    │ (SenangPay) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Step-by-Step Flow

1. **Quote Form** (`/quote`) - Customer enters vehicle & personal details
2. **Loading** (`/loading`) - API calls to fetch quotes from insurers
3. **Results** (`/results`) - Side-by-side policy comparison
4. **Payment** (`/payment`) - Secure checkout via SenangPay gateway

---

## Security & Compliance Features

### Data Protection (PDPA Compliance)

- **Mandatory PDPA consent** before form submission
- Dedicated **PDPA Policy page** (`/pdpa-policy`) explaining data usage
- Data stored only in **sessionStorage** (browser session only, not persisted)
- Clear disclosure of data sharing with insurance partners

### Form Validation (Malaysian Standards)

All form inputs are validated against Malaysian standards:

| Field | Validation Pattern | Example |
|-------|-------------------|---------|
| NRIC | `XXXXXX-XX-XXXX` format with date validation | `880115-14-5678` |
| Plate Number | Malaysian vehicle registration format | `ABC1234`, `W1234` |
| Postcode | 5-digit Malaysian postcode | `50450` |
| Phone Number | Malaysian mobile format | `0123456789`, `+60123456789` |

### Payment Security

- **HMAC-SHA256** hash generation for payment integrity
- Redirect to **SenangPay secure gateway** (no card data touches our server)
- Payment verification via hash comparison on return
- PCI-DSS compliance handled by payment gateway

---

## Data Collected

| Field | Purpose | Storage |
|-------|---------|---------|
| Full Name | Policy holder identification | Session only |
| NRIC | Identity verification | Session only |
| Vehicle Plate Number | Vehicle identification | Session only |
| Postcode | Risk assessment / area rating | Session only |
| Phone Number | Customer communication | Session only |
| Email | Quotation delivery | Session only |
| Vehicle Type | Car / Motorcycle selection | Session only |
| Customer Type | Individual / Company | Session only |
| E-hailing Flag | Premium calculation | Session only |
| Electric Vehicle Flag | Premium calculation | Session only |

**Note:** All data is stored in browser sessionStorage only and is automatically cleared when the browser tab is closed. No data is persisted on servers.

---

## Architecture

### Current Architecture (Frontend-Only)

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
├─────────────────────────────────────────────────────────┤
│  Next.js App (Static HTML/JS)                           │
│  ├── React Components                                    │
│  ├── Form Validation (Zod)                              │
│  ├── State Management (React Hooks + SessionStorage)    │
│  └── Payment Integration (SenangPay Redirect)           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
├─────────────────────────────────────────────────────────┤
│  • SenangPay Payment Gateway                            │
│  • Insurance Provider APIs (Ready for integration)       │
└─────────────────────────────────────────────────────────┘
```

### Code Organization

```
src/
├── app/                 # Next.js App Router pages
│   ├── quote/          # Quote form page
│   ├── loading/        # Loading/processing page
│   ├── results/        # Policy comparison page
│   ├── payment/        # Payment checkout page
│   ├── thank-you/      # Confirmation page
│   └── pdpa-policy/    # PDPA compliance page
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (buttons, cards, etc.)
│   └── InsuranceForm  # Main form component
├── lib/               # Utilities & services
│   ├── validations.ts # Zod validation schemas
│   ├── senangpay.ts   # Payment integration
│   └── utils.ts       # Helper functions
├── types/             # TypeScript interfaces
└── data/              # Mock data (replaceable with API)
```

---

## Quality Assurance

| Area | Tool/Practice | Status |
|------|---------------|--------|
| **Type Safety** | 100% TypeScript coverage | ✅ Implemented |
| **Linting** | Biome (ESLint alternative) | ✅ Implemented |
| **Testing** | Jest + React Testing Library | ✅ Implemented |
| **Accessibility** | WCAG compliant via Radix UI | ✅ Implemented |
| **Performance** | Lighthouse audits, bundle analysis | ✅ Implemented |
| **CI/CD Ready** | Automated test scripts | ✅ Ready |

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:ci      # Run tests in CI mode
npm run lint         # Run linter
npm run analyze      # Analyze bundle size
```

---

## Integration Readiness

The application is designed for easy backend integration:

### 1. Insurance Provider APIs
- Service layer in `src/lib/` ready to connect to real quote APIs
- Type definitions for API contracts already defined
- Mock data can be swapped for real API calls

### 2. Payment Gateway
- SenangPay integration complete (currently in sandbox mode)
- Switch to production by updating environment variables

### 3. Webhook Handlers
- API routes structure in place for payment verification
- Ready for backend implementation

### 4. Data Types
- Strongly typed interfaces for all API contracts
- Easy to extend for additional data fields

---

## Deployment

### Current Deployment
- **Platform:** GitHub Pages (static hosting)
- **Build Output:** `/out` directory with pre-rendered HTML

### Compatible Platforms
- Vercel (recommended for Next.js)
- AWS S3 + CloudFront
- Azure Static Web Apps
- Any static file hosting

### Environment Variables Required

```env
# Payment Gateway (Production)
SENANGPAY_MERCHANT_ID=your_merchant_id
SENANGPAY_SECRET_KEY=your_secret_key

# Insurance API (When integrated)
INSURANCE_API_KEY=your_api_key
INSURANCE_API_URL=https://api.provider.com
```

---

## Frequently Asked Questions

### Data & Privacy

**Q: Where is customer data stored?**  
A: SessionStorage only (browser session). Data is automatically cleared when the browser tab is closed. No data is persisted on our servers.

**Q: Do you store credit card details?**  
A: No. Customers are redirected to SenangPay's secure payment gateway. Card details never touch our application.

**Q: How is data transmitted?**  
A: All data is transmitted over HTTPS with TLS 1.3 encryption.

**Q: Is this PDPA compliant?**  
A: Yes. Mandatory consent is required before form submission, and a full privacy policy is disclosed.

### Technical

**Q: Can this be white-labeled?**  
A: Yes. The application uses CSS variables for theming and can be easily customized.

**Q: What's the API integration effort?**  
A: The service layer is ready. Estimated 1-2 weeks to connect to a live insurance API.

**Q: Is this mobile responsive?**  
A: Yes. Mobile-first design with responsive layouts for all screen sizes.

**Q: What browsers are supported?**  
A: All modern browsers (Chrome, Firefox, Safari, Edge) from the last 2 years.

---

## Contact

For technical questions or integration support, please contact the development team.

---

*Document generated: January 2026*
