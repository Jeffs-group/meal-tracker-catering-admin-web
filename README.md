# Catering Super Admin

A production-grade, enterprise-ready React application for the Catering Super Admin dashboard, built with modern frontend architecture patterns, strict TypeScript typing, modular state management, and a centralized design system.

---

## 1. Technology Stack

- **Core & Runtime**: React 18 (`react`, `react-dom`) + TypeScript (Strict Mode)
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Routing**: React Router DOM v6 (Data Router with lazy-loaded code-splitting)
- **Server State & Caching**: TanStack React Query v5 + React Query Devtools
- **Client State**: Zustand v5 (Modular stores with `persist` middleware)
- **Forms & Validation**: React Hook Form + Zod + `@hookform/resolvers`
- **HTTP Client**: Axios (Centralized instance with interceptors and typed responses)
- **Icons**: Lucide React
- **Code Quality**: ESLint 9 (Flat Config) + Prettier + `prettier-plugin-tailwindcss`

---

## 2. Project Architecture & Folder Structure

```text
catering-super-admin/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── .gitignore                # Git ignore patterns
├── .prettierrc               # Prettier configuration with Tailwind plugin
├── .prettierignore           # Prettier ignore patterns
├── eslint.config.js          # ESLint flat config with TypeScript rules
├── index.html                # Application HTML entry point
├── package.json              # Project dependencies and npm scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS theme and configuration
├── tsconfig.json             # Root TypeScript project references configuration
├── tsconfig.app.json         # TypeScript configuration for application code
├── tsconfig.node.json        # TypeScript configuration for build tool files
├── vite.config.ts            # Vite configuration with '@' alias
└── src/
    ├── assets/               # Static assets (images, icons, fonts)
    ├── components/           # Presentation and layout components
    │   ├── common/           # Shared utility components (e.g., ErrorBoundary)
    │   ├── forms/            # Form infrastructure (e.g., FormField wrapper)
    │   ├── layouts/          # Shell layout components (e.g., RootLayout)
    │   └── ui/               # Base UI design system (Button, Input, Label, etc.)
    ├── config/               # Application configuration and validated environment variables
    ├── constants/            # Global constants (routes, queryKeys, storageKeys)
    ├── features/             # Feature-based business domain modules
    │   └── README.md         # Guide on creating and encapsulating features
    ├── hooks/                # Global custom hooks (e.g., useDebounce)
    ├── lib/                  # Centralized third-party library adapters
    │   ├── axios.ts          # Centralized Axios HTTP client
    │   ├── apiError.ts       # Structured ApiError and error parser
    │   └── queryClient.ts    # TanStack QueryClient instance and defaults
    ├── providers/            # React context providers
    │   ├── AppProviders.tsx  # Centralized root application providers
    │   └── QueryProvider.tsx # TanStack Query Provider & DevTools
    ├── routes/               # Routing foundation
    │   ├── index.tsx         # Centralized route definitions and Router instance
    │   ├── ProtectedRoute.tsx# Auth guard for authenticated routes
    │   ├── PublicRoute.tsx   # Guard for public / unauthenticated routes
    │   ├── NotFound.tsx      # 404 Not Found route fallback
    │   └── Unauthorized.tsx  # 403 Forbidden route fallback
    ├── services/             # Global service definitions
    ├── stores/               # Zustand client state stores
    │   ├── authStore.ts      # Authentication session store (persisted)
    │   └── uiStore.ts        # Application UI store (sidebar, theme, modals)
    ├── types/                # TypeScript interfaces and shared type models
    │   ├── api.ts            # API request/response generic types
    │   ├── auth.ts           # Authentication user and token types
    │   └── common.ts         # Shared utility and UI prop types
    ├── utils/                # General utility functions
    │   └── cn.ts             # Tailwind class merging utility (clsx + tailwind-merge)
    ├── validations/          # Reusable Zod schemas and validation helpers
    │   └── common.ts         # Email, password, ID, pagination schemas
    ├── App.tsx               # Root App component mounting providers and router
    ├── index.css             # Tailwind CSS directives and global styles
    ├── main.tsx              # DOM mounting and entry point
    └── vite-env.d.ts         # Vite client type definitions
```

### Feature Folder Architecture

New domain-specific business capabilities should be structured inside `src/features/<feature-name>/`:

