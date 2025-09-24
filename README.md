# **Kiki 🦀**
### Payroll & Time Tracking Management System

## Introduction

Welcome to **Kiki** 🦀, a modern and comprehensive workforce management system that combines powerful payroll management with sophisticated time tracking. This application streamlines employee time tracking, automates payroll calculations, and provides detailed analytics, making it an all-in-one solution for small to medium-sized organizations.

**Kiki** 🦀 stands out with its:
- 💰 Sophisticated payroll management
- 👥 Smart time tracking with automatic late detection
- 📊 Comprehensive analytics and reporting
- 🔄 Real-time data synchronization
- 🎨 Clean, responsive interface

Perfect for organizations looking to:
- Streamline payroll and time tracking processes
- Reduce manual calculation errors
- Make data-driven workforce decisions
- Maintain transparent payment records

## ✨ Key Features

### 💰 **Payroll Management**
- Automated salary calculation based on attendance
- Support for hourly pay rates (TSE, Logistics, MIS roles)
- Smart working hours calculation (8-hour daily cap)
- Holiday pay integration
- PTO (Paid Time Off) management
- Monthly and historical pay summaries
- Role-based access control for payroll data
- Detailed pay breakdowns including:
  - Regular working days
  - Holiday pay
  - PTO adjustments
  - Net payable days
  - Gross pay calculation

### 🔐 **Authentication & Security**
- Secure login system with persistent session management
- Session state preserved across browser reloads/refreshes
- Protected routes with automatic redirection
- Delightful login celebration animation
- Role-based access control for Admin and Regular users

### 📊 **Real-Time Dashboard**
- Live attendance metrics: total employees (all staff), present count, late arrivals, and absences
- Interactive leaderboard showcasing employee performance, with clickable late comers to their detail pages
- Today's attendance status with real-time updates and sortable columns by default Status
- Quick access to all major functions

### ⏰ **Smart Attendance Management**
- Visual attendance summary with color-coded status indicators
- Interactive calendar with attendance tracking
- Automatic late detection (configurable threshold: 11:00 AM)
- Check-in/check-out time tracking with working hours calculation
- Holiday management with automatic attendance adjustment
- Flexible attendance tracking for any staff member

### 👥 **Staff & Payroll Management**
- Full employee lifecycle management (add, edit, view, deactivate, delete)
- Personal details with birthday tracking and celebrations
- Experience and role management
- Filterable staff directory (current, former, all employees) with sortable columns
- Individual attendance history with calendar view
- CSV export functionality for attendance records

#### 💰 **Comprehensive Payroll System**
- Hourly Pay Rate management for eligible roles (TSE, Logistics, MIS)
- Automatic working hours calculation (capped at 8 hours per day)
- Sophisticated pay calculation considering:
  - Regular working days
  - Holidays (counted as paid days)
  - Late arrivals
  - Absences and PTO management
- Monthly Pay Summary including:
  - Total present days (including holidays)
  - Late days tracking
  - Absent days calculation
  - PTO usage and balance
  - Net payable days computation
  - Final gross pay calculation
- Historical pay data tracking with month-by-month breakdown
- Role-based access control (Admin only) for sensitive payroll information

### 📈 **Analytics & Reporting**
- Comprehensive financial analytics:
  - Monthly payroll summaries
  - Year-to-Date (YTD) earnings reports
  - Pay trend analysis
  - Department-wise salary distribution
- Attendance analytics:
  - Month-to-Date (MTD) attendance patterns
  - Working days calculations
  - Holiday impact analysis
- Flexible reporting:
  - Period selection (MTD/YTD) for all reports
  - Export functionality for payroll and attendance data
  - Visual calendar with color-coded status
  - Custom date range reporting

### 🎯 **User Experience**
- Responsive design optimized for desktop and mobile
- Dark/light theme support
- Smooth animations and transitions
- Real-time data updates without page refreshes
- Intuitive navigation with breadcrumbs

