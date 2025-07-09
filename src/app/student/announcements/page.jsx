// src/app/student/announcements/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for navigation
import { toast } from 'react-hot-toast'; // For notifications

export default function StudentAnnouncementsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [announcedJobPosts, setAnnouncedJobPosts] = useState([]);
    const [announcedInternshipPosts, setAnnouncedInternshipPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'student') {
            router.replace('/login');
            return;
        }

        const fetchAnnouncements = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch announced job posts
                const jobRes = await fetch('/api/student/announcements/jobs');
                const jobData = await jobRes.json();
                if (jobRes.ok) {
                    setAnnouncedJobPosts(jobData.data);
                } else {
                    throw new Error(jobData.message || 'Failed to fetch job announcements.');
                }

                // Fetch announced internship posts
                const internshipRes = await fetch('/api/student/announcements/internships');
                const internshipData = await internshipRes.json();
                if (internshipRes.ok) {
                    setAnnouncedInternshipPosts(internshipData.data);
                } else {
                    throw new Error(internshipData.message || 'Failed to fetch internship announcements.');
                }

            } catch (err) {
                console.error('Error fetching announcements:', err);
                setError(err.message || 'An unexpected error occurred while fetching announcements.');
                toast.error(err.message || 'Failed to load announcements.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [session, status, router]);

    if (loading) {
        return <div style={containerStyle}>Loading announcements...</div>;
    }

    if (error) {
        return <div style={{ ...containerStyle, color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={containerStyle}>
            <h1 style={headingStyle}>All Announced Opportunities</h1>

            {/* Announced Job Opportunities Section */}
            <section style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#007bff', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Job Opportunities ({announcedJobPosts.length})</h3>
                {announcedJobPosts.length === 0 ? (
                    <p style={{ marginTop: '10px', color: '#666' }}>No job opportunities announced yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {announcedJobPosts.map(post => (
                            <Link
                                key={post._id}
                                href={`/student/announcements/jobs/${post._id}`}
                                passHref
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div
                                    style={{
                                        border: post.hasApplied ? '1px solid #28a745' : '1px solid #d4edda', // Green border if applied
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: post.hasApplied ? '#eaf7ed' : '#e9f7ef', // Lighter green background if applied
                                        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        position: 'relative', // For the applied tag
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {post.hasApplied && (
                                        <span style={appliedTagStyle}>Applied</span>
                                    )}
                                    <h4>{post.jobDesignation} at {post.organizationName}</h4>
                                    <p><strong>Description:</strong> {post.jobDescription.substring(0, 150)}...</p>
                                    <p><strong>Location:</strong> {post.placeOfPosting || 'N/A'}</p>
                                    <p style={{ fontSize: '0.9em', color: '#777' }}>Announced on: {new Date(post.createdAt).toLocaleDateString()}</p>
                                    {/* Add more details as needed */}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Announced Internship Opportunities Section */}
            <section style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Internship Opportunities ({announcedInternshipPosts.length})</h3>
                {announcedInternshipPosts.length === 0 ? (
                    <p style={{ marginTop: '10px', color: '#666' }}>No internship opportunities announced yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {announcedInternshipPosts.map(post => (
                            <Link
                                key={post._id}
                                href={`/student/announcements/internships/${post._id}`}
                                passHref
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div
                                    style={{
                                        border: post.hasApplied ? '1px solid #28a745' : '1px solid #d1ecf1', // Green border if applied
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: post.hasApplied ? '#eaf7ed' : '#e0f3f7', // Lighter green background if applied
                                        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        position: 'relative', // For the applied tag
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {post.hasApplied && (
                                        <span style={appliedTagStyle}>Applied</span>
                                    )}
                                    <h4>{post.internshipProfile} at {post.organizationName}</h4>
                                    <p><strong>Duration:</strong> {post.internshipDuration || 'N/A'}</p>
                                    <p><strong>Stipend:</strong> {post.remuneration.btech?.stipend || 'N/A'}</p>
                                    <p><strong>Location:</strong> {post.placeOfPosting || 'N/A'}</p>
                                    <p style={{ fontSize: '0.9em', color: '#777' }}>Announced on: {new Date(post.createdAt).toLocaleDateString()}</p>
                                    {/* Add more details as needed */}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

// Styles (reusing and adjusting for consistency)
const containerStyle = {
    padding: '30px',
    maxWidth: '1200px', // Wider to accommodate more cards
    margin: '30px auto',
    backgroundColor: '#fefefe',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
};

const headingStyle = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
    fontSize: '2.5em',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px',
};

// Style for the "Applied" tag
const appliedTagStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#28a745', // Green background
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.8em',
    fontWeight: 'bold',
    zIndex: 10,
};