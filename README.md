# Frontend

A modern, real-time medical queue and appointment management system built with **Vue 3**, **Vite**, **Tailwind CSS**, and **Laravel Echo/Pusher**. Supports **Admin**, **Doctor**, and **Patient** roles with role-based dashboards, real-time queue updates, and appointment management.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Role-Based Dashboards](#role-based-dashboards)
- [API Integration](#api-integration)
- [Real-Time Events](#real-time-events)
- [Testing](#testing)
- [Docker](#docker)
- [Deploying to Fly.io](#deploying-to-flyio)
- [Continuous Deployment (GitHub Actions)](#continuous-deployment-github-actions)
- [SPA Routing and nginx](#spa-routing-and-nginx)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Role-based dashboards** for Admin, Doctor, and Patient
- **Real-time queue updates** using Laravel Echo and Pusher
- **Appointment booking, management, and cancellation**
- **User management** (Admin: create doctors, filter/search users)
- **Responsive UI** with Tailwind CSS and DaisyUI
- **Authentication** (token-based, compatible with Laravel Sanctum)
- **Reusable components**: tables, modals, notifications, etc.

---

## Project Structure

```
src/
├── assets/                # Static assets
├── components/            # Reusable UI components
├── layouts/               # Layouts for each role
├── pages/                 # Page components (Admin, Doctor, Patient, Auth)
├── router/                # Vue Router setup
├── services/              # API and real-time (Echo) services
├── store/                 # Pinia stores (user, queue)
├── utils/                 # Utility functions
├── App.vue                # Root component
├── main.js                # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

### Build for Production

```bash
npm run build
# or
yarn build
```

---

## Environment Variables

Create a `.env` file in the project root with the following (example):

```
VITE_API_BASE_URL=https://your-backend-api.com
VITE_PUSHER_APP_KEY=your-pusher-key
VITE_PUSHER_APP_CLUSTER=your-pusher-cluster
```

---

## Usage

You can access the live application here: [https://frontend-wandering-dust-3957.fly.dev/](https://frontend-wandering-dust-3957.fly.dev/)

> **Note**: If the application doesn't load immediately, please refresh the page. This is a known issue with the Fly.io deployment platform.


- **Login/Register**: `/login`, `/register`
- **Admin Dashboard**: `/admin/dashboard`
- **Doctor Dashboard**: `/doctor/dashboard`
- **Patient Dashboard**: `/patient/dashboard`

Role-based navigation and route guards are enforced.

---

## Role-Based Dashboards

- **Admin**: View system stats, manage users (create/filter doctors, view patients), view all appointments.
- **Doctor**: View today's appointments, manage queue, call next patient, edit availability.
- **Patient**: Book appointments, view/cancel appointments, see real-time queue position.

---

## API Integration

All API calls are centralized in `src/services/api.js` using Axios. Example:

```js
import { getAppointments } from '@/services/api'

getAppointments({ patientId: 1 }).then(res => {
  // handle appointments
})
```

Authentication tokens are managed via Pinia (`src/store/user.js`).

---

## Real-Time Events

Real-time queue and appointment updates use **Laravel Echo** and **Pusher** (`src/services/echo.js`):

- Subscribes to private channels for doctors and patients.
- Handles events like `PatientCalled`, `QueueUpdated`, etc.
- UI updates automatically on relevant events.

---

## Docker

You can build and run the frontend locally using Docker:

```bash
# Build the Docker image
docker build -t medbook-frontend .

# Run the container (default: port 80)
docker run -p 8080:80 medbook-frontend
```

This uses a multi-stage build to produce a minimal nginx image serving the production build from `/usr/share/nginx/html`.

---

## Deploying to Fly.io

This project is ready to deploy on [Fly.io](https://fly.io/):


1. **Install Fly CLI**:  
   https://fly.io/docs/hands-on/install-flyctl/

2. **Authenticate**:  
   ```bash
   fly auth login
   ```

3. **Deploy**:  
   ```bash
   fly deploy
   ```

The deployment is configured via [`fly.toml`](./fly.toml).  
The default configuration serves the app on port 80 and uses HTTPS.

---

## Continuous Deployment (GitHub Actions)

Deployments to Fly.io are automated via GitHub Actions:

- Workflow: [`.github/workflows/fly-deploy.yml`](.github/workflows/fly-deploy.yml)
- On every push to `main`, the workflow builds and deploys the app to Fly.io.
- Requires `FLY_API_TOKEN` to be set in your repository secrets.

For more details, see [Fly.io GitHub Actions guide](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/).

---

## SPA Routing and nginx

This app is a single-page application (SPA). The Docker/nginx setup is configured to serve `index.html` for all routes, ensuring client-side routing works correctly (see Dockerfile for details).

---

## Testing

- Unit/component tests: (recommended) [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/)
- End-to-end: (optional) [Cypress](https://www.cypress.io/)

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

MIT

---

**For more technical details, see [`technical_implementation_doc.md`](./technical_implementation_doc.md).**

---

**If you need a more detailed user guide or API documentation, let me know!**
