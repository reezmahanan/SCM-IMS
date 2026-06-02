# 📦 Inventory Management System

A full-stack **Inventory Management System** built with **Spring Boot**, **React**, **MySQL**, and **JWT Authentication**. The system provides secure inventory management with **Role-Based Access Control (RBAC)**, real-time stock monitoring, transaction tracking, and low-stock alerts.

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT-based authentication
* BCrypt password encryption
* Stateless session management
* Secure role-based authorization
* Login audit logging
* CORS configuration for frontend integration

### 👥 Role-Based Access Control

| Role    | Permissions                              |
| ------- | ---------------------------------------- |
| USER    | View products and inventory              |
| MANAGER | View inventory + Add/Reduce stock        |
| ADMIN   | Full access including Product Management |

### 📦 Product Management

* Create products
* Update product details
* Delete products
* SKU management
* Product categorization
* Unit price management

### 📊 Inventory Management

* Real-time stock tracking
* Add stock (IN transactions)
* Reduce stock (OUT transactions)
* Transaction history logging
* Inventory monitoring dashboard

### ⚠️ Low Stock Alerts

* Automatic low-stock detection
* Visual alert indicators
* Reorder level monitoring

---

# 🛠 Technology Stack

## Backend

| Technology      | Version |
| --------------- | ------- |
| Java            | 21 LTS  |
| Spring Boot     | 4.0.6   |
| Spring Security | 6.x     |
| Spring Data JPA | 3.x     |
| Hibernate       | 7.2.12  |
| MySQL           | 8.0+    |
| JWT (JJWT)      | 0.11.5  |
| Lombok          | Latest  |
| Maven           | Latest  |

## Frontend

| Technology       | Version |
| ---------------- | ------- |
| React            | 18.2.0  |
| React Router DOM | 6.20.0  |
| Axios            | 1.6.0   |
| CSS3             | Latest  |

---

# 📁 Project Structure

```text
inventory-management-system/
│
├── backend/
│   ├── src/main/java/com/inventory/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── filter/
│   │   ├── repository/
│   │   ├── service/
│   │   └── util/
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   │
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── database-schema.sql
└── README.md
```

---

# 📋 Prerequisites

Before running the project, install:

* Java 21
* Node.js 18+
* MySQL 8.0+
* Maven
* Git (Optional)

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

---

## 2️⃣ Configure Database

Create a database:

```sql
CREATE DATABASE inventory_db;
```

Update:

```properties
src/main/resources/application.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## 3️⃣ Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```cmd
mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

---

## 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

# 🖥️ System Workflow

## User Registration

1. Open:

```text
http://localhost:3000/register
```

2. Enter:

   * Username
   * Password (minimum 6 characters)
   * Role (USER / MANAGER / ADMIN)

3. Click **Register**

---

## User Login

1. Enter credentials
2. Click **Login**
3. Redirect to Dashboard

---

# 📊 Dashboard

The dashboard displays:

| Card              | Description                   |
| ----------------- | ----------------------------- |
| Total Products    | Number of registered products |
| Total Stock Units | Available stock quantity      |
| Low Stock Alerts  | Products below reorder level  |

---

# 📦 Product Management (ADMIN)

### Add Product

* Product Name
* SKU
* Category
* Unit Price

### Edit Product

* Update product information
* Save changes

### Delete Product

* Remove product permanently

---

# 📈 Stock Operations (ADMIN / MANAGER)

### Add Stock (IN)

* Select product
* Enter quantity
* Add reference number
* Submit

### Reduce Stock (OUT)

* Select product
* Enter quantity
* Add reference number
* Submit

All transactions are automatically logged.

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint           | Access |
| ------ | ------------------ | ------ |
| POST   | /api/auth/register | Public |
| POST   | /api/auth/login    | Public |

---

## Products

| Method | Endpoint           | Access        |
| ------ | ------------------ | ------------- |
| GET    | /api/products      | Authenticated |
| POST   | /api/products      | ADMIN         |
| PUT    | /api/products/{id} | ADMIN         |
| DELETE | /api/products/{id} | ADMIN         |

---

## Inventory

| Method | Endpoint                 | Access          |
| ------ | ------------------------ | --------------- |
| GET    | /api/inventory           | Authenticated   |
| GET    | /api/inventory/low-stock | Authenticated   |
| POST   | /api/inventory/add       | ADMIN / MANAGER |
| POST   | /api/inventory/reduce    | ADMIN / MANAGER |

---

# 🎨 User Interface

### Color Palette

| Element           | Color          |
| ----------------- | -------------- |
| Background        | #FFFFFF        |
| Header            | Black Gradient |
| Primary Buttons   | #000000        |
| Success           | #27AE60        |
| Warning           | #F39C12        |
| Danger            | #E74C3C        |
| Accent Background | #F8F8F8        |

### UI Features

* Responsive Design
* Modern Dashboard
* Smooth Animations
* Clean White Theme
* Mobile Friendly

---

# 🔒 JWT Configuration

| Property     | Value         |
| ------------ | ------------- |
| Algorithm    | HS256         |
| Token Expiry | 24 Hours      |
| Storage      | Local Storage |

---

# 🌐 CORS Configuration

Allowed Origins:

```text
http://localhost:3000
http://localhost:3002
```

To add more origins, update the CORS configuration in the backend.

---

# 🧪 Troubleshooting

### Backend Not Starting

✔ Ensure MySQL is running

✔ Verify database credentials

✔ Confirm port 8080 is available

---

### Frontend Cannot Connect

✔ Backend must be running

✔ Check browser console for CORS issues

✔ Verify API base URL

---

### Registration Fails

✔ Username must be unique

✔ Password minimum 6 characters

✔ Backend service must be active

---

### 403 Forbidden

You do not have permission for the requested operation.

| Operation          | Required Role   |
| ------------------ | --------------- |
| Product Management | ADMIN           |
| Stock Operations   | ADMIN / MANAGER |

---

# 🚀 Future Enhancements

* Dark Mode
* Barcode Scanner Integration
* Export & Import Data
* Email Notifications
* Dashboard Analytics
* Inventory Forecasting
* Multi-Warehouse Support
* Advanced Reporting

---

# 📜 License

This project is developed for educational purposes.

---

# 👩‍💻 Author

**Reezma Hanan**

GitHub: https://github.com/reezmahanan

---

⭐ If you found this project useful, consider giving it a star.