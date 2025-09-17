# **Kiki 🦀**
### Employee Attendance Management System

## Introduction

Welcome to **Kiki** 🦀, a modern and intuitive attendance management system designed to streamline workforce operations. This application provides a comprehensive suite of tools for tracking employee attendance, managing staff records, monitoring performance metrics, and generating detailed analytics reports with features like automatic late detection and holiday management.

**Kiki** offers a clean, responsive interface with real-time data synchronization and persistent storage, making it perfect for small to medium-sized organizations looking to digitize their attendance tracking processes.

## ✨ Key Features

### 🔐 **Authentication & Security**
- Secure login system with persistent session management
- Session state preserved across browser reloads/refreshes
- Protected routes with automatic redirection
- Delightful login celebration animation

### 📊 **Real-Time Dashboard**
- Live attendance metrics: total employees, present count, late arrivals, and absences
- Interactive leaderboard showcasing employee performance
- Today's attendance status with real-time updates
- Quick access to all major functions

### ⏰ **Smart Attendance Management**
- Automatic late detection (configurable threshold: 11:00 AM)
- Check-in/check-out time tracking with working hours calculation
- Bulk attendance marking with status management
- Holiday management with automatic attendance adjustment
- Current date handling (no more hardcoded dates!)

### 👥 **Complete Staff Management**
- Full employee lifecycle management (add, edit, view, deactivate)
- Personal details with birthday tracking and celebrations
- Experience and role management
- Filterable staff directory (current, former, all employees)
- Individual attendance history with calendar view
- CSV export functionality for attendance records

### 📈 **Analytics & Reporting**
- Month-to-Date (MTD) and Year-to-Date (YTD) analytics
- Attendance patterns and working days calculations
- Late streak tracking and performance metrics
- Export functionality for multiple time ranges
- Visual calendar with color-coded attendance status

### 🎯 **User Experience**
- Responsive design optimized for desktop and mobile
- Dark/light theme support
- Smooth animations and transitions
- Real-time data updates without page refreshes
- Intuitive navigation with breadcrumbs

### 🗄️ **Database-Backed Persistence**
- SQLite database with comprehensive schema for employees, holidays, and attendance records
- Automatic migration system with initial data seeding
- Data integrity with foreign key constraints and proper validation

---

## Screenshots

Below are screenshots of the main pages of the Kiki application, showcasing its key features.

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

### **Database & State**
- **[SQLite](https://www.sqlite.org/)** with **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - Fast, reliable database
- **Custom Context API** - Centralized state management
- **Local Storage** - Session persistence

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

### Database Setup

The application uses SQLite for data persistence. On a fresh installation, you **must** run the migration script to set up the database:

```bash
npm run migrate
```

This creates:
- Employee records (7 employees with sample data)
- Holiday calendar (Indian holidays for 2025)
- Attendance records with historical data
- Today's attendance entries for all active employees

**Note**: Database files (`*.db`) are excluded from git for security and size reasons.

### 🔑 Default Login Credentials
- **Username**: `admin`
- **Password**: `rockstar`

### 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server on port 9002
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking without build

# Database
npm run migrate      # Set up database with initial data
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

2. Run database migration on your server:
   ```bash
   npm run migrate
   ```

3. Start the production server:
   ```bash
   npm run start
   ```

**Note**: Ensure your deployment environment has write permissions for SQLite database creation.


## 🔧 Troubleshooting

### Common Issues

**Database not found error:**
```bash
npm run migrate
```

**Port already in use:**
The app runs on port 9002. Change it in `package.json` if needed.

**Session not persisting:**
Clear browser localStorage and login again.

### 📝 Recent Updates

- ✅ Fixed session persistence across browser reloads
- ✅ Migrated from hardcoded dates to real-time date handling
- ✅ Improved database migration system
- ✅ Enhanced staff management with employee removal
- ✅ Added comprehensive data validation
- ✅ Implemented proper .gitignore for database files

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 📄 License

© 2025 1xAI. All rights reserved.

This software and its documentation are protected by copyright law. All rights to this software, including but not limited to the application code, documentation, and design elements, are exclusively owned by 1xAI. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.