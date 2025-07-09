// src/app/student/announcements/jobs/[id]/page.jsx
// This file is now a Server Component by default (no 'use client')
import JobDetailsClient from './JobDetailsClient'; // Import the new Client Component

// This component receives params directly from Next.js in a Server Component context
export default async function JobDetailsPage({ params }) {
    // In Next.js 15, params is a Promise and needs to be awaited
    const resolvedParams = await params;
    const { id } = resolvedParams;

    return <JobDetailsClient jobId={id} />;
}