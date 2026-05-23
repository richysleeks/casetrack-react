# CLAUDE.md — casetrack-backend

Django REST Framework API for task management. Built for the HMCTS Developer Challenge.

---

## Quick Start

```bash
# Activate virtual environment (Python 3.10.5)
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Run development server → http://127.0.0.1:8000
python manage.py runserver

# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test tasks

# Run a single test method
python manage.py test tasks.tests.TaskTests.test_create_task

# Create and apply new migrations after model changes
python manage.py makemigrations
python manage.py migrate
```

---

## Project Structure

```
casetrack-backend/
├── casetrack/           # Django project config
│   ├── settings.py      # App settings, CORS, DB config
│   └── urls.py          # Root router — mounts tasks/ at /tasks/
└── tasks/               # Single app with all business logic
    ├── models.py         # Task model
    ├── serializers.py    # TaskSerializer (validation + formatting)
    ├── views.py          # Function-based views (tasks_list, task_detail)
    ├── urls.py           # App-level URL patterns
    └── tests.py          # APITestCase tests
```

- **Virtual environment:** `env/`
- **Database:** SQLite (`db.sqlite3`), included in repo
- **Python version:** 3.10.5 (see `.python-version`)

---

## Data Model

### Task

| Field        | Type          | Required | Notes                                        |
|-------------|---------------|----------|----------------------------------------------|
| `id`         | integer       | auto     | Primary key, auto-incremented                |
| `title`      | string (255)  | yes      |                                              |
| `description`| string        | no       | Nullable, blank allowed                      |
| `status`     | string        | yes      | Enum: `"todo"` / `"in_progress"` / `"done"` |
| `due_date`   | datetime      | no       | Nullable; ISO-8601 or `YYYY-MM-DDTHH:MM`    |
| `created_at` | datetime      | auto     | Set on creation, not editable                |

---

## API Endpoints

**Base URL:** `http://127.0.0.1:8000`

All successful responses (except DELETE) follow this envelope:
```json
{
  "message": "...",
  "data": { ... }
}
```

Validation errors return:
```json
{
  "message": "Validation failed",
  "errors": { "field": ["error detail"] }
}
```

---

### GET /tasks/

List all tasks, ordered by `created_at` ascending.

**Response — 200 OK**
```json
{
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Fix login bug",
      "description": "Users cannot log in with SSO",
      "status": "in_progress",
      "due_date": "2026-06-01T09:00:00Z",
      "created_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```

---

### POST /tasks/

Create a new task.

**Request body (JSON)**
```json
{
  "title": "Fix login bug",
  "status": "todo",
  "description": "Optional description",
  "due_date": "2026-06-01T09:00"
}
```

| Field         | Required |
|--------------|----------|
| `title`       | yes      |
| `status`      | yes      |
| `description` | no       |
| `due_date`    | no       |

**Response — 201 Created**
```json
{
  "message": "Task created successfully",
  "data": {
    "id": 2,
    "title": "Fix login bug",
    "description": null,
    "status": "todo",
    "due_date": null,
    "created_at": "2026-05-23T12:00:00Z"
  }
}
```

**Response — 400 Bad Request** (validation failure)
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["This field is required."],
    "status": ["Invalid status"]
  }
}
```

---

### GET /tasks/{id}/

Retrieve a single task by ID.

**Response — 200 OK**
```json
{
  "message": "Task retrieved successfully",
  "data": {
    "id": 1,
    "title": "Fix login bug",
    "description": "Users cannot log in with SSO",
    "status": "in_progress",
    "due_date": "2026-06-01T09:00:00Z",
    "created_at": "2026-05-20T10:00:00Z"
  }
}
```

**Response — 404 Not Found** (task does not exist)

---

### PATCH /tasks/{id}/

Partially update a task. Only include the fields you want to change.

**Request body (JSON)** — all fields optional
```json
{
  "status": "done"
}
```

**Response — 200 OK**
```json
{
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Fix login bug",
    "description": "Users cannot log in with SSO",
    "status": "done",
    "due_date": "2026-06-01T09:00:00Z",
    "created_at": "2026-05-20T10:00:00Z"
  }
}
```

**Response — 400 Bad Request** (invalid field value)
```json
{
  "message": "Validation failed",
  "errors": {
    "status": ["Invalid status"]
  }
}
```

---

### DELETE /tasks/{id}/

Delete a task permanently.

**Response — 204 No Content** (empty body)

**Response — 404 Not Found** (task does not exist)

---

## CORS Configuration

The API allows cross-origin requests from these origins (configured in `settings.py`):

```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
```

These match the default Vite dev server ports. If your React app runs on a different port, add it to `CORS_ALLOWED_ORIGINS` in `casetrack/settings.py`.

---

## Frontend Integration Notes

- **Content-Type:** Always send `Content-Type: application/json` for POST and PATCH requests.
- **Date format:** Send `due_date` as `"YYYY-MM-DDTHH:MM"` or full ISO-8601. The API returns dates as full ISO-8601 strings with a `Z` suffix (UTC).
- **Status values:** The only valid values for `status` are `"todo"`, `"in_progress"`, `"done"`. Anything else returns a 400.
- **Partial updates:** PATCH supports partial updates — you do not need to send all fields, only the ones you're changing.
- **No authentication:** The API has no auth layer — all endpoints are public.
- **Response envelope:** Every successful response (except 204 DELETE) wraps the payload in `{ "message": "...", "data": ... }`. Access `response.data.data` for the task object(s).

### Suggested fetch helper (React)

```js
const API_BASE = "http://127.0.0.1:8000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw json; // { message, errors }
  return json; // { message, data }
}
```

---

## Architecture Notes

- Views are **function-based** (`@api_view`). Class-based equivalents (`generics.ListCreateAPIView`, `generics.RetrieveUpdateDestroyAPIView`) are commented out in `views.py` and `urls.py` for reference.
- `TaskSerializer` uses `partial=True` for PATCH requests, allowing any subset of fields.
- `due_date` accepts two input formats: `iso-8601` and `%Y-%m-%dT%H:%M`. Always returned as full ISO-8601.
