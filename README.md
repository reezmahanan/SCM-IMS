# Inventory Management System

A complete, full-stack inventory management system with **JWT authentication**, **role-based access control** (USER/MANAGER/ADMIN), real-time stock tracking, and low-stock alerts.

## 🚀 Features

### Core Features
- **User Authentication** - Register/Login with JWT token-based authentication
- **Role-Based Access Control** - Three roles with different permissions:
  - **USER** - View-only access to inventory
  - **MANAGER** - View + Stock operations (Add/Reduce stock)
  - **ADMIN** - Full control + Product management (Create/Edit/Delete)
- **Product Management** - Add, edit, and delete products with SKU, category, and pricing
- **Inventory Tracking** - Real-time stock level monitoring
- **Stock Operations** - Add stock (IN) and reduce stock (OUT) with reference documentation
- **Low Stock Alerts** - Automatic visual alerts when inventory falls below reorder level
- **Transaction Logging** - Complete audit trail of all stock movements
- **Responsive Dashboard** - Clean, modern white UI with black accents

### Security Features
- JWT token authentication
- Password encryption with BCrypt
- Stateless session management
- CORS configuration for frontend access
- Login audit logging

## 📊 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 LTS | Programming language |
| Spring Boot | 4.0.6 | Web framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | Database ORM |
| Hibernate | 7.2.12 | JPA Provider |
| MySQL | 8.0+ | Relational database |
| JWT (JJWT) | 0.11.5 | Token generation/validation |
| Lombok | Latest | Boilerplate reduction |
| Maven | Latest | Build management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| React Router DOM | 6.20.0 | Navigation |
| Axios | 1.6.0 | HTTP client |
| CSS3 | - | Custom styling |

## 📋 Prerequisites

Ensure you have the following installed:

