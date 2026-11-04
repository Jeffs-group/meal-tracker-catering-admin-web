# Feature-Based Architecture

Each business domain feature in this application should be encapsulated within its own folder under `src/features/<feature-name>`.

## Feature Folder Structure

```text
src/features/<feature-name>/
├── components/     # UI components private to this feature
├── hooks/          # React hooks for feature data fetching, mutations, local state
├── services/       # API call definitions for the feature using the centralized Axios client
├── types/          # Feature-specific TypeScript interfaces and models
├── validations/    # Zod schemas for forms, params, and payload validation
└── index.ts        # Barrel file exposing only the public API of the feature
```

## Principles

1. **Colocation**: Keep related logic, types, and UI together.
2. **Encapsulation**: Internal components and implementation details stay private to the feature.
3. **Public API**: Only export components, hooks, and types through `index.ts`.
4. **Server vs Client State**: Use TanStack Query hooks in `hooks/` for server data, and Zustand in `src/stores/` for client-only state.
