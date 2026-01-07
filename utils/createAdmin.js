// Run this with: node utils/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Model (inline for this script)
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  adminCode: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ipu-trinity';
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    // Admin details
    const adminData = {
      email: 'admin@iputrinity.edu',
      password: 'Admin@123',
      name: 'University Admin',
      adminCode: 'ADMIN-IPU-2026',
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', adminData.email);
      console.log('Admin Code:', existingAdmin.adminCode);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = await Admin.create({
      email: adminData.email,
      password: hashedPassword,
      name: adminData.name,
      adminCode: adminData.adminCode,
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('\n📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('🔐 Admin Code:', adminData.adminCode);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('⚠️  Store the Admin Code securely!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
