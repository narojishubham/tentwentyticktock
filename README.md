# Timesheet Management System

A sleek, responsive SaaS-style Timesheet Management application built with Next.js. This project features a dashboard for viewing timesheets and a detailed view for managing daily tasks with a dynamic progress indicator.

## 🚀 Working Online Demo
[Link to your hosted demo (e.g., Vercel)]

## 🛠️ Frameworks & Libraries Used
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **Utilities**: [UUID](https://github.com/uuidjs/uuid)

## 📦 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-github-link>
   cd tentwentyproject
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```
   *(Note: You can generate a secret using `openssl rand -base64 32`)*

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Assumptions & Notes
- **Mock Data**: For the purpose of this demonstration, the application uses an in-memory store for timesheets and tasks. Data persists as long as the server is running but resets on restart.
- **Progress Tracking**: The target hours for a "Completed" status is 40 hours. The UI dynamically reflects this through a custom tooltip progress bar that turns green upon completion.
- **Responsive Design**: The interface is fully responsive, optimized for both desktop and mobile viewing with a focus on premium aesthetics (Inter font, glassmorphism-inspired elements).

## ⏱️ Time Spent
- **Total Development Time**: Approximately 9.5 hours.
  
## NOTE
- **Email**: test@example.com
- **Password**: password
