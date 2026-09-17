# HRMS & Payroll System

A comprehensive Human Resource Management and Payroll system built by Dayton Natural Resource Pvt Limited. This repository contains the full stack for the application, including a web-based frontend, a Node.js REST API backend, and an Android mobile application.

## Project Structure

This is a monorepo containing all components of the system:

```text
pay/
├── app/
│   └── mobile/           # Android application
├── backend/              # Node.js API
│   ├── src/
│   │   ├── auth/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/             # React web app
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

- **`/frontend`**: React-based web application (Admin and Self-Service portals).
- **`/backend`**: Node.js & Express REST API for handling business logic and database interactions.
- **`/app/mobile`**: Native Android application (Kotlin & Jetpack Compose).
- **`/db`**: SQL procedures, tables, and migration scripts for the MySQL database.

---

## 🛠️ Tech Stack

### Frontend (Web)
- **Framework**: React 19 + Vite
- **Styling & Icons**: Custom CSS, Lucide React
- **Routing**: React Router v7
- **Data Fetching & State**: TanStack React Query, Axios
- **Charts**: Recharts
- **Other utilities**: `react-webcam` for attendance, `date-fns` for date manipulation

### Backend (API)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL (`mysql2`)
- **Authentication**: JWT (`jsonwebtoken`), bcryptjs for hashing
- **File Uploads**: Multer
- **PDF Generation**: PDFKit
- **Other**: `csv-parser` for data import

### Mobile Application
- **Platform**: Android
- **Language**: Kotlin
- **Build System**: Gradle Kotlin DSL

---

## ✨ Key Features

- **Authentication & Authorization**: Role-based access control for Admins, HRs, and Employees.
- **Employee Management**: Create, update, and manage employee profiles and documents.
- **Attendance Tracking**: 
  - Daily attendance logging
  - Selfie-based check-in (`react-webcam`)
  - Shift assignment and calendar tracking
  - Geolocation-based attendance tracking
- **Leave Management**: Apply for leaves, track balances, and manage approvals.
- **Task Management**: Assign and track daily/weekly tasks across the organization.
- **Reporting**: Generate PDF and CSV reports for attendance and payroll data.
- **Mobile Access**: Dedicated Android app for employee self-service (ESS) on the go.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) Database
- [Android Studio](https://developer.android.com/studio) (for mobile app development)

### 1. Database Setup
1. Create a MySQL database for the project.
2. Execute the `.sql` files found in the `/db` directory to set up tables, procedures, and initial data.

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory with your configuration (Database credentials, JWT secrets, Ports).
- Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
- Create a `.env` file for the frontend (API URL, etc.).
- Start the Vite development server:
```bash
npm run dev
```

### 4. Mobile App Setup
- Open the `/app/mobile` directory in **Android Studio**.
- Sync the Gradle project.
- Ensure the API URL in the mobile app points to your local/hosted backend server.
- Build and run the app on an emulator or physical device.

---

## 👨‍💻 Authors

- **Punit** (Dayton Natural Resource Pvt Limited)

## 📄 License

This project is licensed under the ISC License.
