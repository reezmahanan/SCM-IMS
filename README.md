# 📦 Inventory Management System

A premium full-stack **Inventory Management System** built with **Spring Boot**, **React**, **MySQL**, and **JWT Authentication**. The system provides secure inventory management with **Role-Based Access Control (RBAC)**, interactive visualization dashboards, search/filters, file exports, and low-stock warnings.

---

## 🚀 Features

### 🔐 Authentication & Security
* JWT-based secure authentication
* BCrypt password encryption
* Stateless session management
* Secure role-based authorization (USER, MANAGER, ADMIN)
* CORS configuration for frontend-backend integration

### 👥 Role-Based Access Control
| Role    | Permissions                              |
| ------- | ---------------------------------------- |
| USER    | View products and inventory              |
| MANAGER | View inventory + Add/Reduce stock        |
| ADMIN   | Full access including Product Management |

### 📦 Product Management (ADMIN)
* Create, update, and delete products
* SKU and category management
* Base64 product image uploads with size constraints (max 1MB)
* Fullscreen lightbox overlays for product image previews

### 📊 Real-time Dashboard & Charts
* Interactive visual statistics:
    * **Top 5 Products Stock Level Chart**: Custom responsive SVG bar chart.
    * **Category Distribution Chart**: Custom responsive SVG donut chart showing normalized category divisions.
* Fast metric summary cards for total products, total stock, and low stock warnings.

### 🔍 Advanced Search & Filtering
* Search products instantly by Name or SKU
* Dynamic dropdown filtering by Category and Stock Status (All, In Stock, Low Stock)
* Interactive sorting by ID, Name, Quantity, and Unit Price
* Instant reset filter capabilities

### 📥 Inventory Report Exports
* **Export CSV Report**: Download the inventory catalog as an Excel-compatible spreadsheet.
* **Export PDF Report**: Download a beautifully styled PDF document snapshot with headers and tabular data.

---

# 🛠 Technology Stack

## Backend
| Technology      | Version |
| --------------- | ------- |
| Java            | 17 LTS  |
| Spring Boot     | 4.0.6   |
| Spring Security | 6.x     |
| Spring Data JPA | 3.x     |
| MySQL           | 8.0+    |
| JWT (JJWT)      | 0.11.5  |

## Frontend
| Technology       | Version |
| ---------------- | ------- |
| React            | 19.2.5  |
| React Router DOM | 7.15.1  |
| Axios            | 1.16.0  |
| jsPDF            | 4.2.1   |
| jsPDF AutoTable  | 5.0.8   |

---

# 📁 Project Structure

```text
inventory-management-system/
│
├── maven/                 # Portable Local Maven binaries
├── src/main/java/         # Spring Boot source files
│   └── com/inventory/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── filter/
│       ├── repository/
│       ├── service/
│       └── util/
│
├── frontend/              # React frontend codebase
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── Dashboard.js
│   └── package.json
│
├── run_backend.ps1        # Launcher script for backend
├── run_frontend.ps1       # Launcher script for frontend
├── pom.xml                # Backend maven dependencies configuration
└── README.md
```

---

# 📋 Prerequisites
Install the following on your system:
* Java 17 LTS
* Node.js 18+
* MySQL 8.0+

---

# ⚙️ Installation & Setup

## 1️⃣ Configure Database
Create a new MySQL database:
```sql
CREATE DATABASE inventory_db;
```

Update [application.properties](file:///C:/Users/HANAN/Downloads/SCM-IMS/SCM-IMS/src/main/resources/application.properties) database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## 2️⃣ Start Backend Server
Run the PowerShell launcher script from the root repository folder:
```powershell
.\run_backend.ps1
```
*If running in a standard Windows Command Prompt (cmd.exe):*
```cmd
powershell -ExecutionPolicy Bypass -File .\run_backend.ps1
```
The backend server runs at: **`http://localhost:8080`**

---

## 3️⃣ Start Frontend Server
Navigate to the frontend folder, install dependencies, and start the development server:
```cmd
cd frontend
npm install
npm start
```
The frontend server runs at: **`http://localhost:3000`**

---

# 📜 License
This project is developed for educational purposes.

---
