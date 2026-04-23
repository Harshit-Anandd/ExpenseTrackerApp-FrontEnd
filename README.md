# SpendSmart Interface

SpendSmart is a student-friendly personal finance dashboard built with React and Vite.
It demonstrates a complete frontend workflow: authentication flow, protected routing, dashboard analytics, CRUD pages, and admin pages using mock data.

## Tech Stack

- React 18
- Vite 5
- React Router
- TanStack Query
- Tailwind CSS
- Framer Motion
- Recharts
- Vitest + Testing Library

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Vitest tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format source and root config files with Prettier

## Project Notes

- The app currently uses mock auth and mock datasets from `src/lib/mock-data.js`.
- Replace mock modules with real API calls when backend services are ready.
- Shared constants are centralized in `src/lib/constants.js` to avoid duplicated options in multiple pages.

## Suggested Next Step

Integrate real backend APIs gradually by replacing one feature at a time (for example, `ExpensesPage` first), while keeping the existing page UI and validation behavior.
