# Admin User Information

## New Admin Account Details

**Created:** February 24, 2026

### Login Credentials
- **Email:** `adminbhanu@gmail.com`
- **Password:** `admin`
- **Role:** ADMIN
Hash: $2a$10$slYQmyNdGzin7olVN3p5be4DhxJm.P5escVIYeIVgkqsYVxMKopGm (the one actually in the database)
SQL commands: Updated with both DELETE statements
### Database Information
- **Database:** mvecommerce (Neon)
- **First Name:** Admin
- **Last Name:** Bhanu
- **Phone:** 1234567890
- **Status:** Active

### SQL Commands Used

```sql
-- Delete both old and new admin users
DELETE FROM users WHERE email = 'admin@gmail.com';
DELETE FROM users WHERE email = 'adminbhanu@gmail.com';

-- Create new admin user
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) 
VALUES ('adminbhanu@gmail.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DhxJm.P5escVIYeIVgkqsYVxMKopGm', 'Admin', 'Bhanu', '1234567890', 'ADMIN', true, NOW(), NOW());
```

### How to Login
1. Go to your frontend application
2. Navigate to Admin Login page
3. Enter the credentials above
4. You will have access to the admin dashboard

### Password Hash
- **Algorithm:** bcrslYQmyNdGzin7olVN3p5be4DhxJm.P5escVIYeIVgkqsYVxMKopGm
- **Hash:** `$2a$10$J7nWjNq7JJ9H.Z5d8d5Hc.8KzkG9p8nK9r7mJ5s2bZ3q6K7J8L9M`

---

**⚠️ Keep this file secure and don't commit it to public repositories!**



#postman or curl

Yes, you need to run this in PowerShell (not regular CMD). Here's how:

On Windows:

Open PowerShell (not Command Prompt)

Press Win + X → Select "Windows PowerShell" or "Terminal"
Make sure your backend is running (should already be running on port 6969)

Paste this entire command into PowerShell:

$body = @{
    email = "adminbhanu@gmail.com"
    password = "admin"
    firstName = "Admin"
    lastName = "Bhanu"
    phone = "1234567890"
} | ConvertTo-Json

curl -X POST http://localhost:6969/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body


  Press Enter and wait for the response
OR if you prefer, use Postman instead:

Open Postman
Create a new POST request
URL: http://localhost:6969/api/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
    "email": "adminbhanu@gmail.com",
    "password": "admin",
    "firstName": "Admin",
    "lastName": "Bhanu",
    "phone": "1234567890"
}
Click Send