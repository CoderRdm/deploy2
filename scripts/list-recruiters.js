const mongoose = require('mongoose');
const { Recruiter } = require('../src/lib/models/Recruiter.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function listRecruiters() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for listing recruiters.');

    const recruiters = await Recruiter.find({}).sort({ createdAt: -1 });
    
    if (recruiters.length === 0) {
      console.log('No recruiters found in the database.');
    } else {
      console.log(`Found ${recruiters.length} recruiter(s):\n`);
      
      recruiters.forEach((recruiter, index) => {
        console.log(`${index + 1}. ${recruiter.first_name} ${recruiter.last_name}`);
        console.log(`   Email: ${recruiter.email}`);
        console.log(`   Phone: ${recruiter.phone || 'N/A'}`);
        console.log(`   Company: ${recruiter.company.name}`);
        console.log(`   Industry: ${recruiter.company.industry}`);
        console.log(`   Website: ${recruiter.company.website || 'N/A'}`);
        console.log(`   Created: ${recruiter.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error listing recruiters:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

listRecruiters(); 