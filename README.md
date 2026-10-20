# Final Exam: Internet Programming (2026)
## Topic: HR Manager & Salary Analytics System

**Repository:** `finalkanwit6730251417`  
**Student Name:** Kanwit Voottikulsin (กานต์วิชญ์ วุฒิกุลศิลป์)  
**Student ID:** `6730251417`  
**Section:** 870  
**GitHub Pages (Live Website):** [https://kanwit48.github.io/finalkanwit6730251417/](https://kanwit48.github.io/finalkanwit6730251417/)  
**Cloud Backend URL:** [http://119.59.102.161:3103/](http://119.59.102.161:3103/)  
**Cloud Database Host:** `119.59.102.161` (Port: `3306`)  
**Database Name:** `ip_std6730251417`  
**phpMyAdmin:** [http://119.59.102.161/nindamdb/](http://119.59.102.161/nindamdb/)  
**Primary Database Table:** `kanwit_6730251417_employee`

---

## 🌐 Live Web Access
- **GitHub Pages:** [https://kanwit48.github.io/finalkanwit6730251417/](https://kanwit48.github.io/finalkanwit6730251417/) (เปิดดูและทดสอบระบบได้ทันทีผ่าน Browser)
- **Cloud Backend Server:** `http://119.59.102.161:3103/` (เซิร์ฟเวอร์หลักที่เชื่อมต่อ MySQL บน Cloud)

---

## 📌 Project Overview & Required Features
A comprehensive full-stack Human Resource Management & Salary Analytics system satisfying all technical requirements and grading criteria of the Final Exam (Internet Programming 2026):

1. **Phase 1: Full CRUD & Authentication System**
   - **🔑 Administrator Login:** Secure login endpoint (`/api/login`) blocking unauthorized access (401) and issuing token upon valid credentials (`admin` / `password123`).
   - **➕ Add Employee:** Form validation preventing missing/invalid fields with `400 Bad Request` and auto-generating IDs.
   - **✏️ Edit Employee:** Dedicated modal to edit Name, Position, Salary, and Status with real-time UI & DB sync.
   - **🗑️ Delete Employee:** Deletion confirmation dialog preventing accidental deletions, deleting from database immediately.
   - **🔍 Real-Time Search & Filter:** Instant search bar filtering across Name, Position, ID, Status, and Salary, plus Status filter dropdown and multiple sorting options.
   - **🔄 Status Toggle:** Instant toggle between `Active` and `On Leave`.

2. **Phase 2: Salary Structure Analytics (1D K-Means Clustering, $k=3$)**
   - **Algorithmic Clustering:** Custom 1D K-Means algorithm categorizing employee salaries into 3 tiers (Tier 1, Tier 2, Tier 3).
   - **Summary Cards & Centroids:** Interactive dashboard cards presenting tier name, calculated centroid base salary, and headcounts.
   - **Loading State:** User feedback using activity indicators while calculations execute.

3. **Cloud Database Architecture**
   - Direct integration with Cloud MySQL Database (`ip_std6730251417`) on host `119.59.102.161`.
   - Primary table: `kanwit_6730251417_employee` with custom field prefix convention.

---

## 🔑 Login Credentials
- **Username:** `admin`
- **Password:** `password123`

---

## ☁️ Cloud Database & Table Structure
- **Host:** `119.59.102.161` (Port: `3306`)
- **Database:** `ip_std6730251417`
- **User:** `std6730251417`
- **Password:** `t7!s9Wqz`
- **Table:** `kanwit_6730251417_employee`

| Column Name | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `kanwit_6730251417_ID_Employee` | INT AUTO_INCREMENT | PRIMARY KEY | Unique Employee ID |
| `kanwit_6730251417_Name_Employee` | VARCHAR(255) | NOT NULL | Employee Full Name |
| `kanwit_6730251417_Position_Employee` | VARCHAR(255) | NOT NULL | Job Title / Role |
| `kanwit_6730251417_Status_Employee` | VARCHAR(50) | NOT NULL DEFAULT 'Active' | Work Status (Active / On Leave) |
| `kanwit_6730251417_Salary_Employee` | DECIMAL(10,2) | NOT NULL | Base Monthly Salary (THB) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation Timestamp |

---

## 📁 Project Directory Structure
```text
finalkanwit6730251417/
├── index.html                  # Root HTML for GitHub Pages live hosting
├── server.js                   # Node.js Express server + MySQL pool + K-Means
├── schema.sql                  # MySQL DDL & Seed data for kanwit_6730251417_employee
├── test_api.js                 # Automated API test suite (15/15 tests passing)
├── package.json                # Project dependencies (express, cors, mysql2, dotenv)
├── backend/
│   ├── server.js
│   ├── schema.sql
│   ├── test_api.js
│   ├── package.json
│   └── public/
│       └── index.html
├── frontend/
│   └── index.html
└── README.md
```

---

## 🧪 Automated Test Suite
Run tests with:
```bash
node test_api.js
```
Result: **15/15 Tests Passed (100% PASS)** covering all CRUD operations, input validation (400 Bad Request), authentication (401), deletion safety, and K-Means 3-tier grouping.