### 🗄️ **Data Persistence**
- **[LowDB](https://github.com/typicode/lowdb)** - Lightweight JSON database for local data storage
- Secure data storage for employees, holidays, and attendance records
- Automatic data synchronization and backup
- Data integrity with comprehensive validation
- File-based storage with `kiki.json` as the primary data file

---

## Screenshots

Below are screenshots of the main pages of the Kiki application, showcasing its key features.

### Login

![Login Screenshot](/public/images/help/login.png)
*Clean and secure login interface with role-based authentication and session persistence.*

### Dashboard

![Dashboard Screenshot](/public/images/help/dashboard.png)
*A quick overview of today's attendance and overall employee statistics.*

### Attendance Calendar

![Attendance Calendar Screenshot](/public/images/help/attendance_calendar.png)

![Update Attendance Screenshot](/public/images/help/mark_attendance.png)

*An interactive calendar to manage and view daily attendance records and holidays.*

### Staff Management

![Staff Management Screenshot](/public/images/help/allemployees.png)

![Staff Management Screenshot](/public/images/help/staff_management.png)
*Manage employee profiles, view individual attendance histories, and update details.*

---

## 👋 About

![Staff Management Screenshot](/public/images/help/about.png)

1xAI is a pioneering technology company specializing in AI-powered business solutions. As the creator of Kiki 🦀, we focus on developing intelligent applications that transform traditional business processes through automation and data-driven insights.

### Connect With Us

- 📧 **Email**: [onexai.inc@gmail.com](mailto:onexai.inc@gmail.com)
- 💼 **LinkedIn**: [1xAI on LinkedIn](https://www.linkedin.com/company/1xai)
- 🐦 **X (Twitter)**: [@onexai_inc](https://x.com/onexai_inc)

---

## 🛠️ Tech Stack

This project is built with a modern, production-ready technology stack:

### **Core Framework**
- **[Next.js 15.3.3](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and enhanced developer experience
- **[React 18.3.1](https://react.dev/)** - Modern React with hooks and concurrent features

### **State Management**
- **Custom Context API** - Centralized state management
- **Local Storage** - Session persistence
- **Real-time Data Sync** - Automatic data synchronization
- **[LowDB](https://github.com/typicode/lowdb)** - Lightweight JSON database for data persistence

### **UI & Styling**
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality accessible components
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent iconography
- **[date-fns](https://date-fns.org/)** - Modern date utility library

### **Forms & Validation**
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with minimal re-renders
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolvers for React Hook Form

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Turbopack](https://turbo.build/pack)** - Lightning-fast build tool
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[Rimraf](https://github.com/isaacs/rimraf)** - Cross-platform file deletion utility
- **[Cross-env](https://github.com/kentcdodds/cross-env)** - Cross-platform environment variables

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with modern tooling and best practices.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:deepujain/kiki.git
   cd kiki
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Initialize the application:**
   The application will automatically create the necessary data files (`kiki.json`) and populate them with sample data on first run.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

### Initial Setup

The application comes with sample data pre-configured:
- Employee records with sample data
- Holiday calendar (Indian holidays for 2025)
- Historical attendance records (July-September 2025)
- Today's attendance entries for active employees
- All data is stored in `kiki.json` using LowDB

### 🔑 Default Login Credentials
- **Admin User**:
  - Username: `admin`
  - Password: `rockstar`
  - Role: `Admin`
- **Regular User**:
  - Username: `kiki`
  - Password: `3107`
  - Role: `Regular`

### 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack on port 9002
npm run build        # Build the application for production
npm run start        # Start production server on port 3001
npm run clean        # Clean the .next build directory
npm run lint         # Run ESLint for code quality checks
npm run typecheck    # Run TypeScript type checking without building
```

### 🏗️ Project Structure

```
kiki/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Main application pages
│   │   └── login/           # Authentication
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Shadcn/ui components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and database
│       ├── database/       # LowDB operations and schema
│       └── types.ts        # TypeScript type definitions
├── public/                 # Static assets
└── kiki.json              # LowDB data file (auto-generated)
```

### 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```
   The production server will run on port 3001.

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
- Development server runs on port 9002
- Production server runs on port 3001
- Change ports in `package.json` if needed

**Session not persisting:**
Clear browser localStorage and login again.

**Data not loading:**
Ensure `kiki.json` file exists in the project root. The application will create it automatically on first run.

**Database errors:**
If you encounter database-related errors, delete `kiki.json` and restart the application to regenerate the data file.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 📄 License

© 2025 1xAI. All rights reserved.

This software and its documentation are protected by copyright law. All rights to this software, including but not limited to the application code, documentation, and design elements, are exclusively owned by 1xAI. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.