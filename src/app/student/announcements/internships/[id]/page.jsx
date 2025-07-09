// src/app/student/announcements/internships/[id]/page.jsx
import InternshipDetailsClient from './InternshipDetailsClient';

export default async function InternshipDetailsPage({ params }) {
    // In Next.js 15, params is a Promise and needs to be awaited
    const resolvedParams = await params;
    const { id } = resolvedParams;

    return <InternshipDetailsClient internshipId={id} />;
}
