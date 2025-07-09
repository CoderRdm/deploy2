const mongoose = require('mongoose');
const { Recruiter } = require('../src/lib/models/Recruiter.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createSampleRecruiters() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for creating recruiters.');

    const sampleRecruiters = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '9876543210',
        company: {
          name: 'TechCorp Solutions',
          website: 'https://techcorp.com',
          industry: 'Technology',
          address: '123 Tech Street, Bangalore, Karnataka',
          description: 'Leading technology solutions provider'
        }
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@financebank.com',
        phone: '9876543211',
        company: {
          name: 'FinanceBank Ltd',
          website: 'https://financebank.com',
          industry: 'Finance',
          address: '456 Finance Avenue, Mumbai, Maharashtra',
          description: 'Premier banking and financial services'
        }
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@healthcare.com',
        phone: '9876543212',
        company: {
          name: 'Healthcare Innovations',
          website: 'https://healthcare.com',
          industry: 'Healthcare',
          address: '789 Health Road, Delhi, NCR',
          description: 'Innovative healthcare solutions'
        }
      }
    ];

    for (const recruiterData of sampleRecruiters) {
      // Check if recruiter already exists
      const existingRecruiter = await Recruiter.findOne({ email: recruiterData.email });
      if (existingRecruiter) {
        console.log(`Recruiter '${recruiterData.email}' already exists. Skipping.`);
        continue;
      }

      const recruiter = new Recruiter(recruiterData);
      await recruiter.save();
      console.log(`Recruiter '${recruiterData.email}' created successfully.`);
    }

    console.log('Sample recruiters creation completed.');

  } catch (error) {
    console.error('Error creating sample recruiters:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

createSampleRecruiters(); 