// scripts/fix-red-flags-ids.js
import mongoose from 'mongoose';
import { Student } from '../src/lib/models/Student.js';
import connectToDb from '../src/lib/db.js';

async function fixRedFlagIds() {
    try {
        await connectToDb();
        console.log('✅ Connected to MongoDB successfully!');

        // Find all students with red flags
        const studentsWithRedFlags = await Student.find({ 
            redflags: { $exists: true, $ne: [] }
        });

        console.log(`Found ${studentsWithRedFlags.length} students with red flags`);

        let updatedCount = 0;
        
        for (const student of studentsWithRedFlags) {
            let needsUpdate = false;
            
            // Check if any red flags are missing _id fields
            const updatedRedFlags = student.redflags.map(flag => {
                if (!flag._id) {
                    needsUpdate = true;
                    return {
                        ...flag,
                        _id: new mongoose.Types.ObjectId(), // Add a new ObjectId
                        createdAt: flag.createdAt || new Date(),
                        updatedAt: flag.updatedAt || new Date()
                    };
                }
                return flag;
            });

            if (needsUpdate) {
                student.redflags = updatedRedFlags;
                await student.save();
                updatedCount++;
                console.log(`✅ Updated red flags for student: ${student.name} (${student.student_id})`);
            }
        }

        console.log(`\n📊 Migration completed!`);
        console.log(`- Students processed: ${studentsWithRedFlags.length}`);
        console.log(`- Students updated: ${updatedCount}`);
        
        if (updatedCount === 0) {
            console.log('🎉 All red flags already have proper _id fields!');
        }

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
    }
}

// Run the migration
fixRedFlagIds();