```text
src/features/<feature-name>/
├── components/     # Feature-scoped UI components
├── hooks/          # Feature data queries and mutations (TanStack Query)
├── services/       # Feature API endpoint functions
├── types/          # Feature domain models and interfaces
├── validations/    # Feature-specific Zod validation schemas
└── index.ts        # Public API barrel file
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env` to configure your local runtime:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for REST API endpoints | `https://api.example.com/api/v1` |
| `VITE_API_TIMEOUT_MS`| Axios HTTP request timeout in milliseconds | `15000` |
| `VITE_APP_NAME` | Display name of the application | `Catering Super Admin` |
| `VITE_APP_ENV` | Environment identifier (`development`, `staging`, `production`) | `development` |

Environment variables are validated on startup using Zod in `src/config/env.ts`.

---

## 4. API & Network Infrastructure

### Centralized Axios Client (`src/lib/axios.ts`)
- Automatically applies `VITE_API_BASE_URL` and `VITE_API_TIMEOUT_MS`.
- **Request Interceptor**: Dynamically attaches Bearer tokens from `useAuthStore` without coupling to hardcoded storage keys.
- **Response Interceptor**: Automatically catches 401 Unauthorized responses and purges authentication state.
- **Normalized Errors**: Maps HTTP errors to a typed `ApiError` class containing status codes, error payloads, and network indicators.
- **Type-safe Helper**: `http.get<T>`, `http.post<T>`, `http.put<T>`, `http.delete<T>` for ergonomic type-checked API calls.

### TanStack Query (`src/lib/queryClient.ts`)
- Configured with `staleTime: 5 mins` and `gcTime: 10 mins`.
- Smart retry strategy: Skips retries on 4xx client errors (401, 403, 404).
- Hierarchical Query Key factory pattern in `src/constants/queryKeys.ts`.
- React Query Devtools are included in development mode.

---

## 5. State Management Conventions

- **Server State**: Managed strictly through TanStack Query queries and mutations.
- **Client State**: Managed via Zustand stores (`src/stores/`):
  - `authStore`: User identity, authentication status, and token lifecycle (persisted in `localStorage`).
  - `uiStore`: Global theme, sidebar collapsed state, modal visibility.

---

## 6. Routing Foundation

React Router DOM v6 Data Router is configured in `src/routes/index.tsx`:
- Centralized routes defined in `src/constants/routes.ts`.
- **PublicRoute**: Protects unauthenticated flows (e.g. login).
- **ProtectedRoute**: Enforces active authentication session and optional role-based authorization (`allowedRoles`).
- **Lazy Loading**: Route endpoints are code-split using `React.lazy()` with a root Suspense fallback.
- **Fallback Screens**: 404 (Not Found) and 403 (Unauthorized).

---

## 7. UI Component Foundation

Located in `src/components/ui/`:
- **Button**: Supports `primary`, `secondary`, `outline`, `ghost`, `destructive` variants, sizes (`sm`, `md`, `lg`), and loading state with Lucide spinner.
- **Input**: Accessible input with error state styling, left/right icon slots, and ref forwarding.
- **Label**: Accessible label with required field indicator.
- **LoadingIndicator**: Spinner with full-screen and inline modes using Lucide `Loader2`.
- **ErrorDisplay**: Standardized error presentation with `card`, `banner`, and `inline` variants with optional retry callback.
- **FormField**: Accessible wrapper combining label, input, helper text, and validation error messages.

---

## 8. Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts the local Vite development server (Port 3000) |
| `npm run build` | `tsc -b && vite build` | Runs TypeScript compilation and generates production build in `/dist` |
| `npm run preview` | `vite preview` | Previews the production build locally |
| `npm run lint` | `eslint .` | Runs ESLint 9 static analysis on all TypeScript files |
| `npm run type-check` | `tsc --noEmit` | Runs strict TypeScript type checking without emitting files |
| `npm run format` | `prettier --write ...` | Formats all source files using Prettier and Tailwind plugin |
| `npm run format:check` | `prettier --check ...` | Verifies that all files conform to Prettier formatting |

---

## 9. Development Quickstart

1. Install dependencies:
   ```bash
   npm install
   ```

2. Verify environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Run type checking and linting:
   ```bash
   npm run type-check
   npm run lint
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

