# Final Exam: Internet Programming (2026)
## Topic: HR Manager & Salary Analytics System

**Repository:** `finalkanwit6730251417`  
**Student Name:** Kanwit Voottikulsin  
**Student ID:** `6730251417`  
**Section:** 870  
**Cloud Database Host:** `119.59.102.161`  
**Database Name:** `ip_std6730251417`  
**Cloud Backend Port:** `3103`  
**phpMyAdmin:** `http://119.59.102.161/nindamdb`

---

## 📌 Project Overview
A comprehensive full-stack Human Resource Management & Salary Analytics system satisfying all technical requirements and grading criteria of the Final Exam (Internet Programming 2026):

1. **Phase 1: Authentication & CRUD System**
   - **Administrator Authentication:** Secure login endpoint (`/api/login`) blocking unauthorized access (401) and issuing token upon valid credentials (`admin` / `password123`).
   - **RESTful CRUD Operations:** Full backend operations for employees (`GET`, `POST`, `PUT /status`, `DELETE`).
   - **Input Validation & Error Handling:** Robust client-side and backend validation rejecting missing/invalid fields with `400 Bad Request`.
   - **Deletion Safety:** Confirmation dialogs preventing accidental deletions.
   - **Real-Time UI Synchronization:** React Native frontend updates instantly upon data modifications.

2. **Phase 2: Salary Structure Analytics (1D K-Means Clustering, $k=3$)**
   - **Algorithmic Clustering:** Custom 1D K-Means algorithm categorizing employee salaries into 3 tiers (Tier 1, Tier 2, Tier 3).
   - **Summary Cards & Centroids:** Interactive dashboard cards presenting tier name, calculated centroid base salary, and headcounts.
   - **Loading State:** User feedback using activity indicators while calculations execute.

3. **Cloud Database Architecture**
   - Direct integration with Cloud MySQL Database (`ip_std6730251417`) on host `119.59.102.161`.
   - Field naming strictly conforms to instructor specification (`NinSom_ID_Employee`, `NinSom_Name_Employee`, `NinSom_Position_Employee`, `NinSom_Status_Employee`, `NinSom_Salary_Employee`) and student exam tables (`FinalExam_Kanwit_Wutt_Employee`, `employees`).

---

## 📁 Project Directory Structure
```text
finalkanwit6730251417/
├── backend/
│   ├── .env                    # Cloud database configuration
│   ├── .env.example            # Environment template
│   ├── package.json            # Express, CORS, mysql2 dependencies
│   ├── schema.sql              # MySQL DDL & seed data (NinSom_Employee)
│   ├── server.js               # Full REST API & K-Means implementation
│   └── test_api.js             # Automated API test suite
├── frontend/
│   ├── App.js                  # React Native UI (Login, CRUD, K-Means Dashboard)
│   ├── app.json                # Expo application config
│   └── package.json            # React Native & Expo dependencies
├── .gitignore
└── README.md
```

---

## 🔑 Login Credentials
- **Username:** `admin`
- **Password:** `password123`

---

## ☁️ Cloud Database & Table Structure
- **Host:** `119.59.102.161` (Port: `3306`)
- **Database:** `ip_std6730251417`
- **User:** `std6730251417`
- **Table:** `NinSom_Employee`

| Column Name | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `NinSom_ID_Employee` | INT AUTO_INCREMENT | PRIMARY KEY | Unique Employee ID |
| `NinSom_Name_Employee` | VARCHAR(255) | | Full Name |
| `NinSom_Position_Employee` | VARCHAR(255) | | Job Position |
| `NinSom_Status_Employee` | VARCHAR(50) | | `Active` or `On Leave` |
| `NinSom_Salary_Employee` | DECIMAL(10,2) | | Monthly Salary (THB) |
| `created_at` | TIMESTAMP | | Record Timestamp |

---

## 📡 API Endpoints Documentation

### Authentication & CRUD Endpoints
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Administrator login | `200 OK` / `401 Unauthorized` |
| **GET** | `/api/employees` | Get all employee records | `200 OK` |
| **POST** | `/api/employees` | Add a new employee | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/employees/:id/status` | Toggle status (`Active` $\leftrightarrow$ `On Leave`) | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/employees/:id` | Delete employee record | `200 OK` / `404 Not Found` |

### Analytics Endpoint
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/employees/salary-clusters` | 1D K-Means ($k=3$) salary clustering | `200 OK` |

**Sample K-Means Response:**
```json
{
  "success": true,
  "clusters": [
    { "group": "Tier 1", "centroid": 20000, "count": 2 },
    { "group": "Tier 2", "centroid": 48500, "count": 2 },
    { "group": "Tier 3", "centroid": 90000, "count": 2 }
  ]
}
```

---

## 🚀 Running the Project

### 1. Start Backend Server
```bash
cd backend
npm install
node server.js
```
Backend will start on `http://localhost:3103` (or `http://119.59.102.161:3103` on cloud).

### 2. Run Automated API Verification
```bash
cd backend
node test_api.js
```

### 3. Start Frontend Client (Expo / React Native)
```bash
cd frontend
npm install
npx expo start
```
- Press `w` to open in Web Browser (`http://localhost:8081`).
- Or scan QR code in Expo Go app (iOS / Android).
