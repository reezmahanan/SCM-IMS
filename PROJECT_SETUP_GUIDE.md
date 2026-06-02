# ✅ SCM-IMS Project - Complete Setup & Running Guide

## 🎯 Project Status: READY TO RUN ✓

Your project has been **fully fixed and organized**. All errors have been resolved!

---

## 📦 What Was Fixed

✅ **Fixed pom.xml** - Corrected invalid test dependencies  
✅ **Fixed Java version** - Updated to Java 25 (compatible with your system)  
✅ **Created automated startup scripts** - No manual Maven setup needed  
✅ **Project structure** - Properly organized  
✅ **Dependencies** - All validated and working  

---

## 🚀 QUICK START (2 Minutes)

### Step 1: Database Setup (One Time)

```cmd
mysql -u root -p
CREATE DATABASE inventory_management;
EXIT;
```

### Step 2: Start Backend (Terminal 1)

```cmd
cd c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS
.\start-backend.bat
```

**✅ Backend will start at: http://localhost:8080**

### Step 3: Start Frontend (Terminal 2)

```cmd
cd c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS
.\start-frontend.bat
```

**✅ Frontend will open at: http://localhost:3000**

---

## 📂 Project Structure

```
SCM-IMS/
│
├── 📁 src/main/java/com/inventory/
│   ├── InventoryManagementApplication.java    ← Main entry point
│   ├── 📁 config/                             ← JWT & Security config
│   ├── 📁 controller/                         ← REST API endpoints
│   ├── 📁 service/                            ← Business logic
│   ├── 📁 entity/                             ← Database models
│   └── 📁 repository/                         ← Data access
│
├── 📁 frontend/                               ← React app
│   ├── src/
│   │   ├── App.js                             ← Main component
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   └── App.css
│   └── package.json
│
├── 📝 pom.xml                                 ← Maven configuration ✅ FIXED
├── 📝 start-backend.bat                       ← Backend startup script
├── 📝 start-backend.ps1                       ← Backend PowerShell version
├── 📝 start-frontend.bat                      ← Frontend startup script
├── 📝 start-frontend.ps1                      ← Frontend PowerShell version
└── 📝 QUICK_START.md                          ← This file
```

---

## 🔧 Configuration Files

### Backend Configuration
**File:** `src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_management
spring.datasource.username=root
spring.datasource.password=Kavi@2002

# Server
server.port=8080

# Hibernate auto-creates tables from JPA entities
spring.jpa.hibernate.ddl-auto=update
```

---

## 📡 API Endpoints

All endpoints are secured with JWT tokens. The frontend handles authentication automatically.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/products` | GET | List all products |
| `/api/products` | POST | Add new product |
| `/api/products/{id}/image` | POST | Upload product image |
| `/api/inventory` | GET | View all inventory |
| `/api/inventory/add` | POST | Add stock (IN) |
| `/api/inventory/reduce` | POST | Reduce stock (OUT) |
| `/api/inventory/low-stock` | GET | Get low stock alerts |

---

## 👥 Test Credentials

**Create your own account** by registering in the app!

Or use:
- **Username:** testuser
- **Password:** test123
- **Role:** USER (or ADMIN)

---

## ⚙️ What Happens When You Start

### Backend (start-backend.bat)
1. ✅ Auto-detects Java 25 from system
2. ✅ Downloads Maven (only first time)
3. ✅ Compiles Java source code
4. ✅ Connects to MySQL database
5. ✅ Auto-creates tables from JPA entities
6. ✅ Starts Tomcat server on port 8080
7. ✅ Ready to accept API requests

### Frontend (start-frontend.bat)
1. ✅ Checks Node.js is installed
2. ✅ Installs dependencies (only first time)
3. ✅ Starts React dev server on port 3000
4. ✅ Opens browser automatically

---

## 🛑 Stopping the Application

| Component | How to Stop |
|-----------|------------|
| Backend | Press `Ctrl + C` in backend terminal |
| Frontend | Press `Ctrl + C` in frontend terminal |
| MySQL | Windows: `services.msc` → Stop MySQL service |

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Make sure MySQL is running
```cmd
mysql -u root -p -e "SELECT 1;"
```

### Issue: Port 8080 already in use
**Solution:** Change port in `src/main/resources/application.properties`:
```properties
server.port=9090
```

### Issue: Frontend not connecting to backend
**Solution:** Make sure backend is running BEFORE starting frontend

### Issue: "Node.js not found"
**Solution:** Download from https://nodejs.org/ and install

### Issue: "Java not found"
**Solution:** Download Java 21+ from https://adoptium.net/

---

## 📋 Features

✅ **User Authentication** - Secure JWT-based login/register  
✅ **Product Management** - Add products with SKU, price, category  
✅ **Inventory Tracking** - Real-time stock level monitoring  
✅ **Low Stock Alerts** - Automatic warnings for reorder levels  
✅ **Stock Operations** - IN (receive) and OUT (sell) transactions  
✅ **Product Images** - Upload and store product photos  
✅ **Search & Filter** - Find products by name, SKU, category, price  
✅ **Responsive UI** - Modern, clean white interface with black accents  
✅ **MySQL Database** - Reliable data persistence  

---

## 📊 Database Schema

### Tables (Auto-created)
- **users** - User accounts & roles
- **products** - Product catalog
- **inventory** - Stock levels with reorder points
- **stock_transactions** - History of IN/OUT operations

---

## 🔒 Security Features

- ✅ **JWT Token-based Authentication** (24-hour expiry)
- ✅ **BCrypt Password Encryption**
- ✅ **CORS** enabled for frontend (localhost:3000)
- ✅ **Role-based Access Control** (USER, ADMIN)
- ✅ **Secured API endpoints** (requires JWT token)

---

## 📝 Development Notes

### Backend Stack
- Java 25
- Spring Boot 4.0.6
- Spring Data JPA
- Hibernate 7.2.12
- MySQL 8.0
- JWT (JSON Web Tokens)
- Maven 3.9.6

### Frontend Stack
- React 19.2.5
- Axios (HTTP client)
- CSS3 (custom styling)
- Node.js package management

---

## 🎓 Next Steps

1. **Register** a new account in the app
2. **Add Products** - Test the product management
3. **Upload Images** - Try product image upload
4. **Manage Stock** - Add/reduce inventory
5. **Check Alerts** - View low stock warnings
6. **Explore API** - Check endpoints in backend code

---

## 📞 File Locations

| Component | Location |
|-----------|----------|
| Backend Java | `src/main/java/com/inventory/` |
| Frontend React | `frontend/src/` |
| Database Config | `src/main/resources/application.properties` |
| Backend Startup | `.\start-backend.bat` |
| Frontend Startup | `.\start-frontend.bat` |
| Uploaded Images | `uploads/` folder |

---

## ✨ Success Indicators

When everything is working:

✅ **Backend** shows: "Tomcat started on port 8080"  
✅ **Frontend** shows: "webpack compiled successfully"  
✅ Browser opens http://localhost:3000 automatically  
✅ You can register and login  
✅ You can add products and manage inventory  

---

## 🎉 You're All Set!

Your project is **fully functional and ready to use**!

Just run:
```cmd
.\start-backend.bat    # Terminal 1
.\start-frontend.bat   # Terminal 2 (new)
```

Enjoy building! 🚀
