# **Kiki 🦀**
### Employee Attendance & Payroll Management System

## Introduction

Welcome to **Kiki** 🦀, a modern and comprehensive workforce management system that combines powerful attendance tracking with sophisticated payroll management. This application streamlines employee time tracking, automates payroll calculations, and provides detailed analytics, making it an all-in-one solution for small to medium-sized organizations.

**Kiki** 🦀 stands out with its:
- 👥 Smart attendance tracking with automatic late detection
- 💰 Sophisticated payroll calculation based on attendance
- 📊 Comprehensive analytics and reporting
- 🔄 Real-time data synchronization
- 🎨 Clean, responsive interface

Perfect for organizations looking to:
- Automate attendance and payroll processes
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
- Automatic late detection (configurable threshold: 11:00 AM)
- Check-in/check-out time tracking with working hours calculation
- Bulk attendance marking with status management
- Holiday management with automatic attendance adjustment
- Current date handling (no more hardcoded dates!)
- Flexible attendance tracking for any staff member with "Track Attendance" enabled

### 👥 **Complete Staff Management & Payroll**
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
- Secure data storage for employees, holidays, and attendance records
- Automatic data synchronization
- Data integrity with comprehensive validation

---

## Screenshots

Below are screenshots of the main pages of the Kiki application, showcasing its key features.

### Login

![Login Screenshot](/public/images/login.png)
*Clean and secure login interface with role-based authentication and session persistence.*

### Dashboard

![Dashboard Screenshot](/public/images/dashboard.png)
*A quick overview of today's attendance and overall employee statistics.*

### Attendance Calendar

![Attendance Calendar Screenshot](/public/images/attendance_calendar.png)

![Update Attendance Screenshot](/public/images/mark_attendance.png)

*An interactive calendar to manage and view daily attendance records and holidays.*

### Staff Management

![Staff Management Screenshot](/public/images/allemployees.png)

![Staff Management Screenshot](/public/images/staff_management.png)
*Manage employee profiles, view individual attendance histories, and update details.*

---

## 🛠️ Tech Stack

This project is built with a modern, production-ready technology stack:

### **Core Framework**
- **[Next.js 15.3.3](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and enhanced developer experience
- **[React 19](https://react.dev/)** - Latest React features and optimizations

### **State Management**
- **Custom Context API** - Centralized state management
- **Local Storage** - Session persistence
- **Real-time Data Sync** - Automatic data synchronization

### **UI & Styling**
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality accessible components
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent iconography
- **[date-fns](https://date-fns.org/)** - Modern date utility library

### **Forms & Validation**
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with minimal re-renders
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Turbopack](https://turbo.build/pack)** - Lightning-fast build tool
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

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

3. **Set up the database:**
   ```bash
   npm run migrate
   ```
   This will create `attendance.db` with the schema and populate it with initial employee data and holidays.

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
- Attendance records with historical data
- Today's attendance entries for active employees

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
npm run dev          # Start development server on port 9002
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking without build

# Development Commands
```

### 🏗️ Project Structure

```
kiki/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Main application pages
│   │   └── login/           # Authentication
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Shadcn/ui components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and database
│       ├── database/       # Database schema and operations
│       └── types.ts        # TypeScript type definitions
├── scripts/                # Database migration scripts
└── public/                 # Static assets
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

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
The app runs on port 9002. Change it in `package.json` if needed.

**Session not persisting:**
Clear browser localStorage and login again.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 📄 License

© 2025 1xAI. All rights reserved.

This software and its documentation are protected by copyright law. All rights to this software, including but not limited to the application code, documentation, and design elements, are exclusively owned by 1xAI. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.