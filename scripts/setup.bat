@echo off
REM Local development setup script for Sports Monitor (Windows)

setlocal enabledelayedexpansion

echo 🚀 Sports Monitor - Local Setup ^(Windows^)
echo ===================================================

REM Check prerequisites
echo.
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create .env files
echo.
echo 📝 Creating .env files...

if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env
) else (
    echo ⏭️  backend\.env already exists
)

if not exist "frontend\.env" (
    copy frontend\.env.example frontend\.env
    echo ✅ Created frontend\.env
) else (
    echo ⏭️  frontend\.env already exists
)

REM Start Docker Compose
echo.
echo 🐳 Starting Docker Compose services...
docker-compose up -d

REM Wait for services
echo.
echo ⏳ Waiting for services to be healthy ^(10 seconds^)...
timeout /t 10 /nobreak

REM Install dependencies
echo.
echo 📦 Installing dependencies...

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo ✅ Dependencies installed

REM Build backend
echo.
echo 🔨 Building backend...
cd backend
call npm run build
cd ..

echo ✅ Backend built

REM Summary
echo.
echo ===================================================
echo ✅ Setup Complete!
echo ===================================================
echo.
echo 📍 Access the application:
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo   Health:    http://localhost:3001/health
echo.
echo 🔧 Useful commands:
echo.
echo   Start services:    docker-compose up -d
echo   Stop services:     docker-compose down
echo   View logs:         docker-compose logs -f [backend or postgres or redis]
echo   Dev backend:       cd backend ^&^& npm run dev
echo   Dev frontend:      cd frontend ^&^& npm run dev
echo.
echo 📚 Next steps:
echo.
echo   1. Check out the README.md for detailed documentation
echo   2. Configure AWS credentials for AI features
echo   3. Try the interactive map at http://localhost:3000
echo   4. Read ARCHITECTURE.md for system design
echo.
pause
