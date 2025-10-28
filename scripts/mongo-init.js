// MongoDB initialization script for Docker
// This script will run when the MongoDB container starts for the first time

// Switch to the placement_portal database
db = db.getSiblingDB('placement_portal');

// Create collections with validation
db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['student_id', 'name', 'email'],
      properties: {
        student_id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        year: { bsonType: 'string' },
        branch: { bsonType: 'string' },
        cgpa: {
          bsonType: 'object',
          properties: {
            overall: { bsonType: 'number', minimum: 0, maximum: 10 }
          }
        }
      }
    }
  }
});

db.createCollection('admins', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name', 'role'],
      properties: {
        email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        password: { bsonType: 'string', minLength: 6 },
        name: { bsonType: 'string' },
        role: { enum: ['admin', 'spc'] }
      }
    }
  }
});

db.createCollection('recruiters', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name', 'companyName'],
      properties: {
        email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        password: { bsonType: 'string', minLength: 6 },
        name: { bsonType: 'string' },
        companyName: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('jobposts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationName', 'jobProfile', 'emailAddress'],
      properties: {
        organizationName: { bsonType: 'string' },
        jobProfile: { bsonType: 'string' },
        emailAddress: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        isAnnounced: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('internshipposts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationName', 'internshipProfile', 'emailAddress'],
      properties: {
        organizationName: { bsonType: 'string' },
        internshipProfile: { bsonType: 'string' },
        emailAddress: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        isAnnounced: { bsonType: 'bool' }
      }
    }
  }
});

// Create indexes for better performance
db.students.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ student_id: 1 }, { unique: true });
db.students.createIndex({ branch: 1, year: 1 });

db.admins.createIndex({ email: 1 }, { unique: true });
db.recruiters.createIndex({ email: 1 }, { unique: true });

db.jobposts.createIndex({ emailAddress: 1 });
db.jobposts.createIndex({ isAnnounced: 1 });
db.jobposts.createIndex({ createdAt: -1 });

db.internshipposts.createIndex({ emailAddress: 1 });
db.internshipposts.createIndex({ isAnnounced: 1 });
db.internshipposts.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');
print('Collections created: students, admins, recruiters, jobposts, internshipposts');
print('Indexes created for optimal performance');
