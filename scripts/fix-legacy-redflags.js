// scripts/fix-legacy-redflags.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Database connection function
async function connectToDb() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
}

// Define the Student schema here since we can't easily import ES modules in this context
const redFlagSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    assignedBy: {
        type: String,
        required: true,
        trim: true,
    },
    assignedById: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    redflags: {
        type: [redFlagSchema],
        default: []
    },
    // ... other fields
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

async function fixLegacyRedFlags() {
    try {
        await connectToDb();
        console.log('Connected to database');

        // Find all students with red flags
        const studentsWithRedFlags = await Student.find({
            redflags: { $exists: true, $ne: [] }
        });

        console.log(`Found ${studentsWithRedFlags.length} students with red flags`);

        let fixedCount = 0;
        let studentsFixed = 0;

        for (const student of studentsWithRedFlags) {
            let needsUpdate = false;
            const updatedRedFlags = [];

            console.log(`\nProcessing student: ${student.name} (${student.student_id})`);
            console.log(`Red flags: ${student.redflags?.length || 0}`);

            if (Array.isArray(student.redflags)) {
                for (const flag of student.redflags) {
                    if (!flag._id || flag._id === undefined || flag._id === null) {
                        // This is legacy data - create a proper red flag object
                        console.log(`  Fixing legacy red flag: ${flag.reason || flag || 'Unknown reason'}`);
                        
                        const newRedFlag = {
                            _id: new mongoose.Types.ObjectId(),
                            reason: flag.reason || flag.toString() || 'Legacy red flag',
                            assignedBy: flag.assignedBy || 'System Migration',
                            assignedById: flag.assignedById || 'system',
                            createdAt: flag.createdAt || new Date(),
                            updatedAt: flag.updatedAt || new Date()
                        };
                        
                        updatedRedFlags.push(newRedFlag);
                        needsUpdate = true;
                        fixedCount++;
                    } else {
                        // This red flag already has proper structure
                        updatedRedFlags.push(flag);
                    }
                }
            } else if (typeof student.redflags === 'number') {
                // Handle case where redflags is a number (legacy)
                console.log(`  Converting number red flags (${student.redflags}) to array`);
                updatedRedFlags.length = 0; // Clear array
                needsUpdate = true;
                fixedCount++;
            }

            if (needsUpdate) {
                console.log(`  Updating student with ${updatedRedFlags.length} fixed red flags`);
                await Student.findByIdAndUpdate(
                    student._id,
                    { redflags: updatedRedFlags },
                    { new: true }
                );
                studentsFixed++;
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`Students processed: ${studentsWithRedFlags.length}`);
        console.log(`Students fixed: ${studentsFixed}`);
        console.log(`Red flags fixed: ${fixedCount}`);

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the script
if (require.main === module) {
    fixLegacyRedFlags()
        .then(() => {
            console.log('Script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = fixLegacyRedFlags;
