# TaskFlow — Frontend

React + TypeScript + Tailwind single-page app for **TaskFlow**, a task manager built for a
2-person team. Dashboard, calendar, task board, team view, notifications, and a persisted
light/dark theme.

Backend repo: [taskflow-backend](https://github.com/aleehassan-5/taskflow-backend)

**Deploying?** See [DEPLOY.md in taskflow-backend](https://github.com/aleehassan-5/taskflow-backend/blob/main/DEPLOY.md) for step-by-step Supabase + Render + Vercel setup.

## Tech Stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** React Context (`AuthContext`, `DataContext`, `ThemeContext`, `ToastContext`)

## Pages

| Route | Page |
|---|---|
| `/` | Dashboard — overview and stats |
| `/calendar` | Calendar — tasks laid out by due date |
| `/my-tasks` | Tasks assigned to the signed-in user |
| `/all-tasks` | Every task, with filters |
| `/team` | Team member list |
| `/completed` | Completed tasks |
| `/settings` | Account/theme settings |
| `/login` | Sign in |

## Getting Started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` and talks to the API at `http://localhost:4000/api` by default.
To point elsewhere, create `.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Requires the [backend](https://github.com/aleehassan-5/taskflow-backend) running and seeded —
log in with one of its seeded accounts. Since both people on the team hit the same backend, you
see the same shared task data.

## Project Structure

```
src/
  components/   # Sidebar, Topbar, TaskCard, modals, calendar item, etc.
  context/      # Auth, shared data, theme, toast providers
  lib/          # api client, calendar helpers, formatting
  pages/        # one component per route
  types/        # shared TypeScript types
```

## Scripts

```bash
npm run dev         # start dev server
npm run build        # tsc -b && vite build → dist/
npm run preview      # preview the production build locally
npm run typecheck    # tsc --noEmit
```

## Production Build

```bash
npm run build
```

Outputs static files to `dist/` — deploy behind any static host, Vercel, or nginx.

## Status

Typechecks and builds clean.
