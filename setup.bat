@echo off
REM CarWheels.com - Quick Setup Script for Windows

echo.
echo 🚗 CarWheels.com - Quick Setup
echo ================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

echo ✓ Node.js found

REM Setup backend
echo.
echo Setting up backend...
cd backend
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo ✓ Created backend\.env file
    echo ⚠️  Please edit backend\.env with your PostgreSQL credentials
) else (
    echo ✓ backend\.env already exists
)

REM Initialize database
echo Initializing database...
call npm run db:migrate
call npm run db:seed

echo ✓ Database initialized with sample data

REM Setup frontend
echo.
echo Setting up frontend...
cd ..\frontend
call npm install

REM Create .env.local file if it doesn't exist
if not exist .env.local (
    copy .env.example .env.local
    echo ✓ Created frontend\.env.local file
) else (
    echo ✓ frontend\.env.local already exists
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your PostgreSQL connection details
echo 2. Run: npm run dev
echo 3. Backend: http://localhost:5000
echo 4. Frontend: http://localhost:3000
echo.
echo Or use Docker:
echo docker-compose up -d
echo.
echo For more information, see README.md
echo.
pause
