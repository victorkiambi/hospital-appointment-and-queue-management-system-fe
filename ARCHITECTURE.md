# MedBook Frontend – Architecture Overview

## Overview
MedBook Frontend is a modern, role-based Single Page Application (SPA) for medical queue and appointment management. It is built with Vue 3, Vite, Tailwind CSS, and integrates with a Laravel backend via REST API and real-time events (Pusher/Echo).

---

## High-Level Architecture Diagram

```
+-------------------+        REST API        +-------------------+
|                   | <-------------------> |                   |
|   MedBook Frontend|                       |   Laravel Backend |
|  (Vue 3 SPA)      | <==== Pusher/Echo ===> | (API + Events)    |
|                   |      (WebSockets)     |                   |
+-------------------+                       +-------------------+
```

---

## Main Components

- **Vue 3 SPA**: All UI and client logic, role-based dashboards.
- **Pinia Store**: State management for user session, queue, and global state.
- **Vue Router**: Handles navigation and role-based route protection.
- **Axios Service**: Centralized HTTP client for API requests.
- **Echo Service**: Real-time event listener for queue/appointment updates.
- **Reusable Components**: Tables, modals, notifications, forms, etc.
- **Tailwind CSS/DaisyUI**: Utility-first styling and UI primitives.

---

## Data Flow

### 1. **API Communication**
- All CRUD operations (login, appointments, users, etc.) use RESTful API endpoints via Axios.
- Auth tokens are stored and sent with each request.

### 2. **Real-Time Events**
- Subscribes to private Pusher channels (via Laravel Echo) for doctors and patients.
- Receives events like `PatientCalled`, `QueueUpdated`, and updates the UI instantly.

### 3. **State Management**
- Pinia stores hold user, queue, and session state.
- Components reactively update based on store changes.

---

## Technology Stack
- **Vue 3**: UI framework
- **Vite**: Build tool and dev server
- **Pinia**: State management
- **Vue Router**: Routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **DaisyUI**: UI components
- **Laravel Echo + Pusher**: Real-time events

---

## Integration Points
- **Backend API**: All data (users, appointments, queues) is fetched and mutated via REST API endpoints provided by the Laravel backend.
- **Real-Time**: WebSocket connection to Pusher for instant updates (queue, appointment status, notifications).
- **Authentication**: Token-based, compatible with Laravel Sanctum.

---

## Component/Responsibility Map

| Component/Folder      | Responsibility                                      |
|----------------------|-----------------------------------------------------|
| `src/pages/`         | Role-based dashboards and main pages                |
| `src/components/`    | Reusable UI components (Table, Modal, Button, etc.) |
| `src/layouts/`       | Layouts for Admin, Doctor, Patient                  |
| `src/services/api.js`| API integration (Axios)                             |
| `src/services/echo.js`| Real-time event setup (Echo/Pusher)                |
| `src/store/`         | Pinia stores for user, queue, etc.                  |
| `src/router/`        | Route definitions and guards                        |
| `src/utils/`         | Utility functions                                   |

---

## Extending the Architecture
- Add new roles or dashboards by creating new pages/layouts and updating route guards.
- Add new real-time events by extending Echo listeners and updating Pinia stores.
- Integrate additional APIs or services by expanding the `services/` directory.

---

For more details, see the [technical implementation doc](./technical_implementation_doc.md) or the [user guide](./USER_GUIDE.md). 