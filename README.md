<div align="center">
   
# Project KEYSTONE — Field Service Management Platform

Java Full-Stack Engineering Project for Zidio Development · Client: Meridian Facilities Management

</div>

## 🎯 Overview

KEYSTONE is a role-based platform for managing field-service work orders end to end — from a
customer raising a request, through dispatch and technician fieldwork, to manager sign-off and
close-out. Four roles (Dispatcher, Technician, Manager, Customer) each see only what their role
needs, enforced on the server, not just hidden in the UI.

### ✨ What Good Looks Like

- 🧑‍💼 **Dispatcher:** Raises a work order, assigns it to a technician, and tracks progress.
- 🔧 **Technician:** Views assigned jobs, starts work, logs parts and time, and marks completion.
- 📊 **Manager:** Monitors overdue work orders, technician workload, and SLA compliance.
- 📱 **Customer:** Raises service requests and tracks their status in real time.
---

## 🛠 Tech Stack

- **Backend:** Java 21, Spring Boot 3 (Web, Security, Validation, Data JPA), JWT Authentication, Flyway
- **Database:** PostgreSQL
- **Frontend:** React + TypeScript (Vite)
- **API Documentation:** Swagger UI

## 🏗 Architecture

```
Client (React SPA)
   -> Controllers (thin, HTTP + auth only)
   -> Services (business rules, lifecycle state machine, @Transactional)
   -> Repositories (Spring Data JPA)
   -> PostgreSQL (Flyway-managed schema)
```
    
The work-order lifecycle (`WorkOrderLifecycleService`) is the core business rule: transitions are
validated against a fixed state graph, role-checked, and every change writes an append-only
`WorkOrderStatusHistory` row. See `service/WorkOrderLifecycleService.java`.

🚀 Local Setup

📦 Prerequisites
- Java 21, Maven
- Node 18+
- PostgreSQL 16 (or use `docker-compose up db`)
- Docker (optional, for full-stack `docker-compose up`)

### 1️⃣ Database
```bash
docker-compose up -d db
# or point DB_URL / DB_USERNAME / DB_PASSWORD at your own Postgres instance
```

### 2️⃣ Backend
```bash
cd backend
cp .env.example .env   # then edit values
mvn spring-boot:run
```
Flyway runs migrations automatically on startup (`V1__init_schema.sql`, `V2__seed_reference_data.sql`).
A `DataSeeder` component also creates one demo login per role on first boot.

Backend runs at `http://localhost:8080`. 

Swagger UI: `http://localhost:8080/swagger-ui.html`.

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

### 4️⃣ Full Stack via Docker
```bash
docker-compose up --build
```

## 🔑 Environment Variables

| Variable | Purpose | Default (dev only) |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/keystone` |
| `DB_USERNAME` | DB user | `keystone` |
| `DB_PASSWORD` | DB password | `keystone` |
| `JWT_SECRET` | JWT signing key — **set a real 256-bit+ secret in any deployed environment** | dev placeholder in `application.yml` |
| `JWT_EXPIRATION_MS` | Token lifetime | `86400000` (24h) |

⚠️ Never commit real secrets — `.env` is git-ignored.

## 👤 Demo Logins

| Role | Email | Password |
|---|---|---|
| Dispatcher | dispatcher@keystone.demo | Password123! |
| Technician | technician@keystone.demo | Password123! |
| Manager | manager@keystone.demo | Password123! |
| Customer | customer@keystone.demo | Password123! |

## 🔄 Work-Order Lifecycle

```
NEW -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> CLOSED
         |             | <-> ON_HOLD           ^
         v             v                       |
     CANCELLED     CANCELLED          (reopen: COMPLETED -> IN_PROGRESS, manager only)
```

- ❌ Illegal transitions return `409 Conflict`.
- 🔒 **CLOSE** is manager-only. Dispatch, assign, and cancel actions can be performed only by a Dispatcher or Manager. Field transitions (start, hold, resume, complete) can be performed only by the assigned Technician or a Manager.
- 📝 Every transition creates a `WorkOrderStatusHistory` record, capturing who made the change, the previous status, the new status, timestamp, and notes.

## 📁 Project Structure

```
keystone/
  backend/
    src/main/java/com/zidio/keystone/
      controller/   thin REST controllers
      service/      business logic + lifecycle state machine
      repository/   Spring Data JPA
      domain/       JPA entities
      security/     JWT, filters, user details
      config/       Spring Security config, data seeder
      dto/          request/response records
      exception/    custom exceptions + global handler
    src/main/resources/db/migration/   Flyway scripts
  frontend/
    src/api/        typed API client (JWT-attached)
    src/context/     auth context
    src/pages/       login + work-order board
  docker-compose.yml
```
📡 API Documentation

Two ways to explore the API:

Swagger UI (live, interactive) → http://localhost:8080/swagger-ui.html

Postman Collection → docs/postman/KEYSTONE.postman_collection.json Import into Postman: File → Import → select this file

## 🧩 Known gaps / next steps

This is a Week 1–2 foundation, not the full 4-week scope yet. Still to build:
- SLA breach scheduled job + notifications (F7)
- Full dashboard/reporting UI beyond the `/api/reports/summary` endpoint (F8)
- Customer self-service request intake UI (F9)
- Technician mobile-responsive field view polish (F5)
- Integration tests for the lifecycle and authorization rules
- Production deployment (currently local/dev only)

## 📌 Conclusion

KEYSTONE demonstrates a secure and scalable Java Full-Stack application built using Spring Boot, React, PostgreSQL, JWT Authentication, and RESTful APIs. The project follows industry-standard architecture and software engineering practices for efficient field service management.

---

<div align="center">

**🚀 Built as part of the Java Full-Stack Engineering Internship at Zidio Development**

</div>
