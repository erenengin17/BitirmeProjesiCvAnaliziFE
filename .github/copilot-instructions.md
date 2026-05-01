## Quick context

This is a React + Vite single-page frontend for a CV analysis service. Key technologies: React 19, Vite, React Router, Ant Design, TanStack React Query, Axios. The backend runs separately (default baseURL: `http://localhost:8080`).

## High-level architecture

- UI pages live in `src/pages/` (route-to-page mapping in `src/routes/AppRouter.jsx`).
- Reusable UI pieces live in `src/components/`.
- API surface is implemented as small "manager" classes in `src/requests/*Manager.jsx` that return axios promises (e.g. `AnalysisManager`, `UserManager`).
- React Query hook wrappers are in `src/requests/*Queries.jsx` and are the primary way pages interact with server data (e.g. `useAnalysisById`, `useLogin`).
- Global axios configuration and auth header wiring is in `src/requests/axiosInstance.js` (baseURL and Authorization token injection).

Why this matters for an AI coding agent:
- Prefer calling existing `use*` hooks instead of adding raw axios calls in components.
- When adding new API endpoints, add a method in the relevant *Manager, then add a React Query hook in *Queries.jsx.

## Important patterns & conventions (use these exactly)

- File naming: `.jsx` functional components and hooks. Default exports are common (e.g. `export default function X` or `export default new Manager()`).
- API managers return axios responses. Many React Query hooks return the raw axios result unless the hook explicitly maps `.data` (see `useLastRun` which returns `res.data`).
- Query keys: use descriptive arrays e.g. `['analysisDetail', analysisId]` (see `src/requests/AnalysisQueries.jsx`).
- Fetch gating: hooks use `enabled: !!id` to avoid firing without an id — follow that pattern for conditional fetches.
- Auth: token is stored in `localStorage` under `token` and user metadata under `user`. `axiosInstance` injects `Authorization: Bearer <token>` automatically.
- File uploads: `createAnalysis` uses `multipart/form-data` (see `AnalysisManager.createAnalysis`) — set the request headers accordingly.

## Common developer workflows (explicit commands)

- Start development server (hot reload):

  npm run dev

- Build production bundle:

  npm run build

- Preview production build locally:

  npm run preview

- Lint the repo (ESLint):

  npm run lint

Vite is used as dev server — open browser to the printed dev URL. Backend is expected on `http://localhost:8080` unless `axiosInstance.js` is updated.

## Where to change / integrate things

- Backend base URL or auth behavior: edit `src/requests/axiosInstance.js` (token injection and default baseURL live here).
- New API endpoints: add a method to the corresponding Manager class in `src/requests` and then expose a React Query hook in the corresponding `*Queries.jsx` file.
- Routing: update `src/routes/AppRouter.jsx` and create corresponding components under `src/pages/`.

## Examples (copyable patterns)

- Add a manager method (example):

  // src/requests/AnalysisManager.jsx
  getSummary(analysisId) {
    return axiosInstance.get(`/api/analyses/${analysisId}/summary`);
  }

- Add a query wrapper:

  // src/requests/AnalysisQueries.jsx
  export const useAnalysisSummary = (analysisId) => {
    return useQuery({ queryKey: ['analysisSummary', analysisId], queryFn: () => AnalysisManager.getSummary(analysisId), enabled: !!analysisId });
  };

## Small gotchas observed

- Routes and some UI labels use Turkish (e.g. `/analizler`) — preserve URL strings and user-facing text when you change routes.
- Some hooks return axios response objects; others return `.data`. Check the consuming component for the expected shape before changing the hook.

## Where to look for reference

- `src/requests/axiosInstance.js` — baseURL + auth interceptor
- `src/requests/AnalysisManager.jsx` and `src/requests/AnalysisQueries.jsx` — canonical API + hook pattern
- `src/routes/AppRouter.jsx` — all app routes and corresponding pages
- `package.json` — scripts used for dev/lint/build

If anything is unclear or you want more examples (unit tests, component patterns, or CI hooks), tell me which area to expand and I will iterate.
