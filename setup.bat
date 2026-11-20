@echo off
setlocal

set "MYSQL_EXE=%XAMPP_MYSQL%"
if not defined MYSQL_EXE set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"
set "SQL_FILE=%~dp0database\supapass_du.sql"

if not exist "%MYSQL_EXE%" (
    echo MySQL client not found: "%MYSQL_EXE%"
    echo Install XAMPP at C:\xampp, or set XAMPP_MYSQL to the full path of mysql.exe.
    exit /b 1
)

if not exist "%SQL_FILE%" (
    echo Database setup file not found: "%SQL_FILE%"
    exit /b 1
)

echo Creating the SupaPass DU database and tables...
"%MYSQL_EXE%" --host=localhost --user=root < "%SQL_FILE%"
if errorlevel 1 (
    echo Database setup failed. Make sure MySQL is running in XAMPP and root uses a blank password.
    exit /b 1
)

echo Database setup completed.
exit /b 0
