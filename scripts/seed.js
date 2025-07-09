// scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('../src/lib/models/Admin.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function seedAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding.');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // Default admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists to prevent duplicates
    const existingAdmin = await Admin.findOne({ email: adminEmail }); // <-- USE Admin MODEL HERE
    if (existingAdmin) {
      console.log(`Admin user '${adminEmail}' already exists. Skipping.`);
      return;
    }

    const adminUser = new Admin({
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin'
    });

    await adminUser.save();
    console.log(`Admin user '${adminEmail}' added successfully.`);

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seedAdminUser();