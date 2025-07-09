// scripts/list-admins.js
import mongoose from 'mongoose';
import { Admin } from '../src/lib/models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function listAdmins() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for listing admins.');

    const admins = await Admin.find({}).select('-password');
    
    if (admins.length === 0) {
      console.log('📭 No admin users found.');
    } else {
      console.log('\n👥 Admin Users:');
      console.log('================');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Error listing admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
}

listAdmins();
