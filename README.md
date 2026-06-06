# 📦 Inventory Management System

A full-stack **Inventory Management System** built with **Spring Boot**, **React**, and **MySQL**. The system provides real-time stock monitoring, transaction tracking, product catalog management, and low-stock alerts without authentication barriers.

---

## 🚀 Features

### ⚡ General Features

* CORS configuration for frontend-backend integration
* No login/registration barrier - access dashboard and endpoints directly
* Real-time stock monitoring

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
| --------------- |---------|
| Java            | 17 LTS  |
| Spring Boot     | 4.0.6   |
| Spring Security | 6.x     |
| Spring Data JPA | 3.x     |
| Hibernate       | 7.2.12  |
| MySQL           | 8.0+    |
| Lombok          | Latest  |
| Maven           | Latest  |

## Frontend

| Technology       | Version |
| ---------------- | ------- |
| React            | 18.2.0  |
| React Router DOM | 6.20.0  |
| Axios            | 1.6.0   |

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
│   └── README.md
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
spring.datasource.username=your_username
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

Open:

```text
http://localhost:3000
```

This will load the Dashboard immediately. You can now manage products and update stock levels directly.

---

# 📊 Dashboard

The dashboard displays:

| Card              | Description                   |
| ----------------- | ----------------------------- |
| Total Products    | Number of registered products |
| Total Stock Units | Available stock quantity      |
| Low Stock Alerts  | Products below reorder level  |

---

# 📦 Product Management

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

# 📈 Stock Operations

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

## Products

| Method | Endpoint           | Access |
| ------ | ------------------ | ------ |
| GET    | /api/products      | Public |
| POST   | /api/products      | Public |
| PUT    | /api/products/{id} | Public |
| DELETE | /api/products/{id} | Public |

---

## Inventory

| Method | Endpoint                 | Access |
| ------ | ------------------------ | ------ |
| GET    | /api/inventory           | Public |
| GET    | /api/inventory/low-stock | Public |
| POST   | /api/inventory/add       | Public |
| POST   | /api/inventory/reduce    | Public |

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


⭐ If you found this project useful, consider giving it a star.