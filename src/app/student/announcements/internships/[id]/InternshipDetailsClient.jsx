// src/app/student/announcements/internships/[id]/InternshipDetailsClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import EnhancedInternshipDetails from '@/components/internship-application/EnhancedInternshipDetails';

export default function InternshipDetailsClient({ internshipId }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [internshipPost, setInternshipPost] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'student') {
            router.replace('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch both internship details and student profile
                const [internshipRes, profileRes] = await Promise.all([
                    fetch(`/api/student/announcements/internships/${internshipId}`),
                    fetch('/api/student/profile')
                ]);

                const internshipData = await internshipRes.json();
                const profileData = await profileRes.json();

                if (internshipRes.ok) {
                    setInternshipPost(internshipData.data);
                    setHasApplied(internshipData.data.hasApplied);
                } else {
                    setError(internshipData.message || 'Failed to fetch internship details.');
                    return;
                }

                if (profileRes.ok) {
                    setStudentProfile(profileData.data);
                } else {
                    console.warn('Failed to fetch student profile:', profileData.message);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('An unexpected error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        if (internshipId) {
            fetchData();
        }
    }, [internshipId, session, status, router]);


    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading internship details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-600 mb-4">Error: {error}</div>
                    <button 
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!internshipPost) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Internship post not found or unauthorized access.</p>
                    <button 
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <EnhancedInternshipDetails
            internshipPost={internshipPost}
            studentProfile={studentProfile}
            hasApplied={hasApplied}
            onBack={handleBack}
        />
    );
}

