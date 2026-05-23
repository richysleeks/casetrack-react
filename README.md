# CaseTrack — React Frontend

A task management dashboard built with **React + Vite**, connected to a Django REST Framework backend. Built for the HMCTS Developer Challenge.

## Features

- View all tasks with status, due date, and overdue indicators
- Filter tasks by status: To Do, In Progress, Completed, Overdue
- Search tasks by title or description
- Sort tasks by newest, oldest, or due date
- Live stats cards (counts fetched from the backend)
- Create, view, edit, and delete tasks
- Delete confirmation modal
- Fully responsive layout with sidebar navigation

## Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Framework | React 18                 |
| Bundler   | Vite 6                   |
| Routing   | React Router v6          |
| HTTP      | Native Fetch API         |
| Icons     | Lucide React             |
| Styling   | Plain CSS (no framework) |

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- The [casetrack-backend](../casetrack-backend) Django server running on `http://127.0.0.1:8000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── App.jsx                    # Route definitions
├── main.jsx                   # Entry point
├── index.css                  # Global styles and CSS variables
├── services/
│   └── taskService.js         # All API calls
├── components/
│   ├── Layout.jsx             # App shell — sidebar, header, outlet
│   ├── Sidebar.jsx            # Navigation with active state
│   └── DeleteModal.jsx        # Delete confirmation modal
└── pages/
    ├── Dashboard.jsx          # Stats overview + recent tasks
    ├── AllTasks.jsx           # Full task list with filters
    ├── TaskDetail.jsx         # Single task view
    ├── NewTask.jsx            # Create task form
    └── EditTask.jsx           # Edit task form
```

## API

All data comes from the Django backend at `http://127.0.0.1:8000`.

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/tasks/`       | List tasks (`?status=`) |
| GET    | `/tasks/stats/` | Stats counts              |
| POST   | `/tasks/`       | Create a task             |
| GET    | `/tasks/<id>/`  | Get a task                |
| PATCH  | `/tasks/<id>/`  | Update a task             |
| DELETE | `/tasks/<id>/`  | Delete a task             |
