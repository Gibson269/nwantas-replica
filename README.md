# Nwantas - Modern School Operating System

> **Enterprise Multi-Tenant School Management Platform**  
> Complete replica engineered for modern African and international educational institutions.

[![Nuxt 4](https://img.shields.io/badge/Framework-Nuxt%204-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/UI-Nuxt%20UI%20v4-10B981?logo=nuxt&logoColor=white)](https://ui.nuxt.com)
[![Node 24 SQLite](https://img.shields.io/badge/Database-SQLite%20(WAL)-003B57?logo=sqlite&logoColor=white)](https://nodejs.org)
[![Docker Ready](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

---

## 📖 Master Source of Truth Specification

The definitive system specification, domain decomposition, entity-relationship models, API contracts, and implementation roadmap are documented in:
👉 **[`docs/SOURCE_OF_TRUTH_MASTER_SPECIFICATION.md`](docs/SOURCE_OF_TRUTH_MASTER_SPECIFICATION.md)**

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v24.0.0 or higher (required for native `node:sqlite` DatabaseSync)
- **npm**: v10.0.0+

### Setup & Execution
```bash
# 1. Install dependencies
npm install

# 2. Seed and verify SQLite database (.data/nwantas.db)
npm run db:seed

# 3. Start local development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🛠️ Database Management & CLI Commands

The platform utilizes a high-performance, embedded relational database powered by Node.js 24's native `node:sqlite` with Write-Ahead Logging (`WAL` mode) enabled for concurrent reads and writes.

| Command | Description |
| :--- | :--- |
| `npm run db:seed` | Connects to `.data/nwantas.db`, verifies table integrity, and seeds if empty |
| `npm run db:reset` | Drops and re-creates all 23 relational tables with realistic institutional data |
| `npm run typecheck` | Validates TypeScript and Vue 3 template types across the entire project |
| `npm run build` | Compiles production bundle for the Nitro Node-Server preset |

---

## 🐳 Docker & DevOps Deployment

The repository includes a production-ready multi-stage `Dockerfile` and a `docker-compose.yml` orchestrating the Web app, Redis 7 (for session & presence), and optional PostgreSQL 16 (for multi-campus clustering).

```bash
# Boot complete container stack
npm run docker:up
# Or directly:
docker compose up -d --build

# View container logs
docker compose logs -f web

# Stop containers
npm run docker:down
```

---

## 🏛️ Platform Architecture & 20 Core Domains

The platform cleanly separates concerns into 20 distinct domain modules:
1. **Multi-Tenant Administration** (`/`, `/register-school`)
2. **11 Persona RBAC Matrix** (`/auth/login`, `app/stores/auth.ts`)
3. **Student Information System (SIS)** (`/dashboard/students`)
4. **Classes & Academic Arms** (`/dashboard/academics/classes`)
5. **AI Lesson Planning Workflow** (`/dashboard/academics/lesson-notes`)
6. **Computer-Based Testing (CBT)** (`/dashboard/academics/assessments`, `/dashboard/cbt/take/:id`)
7. **Anti-Cheat Proctoring Telemetry Engine** (Embedded in CBT)
8. **Broadsheets & Report Cards** (`/dashboard/academics/gradebook`)
9. **Bursary, Tuition & Wallets** (`/dashboard/finances`)
10. **Staff Payroll Remuneration** (`/dashboard/finances`)
11. **Hostel & Bed Space Allocation** (`/dashboard/accommodations`)
12. **Campus Gate Security & Exeats** (`/dashboard/security`)
13. **GoChats Collaborative Messenger** (`/dashboard/chat`)
14. **24/7 Conversational AI Tutor** (`/dashboard/ai-tutor`)
15. **Parent Portal & Multi-Ward View** (`/parents/dashboard`)
16. **Student Academic Portal** (`/dashboard`, `/dashboard/cbt/take/:id`)
17. **Admissions Pipeline** (`/admissions`, `/dashboard/admissions`)
18. **Standardized Past Questions Archive** (`/past-questions`)
19. **Inter-School Competitions** (`/competitions`)
20. **Ministry Regulatory Audit** (`/dashboard/government`)

---

## 🔒 Multi-Tenancy & RBAC

Switch between personas and tenant institutions on the fly using the interactive switcher in the dashboard topbar:
- **Institutions**: Apex International Academy (Lagos, NGN ₦) / Kingsway British College (London, GBP £)
- **Personas**: Superadmin, Federal Staff, State Staff, School Owner, Administrator, Principal, Registrar, Bursar, Teacher, Hostel Warden, Security Officer, Student, Parent.
