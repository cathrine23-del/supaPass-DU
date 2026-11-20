SupaPass DU
============

Campus event hub for Daystar University.

Requirements
------------
- Windows
- Git
- XAMPP with Apache, MySQL and PHP
- Internet access for Font Awesome icons

Clone and run
-------------
1. Clone this repository into:
   C:\xampp\htdocs\SupaPass-DU

2. Open XAMPP Control Panel and start Apache and MySQL.

3. Run setup.bat once. It creates the supapass_du database and the tables
   required by the app. It does not import real user, event or booking records.

   The script expects XAMPP at C:\xampp and the default XAMPP MySQL root
   account with a blank password. If XAMPP is installed elsewhere, set
   XAMPP_MYSQL to the full path of its mysql.exe before running setup.bat.

4. Open:
   http://localhost/SupaPass-DU/

5. Register an account in the app. Use the organizer role to create events.

Database
--------
The starter schema is database\supapass_du.sql. It creates the users, events
and bookings tables. The SQL file contains schema only; no existing database
records or credentials are included.

The app's local connection settings are in config\database.php. They use
localhost, the supapass_du database, and the default XAMPP root account.
If you change local credentials, do not commit passwords or other secrets.

setup.bat is intended for a fresh local setup. It uses CREATE TABLE IF NOT
EXISTS and will not drop existing tables or records. It will not update an
already-existing table if the schema changes; apply and share a migration for
future schema changes.

Files
-----
index.html       Main page.
style.css        Site styling.
app.js           Front-end interactions and API calls.
api\             PHP endpoints for accounts, events and bookings.
config\          Local PHP database connection.
database\        Shareable SQL schema.
