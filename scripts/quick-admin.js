// scripts/quick-admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../src/lib/models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createQuickAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for admin creation.');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('❌ Usage: npm run quick-admin <email> <name> <password> [role]');
      console.log('   Example: npm run quick-admin admin@test.com "Test Admin" password123 admin');
      console.log('   Role can be: admin or spc (default: admin)');
      process.exit(1);
    }

    const [email, name, password, role = 'admin'] = args;

    // Validate role
    if (!['admin', 'spc'].includes(role)) {
      console.error('❌ Role must be either "admin" or "spc"');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format.');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      console.log(`⚠️  Admin user '${email}' already exists. Updating...`);
      
      // Update existing admin
      const hashedPassword = await bcrypt.hash(password, 10);
      existingAdmin.name = name;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = role;
      await existingAdmin.save();
      console.log(`✅ Admin user '${email}' updated successfully!`);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = new Admin({
        email: email,
        password: hashedPassword,
        name: name,
        role: role
      });

      await adminUser.save();
      console.log(`✅ Admin user '${email}' created successfully!`);
    }

    console.log('\n📋 Admin Details:');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

createQuickAdmin();
