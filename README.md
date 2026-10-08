# Job Portal Frontend (Next.js & React)

Modern frontend UI for the Job Portal built with Next.js App Router, Tailwind CSS, and Redux Toolkit.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Ensure `.env.local` exists with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 Connecting to Spring Boot Backend

The frontend communicates with the Spring Boot backend (`http://localhost:8080`) via Axios services defined in [`services/api.js`](file:///C:/Users/gobik/.gemini/antigravity/worktrees/job-portal-capstone/spring_boot_mysql_setup/frontend/services/api.js).

Make sure the Spring Boot backend is running on port `8080` before logging in or performing actions.

---

## 👥 Demo Credentials

You can log in with any seeded account from `db.json`:
- **Job Seeker**: `alice@example.com` / `pass123`
- **Employer**: `bob@techcorp.com` / `pass123`
- **Admin**: `admin@jobportal.com` / `admin123`

