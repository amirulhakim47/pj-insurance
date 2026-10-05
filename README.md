# Car Insurance Renewal Application

A modern, responsive car insurance renewal frontend application built with Next.js 15, React 19, and TypeScript. This application provides a complete user flow for comparing and selecting car insurance policies with a focus on user experience and accessibility.

## 🚀 Features

### Core Functionality
- **Multi-step Insurance Flow**: Input Form → Loading → Results → WhatsApp Integration
- **Vehicle Type Support**: Car and Motorcycle insurance options
- **Form Validation**: Comprehensive validation for Malaysian formats (NRIC, plate numbers, postcodes)
- **Policy Comparison**: Side-by-side comparison of insurance policies from multiple providers
- **WhatsApp Integration**: Seamless handoff to WhatsApp for policy completion

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG compliant with screen reader support and keyboard navigation
- **Performance Optimized**: Code splitting, image optimization, and bundle analysis
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test suite with Jest and React Testing Library
- **Modern UI**: Clean, minimalist design with orange/white theme

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **React**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, @testing-library/jest-dom
- **Performance**: Bundle analyzer, Lighthouse integration

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pj-insrnce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Hostinger (Node.js app) deploy settings

Use these in **hPanel → Node.js → your app → Build settings**. Do **not** use `build:hostinger-zip` on the server (that only creates another zip locally).

| Setting | Value |
|--------|--------|
| Node.js | **22.x** |
| Install | `npm install` (must include dev/build deps, or keep TypeScript in `dependencies` as in this repo) |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |
| Output directory | `.next` |
| Entry file | *(leave empty for Next.js)* |

Set environment variables from `.env.example` in the Hostinger UI (not in the zip). Re-upload `deploy/pj-insrnce-hostinger.zip` after code changes, then redeploy.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (use this on Hostinger)
- `npm run build:hostinger-zip` - **Local only**: create upload zip for Hostinger
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run analyze` - Analyze bundle size
- `npm run lighthouse` - Run Lighthouse performance audit
