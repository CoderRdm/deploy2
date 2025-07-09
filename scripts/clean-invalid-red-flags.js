// scripts/clean-invalid-red-flags.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Simple Student schema for cleanup
const studentSchema = new mongoose.Schema({
    student_id: String,
    name: String,
    email: String,
    redflags: [{
        reason: String,
        assignedBy: String,
        assignedById: String,
        createdAt: Date,
        updatedAt: Date
    }]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

async function cleanInvalidRedFlags() {
    try {
        // Connect to database
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI not found in environment variables');
            console.log('Make sure you have a .env.local file with MONGODB_URI');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!');

        // Find all students with red flags
        const students = await Student.find({ redflags: { $exists: true, $ne: [] } });
        console.log(`\n📊 Found ${students.length} students with red flags`);

        let cleanedCount = 0;

        for (const student of students) {
            let hasInvalidFlags = false;
            
            // Check for invalid red flags (missing reason, assignedBy, or timestamps)
            const validRedFlags = student.redflags.filter(flag => {
                const isValid = flag.reason && 
                               flag.reason.trim() !== '' && 
                               flag.assignedBy && 
                               flag.createdAt;
                
                if (!isValid) {
                    hasInvalidFlags = true;
                    console.log(`❌ Invalid red flag found for ${student.name}:`, {
                        reason: flag.reason || 'MISSING',
                        assignedBy: flag.assignedBy || 'MISSING',
                        createdAt: flag.createdAt || 'MISSING'
                    });
                }
                
                return isValid;
            });

            if (hasInvalidFlags) {
                student.redflags = validRedFlags;
                await student.save();
                cleanedCount++;
                console.log(`✅ Cleaned red flags for ${student.name} (${student.student_id})`);
                console.log(`   Remaining valid red flags: ${validRedFlags.length}`);
            }
        }

        console.log(`\n📊 Cleanup Summary:`);
        console.log(`- Students processed: ${students.length}`);
        console.log(`- Students cleaned: ${cleanedCount}`);
        
        if (cleanedCount === 0) {
            console.log('🎉 No invalid red flags found!');
        } else {
            console.log('✨ Invalid red flags removed successfully!');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
    }
}

cleanInvalidRedFlags();
