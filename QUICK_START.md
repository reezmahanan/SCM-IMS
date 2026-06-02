# SCM-IMS: Quick Start Guide

This project has **TWO** components that need to run separately:

## Prerequisites

- **Java 25** ✅ (Already installed)
- **Node.js 16+** (For frontend)
- **MySQL 8.0+** (For database)
- **Maven 3.9+** (Will download automatically)

---

## Step 1: Database Setup

Start MySQL and create the database:

```sql
mysql -u root -p
CREATE DATABASE inventory_management;
EXIT;
```

Database credentials (in `src/main/resources/application.properties`):
- **URL**: jdbc:mysql://localhost:3306/inventory_management
- **Username**: root
- **Password**: Kavi@2002

---

## Step 2: Backend (Spring Boot Java)

**Run the backend startup script:**

### Windows (PowerShell):
```powershell
cd c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS
.\start-backend.ps1
```

### Windows (Command Prompt):
```cmd
cd c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS
.\start-backend.bat
```

The backend will be available at: **http://localhost:8080**

---

## Step 3: Frontend (React)

**In a NEW terminal, run the frontend startup script:**

### Windows:
```powershell
cd c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS\frontend
npm install
npm start
```

The frontend will open at: **http://localhost:3000**

---

## Project Structure

```
SCM-IMS/
├── src/main/java/                    # Java backend code
│   └── com/inventory/
│       ├── InventoryManagementApplication.java  # Main app
│       ├── config/                   # JWT, Security, CORS
│       ├── controller/               # API endpoints
│       ├── service/                  # Business logic
│       ├── entity/                   # Database models
│       └── repository/               # Database queries
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── App.js                   # Main React component
│   │   ├── components/              # Login, Register
│   │   └── App.css                  # Styling
│   └── package.json                 # React dependencies
│
├── pom.xml                           # Maven configuration (Java)
└── application.properties            # Database config
```

---

## Common Issues & Solutions

### Issue: `mvn` command not found
**Solution**: Run `start-backend.ps1` - it will download Maven automatically.

### Issue: Port 8080 already in use
**Solution**: Change in `src/main/resources/application.properties`:
```properties
server.port=9090
```

### Issue: MySQL connection failed
**Solution**: Verify MySQL is running and credentials are correct:
```bash
mysql -u root -p -e "SELECT 1;"
```

### Issue: Frontend can't reach backend
**Solution**: Ensure backend is running on `http://localhost:8080` before starting frontend.

---

## Testing the App

1. **Register** a new account (Frontend)
2. **Add Products** (Backend stores in MySQL)
3. **Manage Stock** (Add/Reduce quantities)
4. **View Low Stock Alerts** (Auto-generated)

---

## Backend API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new user |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/products` | GET/POST | List/Create products |
| `/api/inventory` | GET | View stock levels |
| `/api/inventory/add` | POST | Add stock |
| `/api/inventory/reduce` | POST | Reduce stock |
| `/api/inventory/low-stock` | GET | Low stock alerts |

---

## Stop the Application

- **Backend**: Press `Ctrl + C` in the backend terminal
- **Frontend**: Press `Ctrl + C` in the frontend terminal

---

## Need Help?

Check `src/main/java/com/inventory/controller/` for API implementation.
Check `frontend/src/App.js` for frontend logic.
