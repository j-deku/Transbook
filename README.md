# Transbook - Transport Booking System

**Transbook** is a full-stack transport booking system built around advance ride scheduling. Passengers book rides in advance, drivers get notified, and seat availability is managed per route â€” all backed by secure payments via Paystack.

What sets Transbook apart architecturally is its **multi-app frontend structure**: each user panel (passenger, driver, admin) is an independent React application, enabling isolated development, deployment, and scaling per role.

![Status](https://img.shields.io/badge/Status-MVP-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## Architecture Overview

Unlike traditional monolithic frontends, Transbook is structured as **three independent React apps** sharing one Node.js/Express backend:

```
Transbook/
|-- apps/
|   |-- passenger/           # React app for passengers
|   |-- driver/              # React app for drivers
|   `-- admin/               # React app for admins
|
|-- server/                  # Shared Node.js + Express backend
|   |-- src/
|   |   |-- routes/          # API route definitions
|   |   |-- controllers/     # Business logic
|   |   |-- middleware/      # Auth, RBAC, rate limiting
|   |   |-- services/        # Paystack integration
|   |   `-- models/          # MongoDB schema definitions
|
`-- .env.example             # Environment variable template
```

**Why multi-app?**
- Each panel can be developed, deployed, and scaled independently
- Smaller bundle sizes per app â€” only loads what each role needs
- Clear separation of concerns between passenger, driver, and admin concerns
- Easier to onboard contributors to a specific panel without touching others

---

## Features

### Passenger App
- Browse available routes and scheduled rides
- Advance booking with seat selection
- Secure checkout and payment via Paystack
- Digital receipts after successful bookings
- OAuth social login and JWT-based authentication
- Real-time booking status updates

### Driver App
- Register vehicle with total seat capacity
- Publish rides and manage seat availability per route
- Reserve seats for regular agents and customers
- Receive real-time notifications for new bookings
- View and manage upcoming ride schedules

### Admin App
- Full platform oversight from a dedicated dashboard
- Manage users, drivers, routes, and bookings
- Assign or unassign routes
- View system logs and operational reports
- Role-based access control (RBAC) across all panels

### Payments
- Paystack payment gateway integration
- Digital receipts generated after successful bookings

---

## Tech Stack

**Frontend (x3 independent React apps):**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

**Backend (shared):**

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

**Data & Infra:**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Auth & Payments:**

![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![OAuth](https://img.shields.io/badge/OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Paystack](https://img.shields.io/badge/Paystack-00C3F7?style=for-the-badge&logo=paystack&logoColor=white)

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB 6+ (or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/j-deku/Transbook.git
cd Transbook
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# App
PORT=5000
PASSENGER_URL=http://localhost:5173
DRIVER_URL=http://localhost:5174
ADMIN_URL=http://localhost:5175
```

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Passenger app
cd ../apps/passenger && npm install

# Driver app
cd ../driver && npm install

# Admin app
cd ../admin && npm install
```

### 4. Run the development servers

```bash
# Start backend (from /server)
npm run dev

# Start passenger app (from /apps/passenger)
npm run dev

# Start driver app (from /apps/driver)
npm run dev

# Start admin app (from /apps/admin)
npm run dev
```

| App | URL |
|-----|-----|
| Passenger | http://localhost:5173 |
| Driver | http://localhost:5174 |
| Admin | http://localhost:5175 |
| Backend API | http://localhost:5000 |

---

## User Roles

| Role | Access |
|------|--------|
| Passenger | Browse routes, book rides, manage bookings, make payments |
| Driver | Publish rides, manage seat availability, receive notifications |
| Admin | Full platform access, user management, operations oversight |

---

## Relationship to TOLI-TOLI

Transbook shares the same core booking concept as [TOLI-TOLI](https://github.com/j-deku/TOLI-TOLI) but differs in two key ways:

| | Transbook | TOLI-TOLI |
|---|---|---|
| Frontend architecture | Multi-app (3 independent React apps) | Single monorepo React app |
| Database | MongoDB | MySQL |
| Stage | MVP | Production-grade |

Transbook served as the MVP validation ground for the booking flow that TOLI-TOLI later refined and scaled.

---

## Roadmap

- [ ] Deploy all three frontend apps
- [ ] API documentation (Postman/Swagger)
- [ ] Screenshots and demo GIFs
- [ ] Driver earnings dashboard
- [ ] Email notifications for booking updates

---

## Acknowledgments

- [Paystack](https://paystack.com) for payment integration
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database
- [Vite](https://vitejs.dev) for fast multi-app builds

---

## Author

**Jeremiah Deku**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jeremiah-deku-jdek/)
[![GitHub](https://img.shields.io/badge/GitHub-000?logo=github&logoColor=white)](https://github.com/j-deku)
[![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:jdeku573@gmail.com)

---

## License

This project is licensed under the MIT License.
