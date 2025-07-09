// scripts/inspect-red-flags.js
import mongoose from 'mongoose';
import { Student } from '../src/lib/models/Student.js';
import connectToDb from '../src/lib/db.js';

async function inspectRedFlags() {
    try {
        await connectToDb();
        console.log('✅ Connected to MongoDB successfully!');

        // Find students with red flags
        const studentsWithRedFlags = await Student.find({ 
            redflags: { $exists: true, $ne: [] }
        });

        console.log(`\n📊 Found ${studentsWithRedFlags.length} students with red flags\n`);

        if (studentsWithRedFlags.length === 0) {
            console.log('No students with red flags found.');
            return;
        }

        studentsWithRedFlags.forEach((student, index) => {
            console.log(`\n🔍 Student ${index + 1}: ${student.name} (${student.student_id})`);
            console.log(`Email: ${student.email}`);
            console.log(`Red flags count: ${student.redflags.length}`);
            
            student.redflags.forEach((flag, flagIndex) => {
                console.log(`\n  Red Flag ${flagIndex + 1}:`);
                console.log(`    _id: ${flag._id || 'MISSING'}`);
                console.log(`    reason: "${flag.reason || 'EMPTY/MISSING'}"`);
                console.log(`    assignedBy: "${flag.assignedBy || 'MISSING'}"`);
                console.log(`    assignedById: "${flag.assignedById || 'MISSING'}"`);
                console.log(`    createdAt: ${flag.createdAt || 'MISSING'}`);
                console.log(`    updatedAt: ${flag.updatedAt || 'MISSING'}`);
                console.log(`    Raw data:`, JSON.stringify(flag, null, 2));
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📊 Database connection closed');
    }
}

inspectRedFlags();
