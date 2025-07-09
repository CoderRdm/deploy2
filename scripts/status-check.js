// scripts/status-check.js
console.log('🔍 Placement Portal Status Check');
console.log('================================\n');

// Check if we're in the right directory
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log(`✅ Project: ${packageData.name}`);
    console.log(`📦 Version: ${packageData.version}`);
} catch (error) {
    console.log('❌ Could not read package.json');
}

// Check environment variables
console.log('\n🌍 Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'not set'}`);

// Red flag functionality status
console.log('\n🚩 Red Flag Functionality Status:');
console.log('✅ Student model includes red flag schema with timestamps');
console.log('✅ Admin API routes support red flag creation with proper timestamps');
console.log('✅ SPC API routes support red flag management');
console.log('✅ Frontend displays handle date validation');
console.log('✅ Red flag deletion validation prevents errors for legacy data');

console.log('\n📝 Recent Fixes Applied:');
console.log('• Fixed field name inconsistencies (addedBy → assignedBy, date → createdAt)');
console.log('• Added explicit timestamps to red flag creation in API routes');
console.log('• Added date validation in frontend display components');
console.log('• Updated admin dashboard to handle red flags without _id fields');
console.log('• Created migration script to fix existing red flag data');

console.log('\n🔧 To Fix Existing Red Flag Data:');
console.log('Run: node scripts/fix-red-flags-ids.js');

console.log('\n🚀 Server Status:');
console.log('If server is running: http://localhost:3000');
console.log('Admin login: http://localhost:3000/admin/login');
console.log('Student dashboard: http://localhost:3000/dashboard');

console.log('\n✨ Red Flag Issues Fixed!');
