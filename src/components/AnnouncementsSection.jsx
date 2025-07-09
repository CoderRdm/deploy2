// src/components/AnnouncementsSection.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AnnouncementsSection() {
    const router = useRouter();
    const [announcedJobPosts, setAnnouncedJobPosts] = useState([]);
    const [announcedInternshipPosts, setAnnouncedInternshipPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        setError(null);
        try {
            const [jobRes, internshipRes] = await Promise.all([
                fetch('/api/student/announcements/jobs'),
                fetch('/api/student/announcements/internships')
            ]);

            // Always try to parse both responses, even if one failed, for better debugging
            const jobData = jobRes.ok ? await jobRes.json() : { message: await jobRes.text() };
            const internshipData = internshipRes.ok ? await internshipRes.json() : { message: await internshipRes.text() };

            if (jobRes.ok) {
                setAnnouncedJobPosts(jobData.data || []); // Ensure it's an array
            } else {
                console.error('Job API Error:', jobData);
                setError(jobData.message || 'Failed to fetch job announcements.');
            }

            if (internshipRes.ok) {
                setAnnouncedInternshipPosts(internshipData.data || []); // Ensure it's an array
            } else {
                console.error('Internship API Error:', internshipData);
                setError(prev => prev ? `${prev} & ${internshipData.message}` : internshipData.message || 'Failed to fetch internship announcements.');
            }

        } catch (err) {
            console.error('Error fetching announcements:', err);
            setError('An unexpected error occurred while fetching announcements.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8 text-red-600">
                    <p className="text-lg">Error loading announcements</p>
                    <p className="text-sm mt-2">{error}</p>
                    <button 
                        onClick={fetchAnnouncements}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Announcements</h3>
                    <button 
                        onClick={() => router.push('/student/announcements')} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        View All Opportunities
                    </button>
                </div>

                {/* Job Opportunities Section */}
                <section className="mb-8">
                    <h4 className="text-lg font-semibold text-green-600 border-b-2 border-gray-200 pb-2 mb-4">
                        Job Opportunities ({announcedJobPosts.length})
                    </h4>
                    {announcedJobPosts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-6xl mb-4">💼</div>
                            <p className="text-lg">No job opportunities announced yet</p>
                            <p className="text-sm">Check back later for new opportunities!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {announcedJobPosts.slice(0, 6).map(post => (
                                <Link key={post._id} href={`/student/announcements/jobs/${post._id}`} passHref>
                                    <div className="border border-green-200 rounded-lg p-4 bg-green-50 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                        <h5 className="font-medium text-gray-800 mb-2">{post.jobDesignation}</h5>
                                        <p className="text-sm text-gray-600 mb-2">{post.organizationName}</p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>CTC:</strong> {post.remuneration?.btech?.ctc || post.remuneration?.mtech?.ctc || 'N/A'} LPA
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Location:</strong> {post.placeOfPosting || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Announced: {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                
                {/* Internship Opportunities Section */}
                <section>
                    <h4 className="text-lg font-semibold text-blue-600 border-b-2 border-gray-200 pb-2 mb-4">
                        Internship Opportunities ({announcedInternshipPosts.length})
                    </h4>
                    {announcedInternshipPosts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-6xl mb-4">🎓</div>
                            <p className="text-lg">No internship opportunities announced yet</p>
                            <p className="text-sm">Check back later for new opportunities!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {announcedInternshipPosts.slice(0, 6).map(post => (
                                <Link key={post._id} href={`/student/announcements/internships/${post._id}`} passHref>
                                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                        <h5 className="font-medium text-gray-800 mb-2">{post.internshipProfile}</h5>
                                        <p className="text-sm text-gray-600 mb-2">{post.organizationName}</p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Duration:</strong> {post.internshipDuration || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Stipend:</strong> {post.remuneration?.btech?.stipend || post.remuneration?.mtech?.stipend || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Location:</strong> {post.placeOfPosting || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Announced: {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
