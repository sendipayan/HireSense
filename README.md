# HireSense

**AI-Powered Hiring & Resume Intelligence Platform**

HireSense transforms the hiring process by leveraging AI to match top talent with perfect opportunities. It provides advanced resume intelligence for candidates and smart job matching, automated screening, and collaborative tools for recruiters.

![HireSense Landing Page](public/landing_page.png)

## Features

### For Candidates 👨‍💻

- **AI Resume Analysis:** Get instant, actionable feedback on your resume to stand out.
- **Smart Job Matching:** Discover jobs that strictly align with your skills and career goals.
- **Application Tracking:** Manage all your job applications in one unified dashboard.
- **Interview Preparation:** Receive AI-driven tips to prepare for your interviews.

### For Recruiters 🏢

- **AI Candidate Matching:** Find the perfect fit based on deep skills analysis, not just keywords.
- **Automated Screening:** Save time by letting AI handle the initial candidate screening.
- **Collaborative Hiring:** Share feedback and make hiring decisions together with your team.
- **Analytics Dashboard:** Track pipeline health and recruitment ROI with real-time metrics.

## Tech Stack 🛠️

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Email:** [Resend](https://resend.com/) / [Nodemailer](https://nodemailer.com/)

## Project Structure 📂

```
HireSense/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # Backend API endoints
│   ├── auth/             # Authentication pages
│   ├── candidate/        # Candidate dashboard and features
│   ├── recruiter/        # Recruiter dashboard and features
│   ├── onBoarding/       # User onboarding flows
│   └── ...
├── components/           # Reusable UI components
├── lib/                  # Utility functions and shared logic
├── prisma/               # Database schema and migrations
├── store/                # Zustand global state stores
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## Getting Started 🚀

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/hiresense.git
    cd hiresense
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add the necessary environment variables:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/hiresense?schema=public"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    # Add other provider keys (Google, GitHub, Resend, etc.)
    ```

4.  **Database Setup:**
    Run the Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
