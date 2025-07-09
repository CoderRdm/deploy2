// src/app/student/announcements/jobs/[id]/JobDetailsClient.jsx
'use client'; // This must be a Client Component

import React from 'react';
import EnhancedJobDetails from '@/components/job-application/EnhancedJobDetails';

// Change component name and accept 'jobId' as a prop
export default function JobDetailsClient({ jobId }) { // Renamed from JobDetailsPage, accepts jobId
    return <EnhancedJobDetails jobId={jobId} />;
}
