// scripts/create-admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../src/lib/models/Admin.js';
import dotenv from 'dotenv';
import { createInterface } from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for admin creation.');

    console.log('\n🔧 Create New Admin User');
    console.log('========================');

    const email = await askQuestion('Enter admin email: ');
    const name = await askQuestion('Enter admin name: ');
    const password = await askPassword('Enter admin password: ');
    const roleChoice = await askQuestion('Enter role (1=admin, 2=spc) [default: 1]: ');
    
    const role = roleChoice === '2' ? 'spc' : 'admin';

    // Validate email format
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format.');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      console.log(`❌ Admin user '${email}' already exists.`);
      const overwrite = await askQuestion('Do you want to update this admin? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Operation cancelled.');
        return;
      }
      
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
    console.log(`Password: [hidden]`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
    rl.close();
  }
}

createAdminUser();
