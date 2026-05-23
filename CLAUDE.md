# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CaseTrack — React Frontend

React + Vite task management dashboard connected to a Django REST Framework backend. Backend docs are in `docs/Frontend.md`. The Vue equivalent lives in `../casetrack-frontend/`.

---

## Development Commands

```bash
npm install       # first time only
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → dist/
```

Django backend must also be running:
```bash
cd ../casetrack-backend && source env/bin/activate && python manage.py runserver
# → http://127.0.0.1:8000
```

---

## Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Framework | React 18, functional components + hooks     |
| Routing   | React Router v6 (`BrowserRouter`)           |
| Bundler   | Vite 6 (`@` alias → `src/`)                |
| HTTP      | Native `fetch` via `src/services/taskService.js` |
| Icons     | `lucide-react`                              |
| Styling   | Single global `src/index.css` with CSS vars |
| Backend   | Django REST Framework at `http://127.0.0.1:8000` |

---

## File Structure

```
src/
├── App.jsx                      # Route definitions only
├── main.jsx                     # Entry point
├── index.css                    # All styles — CSS custom properties at :root
├── services/
│   └── taskService.js           # Every API call lives here, nowhere else
├── components/
│   ├── Layout.jsx               # App shell: sidebar + header search + <Outlet>
│   ├── Sidebar.jsx              # Nav links; active state derived from useLocation
│   └── DeleteModal.jsx          # Confirmation modal (delete is the only modal action)
└── pages/
    ├── AllTasks.jsx             # Main task list — stats cards, filter bar, table
    ├── Dashboard.jsx            # Stats cards + recent 5 tasks
    ├── TaskDetail.jsx           # View a single task (own page)
    ├── NewTask.jsx              # Create task form (own page)
    └── EditTask.jsx             # Edit task form (own page)
```

---

## Routing

| Path               | Page         | Notes                              |
|--------------------|--------------|------------------------------------|
| `/`                | —            | Redirects to `/dashboard`          |
| `/dashboard`       | Dashboard    | Stats + recent tasks               |
| `/tasks`           | AllTasks     | Full list; `?status=` and `?search=` params |
| `/tasks/new`       | NewTask      | Create form                        |
| `/tasks/:id`       | TaskDetail   | View only                          |
| `/tasks/:id/edit`  | EditTask     | Edit form                          |

Sidebar filtered links (`To Do`, `In Progress`, `Completed`, `Overdue`) navigate to `/tasks?status=<value>`. `AllTasks` derives `statusFilter` directly from `useSearchParams()` — it is **not** stored in local state. This is intentional: storing it in state caused stale values when navigating between sidebar links without remounting the component.

---

## Architecture

### API calls — `taskService.js` only
Never call `fetch` from a component. All calls go through `src/services/taskService.js`.

```js
taskService.getAll(statusFilter)  // null = all, or 'todo'/'in_progress'/'done'/'overdue'
taskService.getStats()            // { todo, in_progress, done, total, overdue }
taskService.getOne(id)
taskService.create(data)
taskService.update(id, data)
taskService.remove(id)
```

### Status filtering
Filtering by status is done **on the backend** (`GET /tasks/?status=todo`). `AllTasks` re-fetches from the backend when `statusFilter` changes. Client-side filtering only applies to the search input and sort order.

### Stats cards
Stats come from `GET /tasks/stats/` — counts computed in the database. Overdue is defined server-side as `due_date < now AND status != 'done'`.

### Delete flow
Delete is the only action with a modal. All other actions (view, edit, create) have their own full page. `setDeleteTarget(task)` opens the modal; confirming calls `taskService.remove()` and filters the task out of local state.

### Forms (NewTask / EditTask)
Both use a controlled `form` object in `useState`. API errors (`err.errors`) are mapped to per-field `errors` state. `EditTask` converts the ISO date from the API to `YYYY-MM-DDTHH:MM` for the `datetime-local` input via `toDatetimeLocal()`.

---

## Styling

All styles are in `src/index.css`. Key CSS variables defined at `:root`:

```css
--primary: #3b82f6
--todo: #f59e0b
--in-progress: #3b82f6
--done: #22c55e
--overdue: #ef4444
```

Status badge classes follow the pattern `badge-todo`, `badge-in_progress`, `badge-done`. No scoped styles — everything is global.

---

## API Reference

Backend base: `http://127.0.0.1:8000`

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/tasks/`         | List all (supports `?status=` filter)|
| GET    | `/tasks/stats/`   | Returns `{ todo, in_progress, done, total, overdue }` |
| POST   | `/tasks/`         | Create task                          |
| GET    | `/tasks/<id>/`    | Retrieve one                         |
| PATCH  | `/tasks/<id>/`    | Partial update                       |
| DELETE | `/tasks/<id>/`    | Delete (returns 204)                 |

Response envelope: `{ "message": "...", "data": <object|array> }`. Errors: `{ "message": "Validation failed", "errors": { field: ["msg"] } }`.

Valid status values: `"todo"` · `"in_progress"` · `"done"`. Overdue is a computed filter, not a status value.