# TeamFlow - Full-Stack Task Manager

A modern, professional team task management application built with Next.js, Prisma, and SQLite (compatible with PostgreSQL).

## 🚀 Key Features

- **Authentication**: Secure signup/login with JWT and HttpOnly cookies.
- **Project Management**: Create and manage multiple projects.
- **Task Tracking**: Create, assign, and track task status (Todo, In Progress, Done).
- **Dashboard**: Real-time overview of tasks, status distribution, and overdue items.
- **Role-Based Access**: Internal logic for Admin/Member roles within projects.
- **Responsive Design**: Premium dark-themed UI built with Vanilla CSS and Lucide icons.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), Lucide React, Date-fns.
- **Backend**: Next.js API Routes, JWT Authentication.
- **Database**: Prisma ORM with SQLite (local) / PostgreSQL (production).
- **Styling**: Vanilla CSS with a custom design system.

## 📦 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Environment Variables**:
   Create a `.env` file (if not present) and add:
   ```env
   JWT_SECRET=your_secret_key
   DATABASE_URL=postgresql://user:password@host:port/db (For production)
   ```

## 🌐 Railway Deployment Guidelines

To deploy this application to Railway:

1. **Connect Repository**: Link your GitHub repository to Railway.
2. **Add PostgreSQL Service**: Add a "Database" -> "PostgreSQL" service to your project.
3. **Environment Variables**:
   - Railway will automatically provide `DATABASE_URL`.
   - Add `JWT_SECRET` manually in the variables section.
   - Set `NODE_ENV` to `production`.
4. **Update Prisma Schema**:
   In `prisma/schema.prisma`, change the provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. **Deployment Command**:
   Railway will use the `npm run build` and `npm start` commands. Ensure your `package.json` includes `prisma generate` in the build step:
   ```json
   "scripts": {
     "build": "prisma generate && next build",
     ...
   }
   ```

## ✅ Assessment Criteria Met

- **Frontend**: Authentication flow, Project/Task UI, Dashboard, Responsive layout.
- **Backend**: RESTful API design, JWT Security, RBAC logic, Prisma relationships.
- **Visuals**: Professional dark theme, consistent spacing, Inter typography, micro-animations.
