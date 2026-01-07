# IPU Trinity - College Registration & Management System

A comprehensive Next.js application for managing college registrations with role-based authentication and approval workflows.

## 🚀 Features

### Two-Role System
- **University Admin**: Manage college registrations, approvals, and rejections
- **College Users**: Secure dashboards for registered colleges

### Authentication & Security
- Email/Password authentication with additional security field (College Code/Admin Code)
- OTP-based email verification
- JWT-based session management
- Role-based route protection via middleware
- Secure password hashing with bcrypt

### College Registration Flow
1. Email verification via OTP
2. Detailed college information submission
3. Admin approval/rejection workflow
4. Email notifications at each step

### Admin Features
- View all registered colleges
- Search colleges by programs or name
- Approve/reject registration requests
- Directly add colleges with auto-generated credentials
- Dashboard with statistics

### Email Notifications
- OTP verification emails
- Registration submission confirmations
- Approval/rejection notifications
- Password change alerts

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB running (local or remote)
- SMTP email server credentials (Gmail recommended)

## 🛠️ Installation

1. **Clone and Navigate**
   ```bash
   cd "c:\Users\harsh\Desktop\next js\ipu-trinity"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   Copy-Item .env.example .env.local
   ```

   Then edit `.env.local` with your actual values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ipu-trinity
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=IPU Trinity <noreply@iputrinity.edu>
   
   ADMIN_EMAIL=admin@iputrinity.edu
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key
   
   APP_URL=http://localhost:3000
   ```

4. **Create Admin Account**
   ```bash
   node utils/createAdmin.js
   ```
   
   This will create an admin account with:
   - **Email**: admin@iputrinity.edu
   - **Password**: Admin@123
   - **Admin Code**: ADMIN-IPU-2026

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
ipu-trinity/
├── app/
│   ├── page.jsx                # College Login (Homepage)
│   ├── signup/                 # College Registration
│   ├── college/                # College Dashboard & Features
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── change-password/
│   ├── admin/                  # Admin Section
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── requests/
│   │   └── colleges/
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   ├── admin/
│   │   └── college/
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── Navbar.jsx
│   └── Footer.jsx
├── config/
│   └── database.js
├── lib/
│   ├── auth.js
│   └── email.js
├── models/
│   ├── Admin.js
│   ├── College.js
│   └── OTP.js
├── utils/
│   └── createAdmin.js
├── middleware.js              # Route protection
├── .env.example
├── package.json
└── README.md
```

## 🔐 User Roles & Access

### College Login (/)
- Email + Password + College Code
- Redirects to `/college/dashboard` after login
- No access to admin routes

### Admin Login (/admin/login)
- Email + Password + Admin Code
- Redirects to `/admin/dashboard` after login
- No access to college routes

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_PASSWORD` in `.env.local`

## 🗄️ Database

The application uses MongoDB with Mongoose ODM. Collections:
- `admins` - University administrators
- `colleges` - College registrations
- `otps` - Email verification codes (auto-expire after 10 minutes)

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer
- **Language**: JavaScript (JSX)

## 🚦 Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | College Login Page |
| `/signup` | Public | College Registration |
| `/admin/login` | Public | Admin Login |
| `/admin/dashboard` | Admin Only | Admin Dashboard |
| `/admin/requests` | Admin Only | Pending Requests |
| `/admin/colleges` | Admin Only | All Colleges |
| `/college/dashboard` | College Only | College Dashboard |
| `/college/change-password` | College Only | Change Password |

## 🔒 Security Features

- HTTP-only cookies for session management
- Password hashing with bcrypt (12 salt rounds)
- JWT token verification on protected routes
- Middleware-based route protection
- OTP expiration (10 minutes)
- Email notifications for security events

## 📝 Important Notes

1. **No route groups in URLs**: URLs are clean (`/college/dashboard`, `/admin/dashboard`)
2. **No cross-navigation**: Admin and college users cannot access each other's routes
3. **Email verification required**: All college registrations must verify email via OTP
4. **Admin approval required**: Colleges can only log in after admin approval
5. **Password security**: Minimum 8 characters, stored hashed, email notification on change

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Ensure MongoDB is running
mongod --version
```

### Email Not Sending
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASSWORD in .env.local
- Ensure 2FA is enabled on Gmail account

### Admin Login Issues
- Run `node utils/createAdmin.js` to recreate admin
- Verify admin code matches exactly

## 👨‍💻 Development

Created by **Harsh** - Full Stack Developer

---

**Need Help?** Check the console logs for detailed error messages during development.
