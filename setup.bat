@echo off
REM Sports Monitor - Quick Setup Script for Windows
REM Run this script to quickly set up the entire sports-monitor project

echo.
echo 🚀 Sports Monitor - Quick Setup
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Starting services with Docker Compose...
        docker-compose up -d
        
        echo.
        echo Waiting for services to be ready...
        timeout /t 10 /nobreak
        
        echo Seeding database with demo data...
        docker-compose exec -T backend npm run db:seed
        
        echo.
        echo ✅ All services are running!
        echo.
        echo Access points:
        echo   - Frontend: http://localhost:3000
        echo   - Backend API: http://localhost:3001
        echo   - API Docs (Swagger): http://localhost:3001/api-docs
        echo.
        echo Demo Credentials:
        echo   Email: john_doe@example.com
        echo   Password: SecurePass123!
        echo.
        goto end
    )
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)

echo Installing dependencies...
echo   Backend...
cd backend
call npm install
cd ..

echo   Frontend...
cd frontend
call npm install
cd ..

echo.
echo Setting up database...
cd backend
call npm run db:migrate
call npm run db:seed
cd ..

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo.
echo   Terminal 1 - Backend:
echo     cd backend ^&^& npm run dev
echo.
echo   Terminal 2 - Frontend:
echo     cd frontend ^&^& npm run dev
echo.
echo Then access:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:3001
echo   - API Docs: http://localhost:3001/api-docs
echo.
echo Demo Credentials:
echo   Email: john_doe@example.com
echo   Password: SecurePass123!
echo.

:end
echo For full setup instructions, see docs/SETUP.md
echo For implementation details, see IMPLEMENTATION.md
pause