- **Java 21** ([Download](https://adoptium.net/temurin/releases/?version=21))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **MySQL 8.0+** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Maven** (or use included Maven wrapper)
- **Git** (optional)

## 🔧 Installation

### 1. Clone the Project

```bash
git clone <your-repo-url>
cd inventory-management-system
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd inventory-management
```

**Create MySQL Database:**

```sql
CREATE DATABASE inventory_db;
USE inventory_db;
```

Update database credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Port 8080)

```bash
cd inventory-management
./mvnw spring-boot:run
```

Or on Windows:

```cmd
mvnw.cmd spring-boot:run
```

**Backend will be available at:** `http://localhost:8080`

### Start Frontend (Port 3000)

```bash
cd frontend
npm start
```

**Frontend will be available at:** `http://localhost:3000`

## Usage

### 1. Register a New User
Open http://localhost:3000/register

Fill in:
-Username (unique)
-Password (minimum 6 characters)
-Role: Select from:
-USER - View only
-MANAGER - View + Stock operations
-ADMIN - Full control
-Click Register

### 2. Login
-Enter your credentials
-Click Login
-You'll be redirected to the Dashboard

### 3. Dashboard Overview
-Card	Description
-Total Products	Count of all registered products
-Total Stock Units	Sum of all inventory quantities
-Low Stock Alerts	Number of items below reorder level (10 units)

### 4. Product Management (ADMIN only)
Add Product:
-Click "Add New Product"

Fill in:
-Product Name (required)
-SKU - Unique code (required)
-Category (optional)
-Unit Price (required)
-Click "Save Product"

Edit Product:
-Click "Edit" next to any product
-Update fields
-Click "Save Changes"

Delete Product:
-Click "Delete" next to any product
-Confirm deletion

### 5. Stock Operations (ADMIN/MANAGER only)
-Click "Stock Operations"
-Select a product from dropdown
-Enter quantity
-Add reference (PO/SO number)

Choose:
-Add Stock (IN) - Receive inventory
-Reduce Stock (OUT) - Sell/remove from inventory

### 🔌 API Endpoints
Authentication Endpoints
Method	Endpoint	Description	Access
POST	/api/auth/register	Register new user	Public
POST	/api/auth/login	Login and get JWT token	Public
Product Endpoints
Method	Endpoint	Description	Access
GET	/api/products	Get all products	Authenticated
POST	/api/products	Create new product	ADMIN only
PUT	/api/products/{id}	Update product	ADMIN only
DELETE	/api/products/{id}	Delete product	ADMIN only
Inventory Endpoints
Method	Endpoint	Description	Access
GET	/api/inventory	Get all inventory	Authenticated
GET	/api/inventory/low-stock	Get low stock items	Authenticated
POST	/api/inventory/add	Add stock (IN)	ADMIN/MANAGER
POST	/api/inventory/reduce	Reduce stock (OUT)	ADMIN/MANAGER

```

## Project Structure

```
inventory-management-system/
│
├── backend/                           # Spring Boot Backend
│   ├── src/main/java/com/inventory/
│   │   ├── InventoryManagementApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ProductController.java
│   │   │   └── InventoryController.java
│   │   ├── dto/
│   │   │   ├── AuthRequest.java
│   │   │   ├── AuthResponse.java
│   │   │   └── StockRequest.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Product.java
│   │   │   ├── Inventory.java
│   │   │   ├── StockTransaction.java
│   │   │   ├── LoginAuditLog.java
│   │   │   └── TransactionType.java
│   │   ├── filter/
│   │   │   └── JwtFilter.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   ├── InventoryRepository.java
│   │   │   ├── StockTransactionRepository.java
│   │   │   └── LoginAuditLogRepository.java
│   │   ├── service/
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── UserService.java
│   │   │   ├── ProductService.java
│   │   │   └── InventoryService.java
│   │   └── util/
│   │       └── JwtUtil.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   └── package.json
│
├── database-schema.sql                # Database schema reference
└── README.md                          # This file

```

## UI Design

### Color Scheme
-Background: Pure white (#ffffff)
-Header: Gradient black (#000000 to #1a1a1a)
-Primary Buttons: Black (#000000) with white text
-Success: Green (#27ae60)
-Warning: Orange (#f39c12)
-Danger: Red (#e74c3c)
-Accents: Light gray (#f8f8f8)
-Low Stock Row: Light red (#fff5f5)

### Features
- Clean, modern interface optimized for students
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive modal dialogs
- Real-time data updates

### Security Configuration
-Role-Based Access Control
-Role	Permissions
-USER	View products and inventory only
-MANAGER	View + Add/Reduce stock operations
-ADMIN	Full control + Product CRUD operations

### JWT Configuration
-Token Validity: 24 hours
-Algorithm: HS256
-Storage: Client-side localStorage

## CORS Configuration

Backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:3002` (Alternate port)

To add more origins, update `@CrossOrigin` annotation in `InventoryController.java`.

## Notes

- Database tables are created automatically by Hibernate on first run
- Initial inventory data can be seeded via API calls
- Low stock threshold is set to 10 units (customizable in service layer)
- All dates stored in UTC timezone

## Troubleshooting

### Backend won't start
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify port 8080 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 8080
- Check browser console (F12) for CORS errors
- Ensure frontend is on port 3000

### Registration fails

- Check password length (minimum 6 characters)
- Check if username already exists
- Verify backend is running on port 8080

### 403 Forbidden Error
-You're trying to access an endpoint without proper role
-ADMIN needed for product operations
-MANAGER/ADMIN needed for stock operations

### Port already in use
Find and stop the process:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Real-time dashboard with charts
- [ ] Export/Import inventory data
- [ ] Barcode scanning
- [ ] Email notifications for low stock
- [ ] Multi-warehouse support
- [ ] Inventory forecasting
- [ ] Audit trails & history tracking

##  License

This project is for educational purposes.

## Author

Reezma Hanan[https://github.com/reezmahanan]

---

**Happy Inventorying!**
