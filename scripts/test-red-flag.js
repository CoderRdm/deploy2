// scripts/test-red-flag.js
import mongoose from 'mongoose';
import { Student } from '../src/lib/models/Student.js';
import connectToDb from '../src/lib/db.js';

async function addTestRedFlag() {
    try {
        await connectToDb();
        console.log('✅ Connected to MongoDB successfully!');

        // Find the first student
        const student = await Student.findOne({});
        
        if (!student) {
            console.log('❌ No students found in the database');
            return;
        }

        console.log(`Found student: ${student.name} (${student.email})`);
        console.log(`Current red flags: ${student.redflags?.length || 0}`);

        // Add a test red flag
        const testRedFlag = {
            reason: 'Test red flag for display verification',
            assignedBy: 'admin@example.com',
            assignedById: 'admin123'
        };

        student.redflags.push(testRedFlag);
        await student.save();

        console.log(`✅ Added test red flag to ${student.name}`);
        console.log(`New red flags count: ${student.redflags.length}`);
        console.log('Latest red flag:', student.redflags[student.redflags.length - 1]);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
    }
}

addTestRedFlag();
