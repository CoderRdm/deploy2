'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function JobInternshipAnnouncementsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [jobPosts, setJobPosts] = useState([]);
    const [internshipPosts, setInternshipPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Job Posts
            const jobRes = await fetch('/api/admin/job-posts');
            const jobData = await jobRes.json();
            if (jobRes.ok) {
                setJobPosts(jobData.data);
            } else {
                setError(jobData.message || 'Failed to fetch job posts');
            }

            // Fetch Internship Posts
            const internshipRes = await fetch('/api/admin/internship-posts');
            const internshipData = await internshipRes.json();
            if (internshipRes.ok) {
                setInternshipPosts(internshipData.data);
            } else {
                setError(internshipData.message || 'Failed to fetch internship posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('An unexpected error occurred during data fetching.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        fetchPosts();
    }, [session, status, router]);

    const handleToggleAnnouncement = async (postId, postType, currentStatus, event) => {
        event.stopPropagation(); // Prevent card click from firing

        // Use a custom modal instead of confirm() for better UX
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'UNANNOUNCE' : 'ANNOUNCE'} this ${postType} post?`)) {
            return;
        }

        try {
            const res = await fetch('/api/admin/posts/toggle-announcement', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    postType,
                    isAnnounced: !currentStatus,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (postType === 'job') {
                    setJobPosts(prevPosts =>
                        prevPosts.map(post =>
                            post._id === postId ? { ...post, isAnnounced: !currentStatus } : post
                        )
                    );
                } else if (postType === 'internship') {
                    setInternshipPosts(prevPosts =>
                        prevPosts.map(post =>
                            post._id === postId ? { ...post, isAnnounced: !currentStatus } : post
                        )
                    );
                }
                toast.success(data.message);
            } else {
                toast.error(data.message || `Failed to toggle ${postType} announcement status.`);
            }
        } catch (err) {
            console.error(`Error toggling ${postType} announcement:`, err);
            toast.error(`An unexpected error occurred while toggling ${postType} announcement.`);
        }
    };

    const handleViewPostDetails = (postId, postType) => {
        if (postType === 'job') {
            router.push(`/admin/job-posts/${postId}`);
        } else if (postType === 'internship') {
            router.push(`/admin/internship-posts/${postId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-700">
                Loading announcements...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto my-8 bg-gray-50 rounded-xl shadow-lg font-sans leading-relaxed">
            <h1 className="text-center text-gray-800 mb-8 text-4xl font-extrabold border-b-2 border-gray-200 pb-4">
                Manage Job & Internship Announcements
            </h1>

            <button
                onClick={() => router.back()}
                className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
                &larr; Back to Dashboard
            </button>

            <section className="mb-10">
                <h2 className="text-blue-700 text-3xl font-semibold mb-6 border-b-2 border-blue-200 pb-3">
                    Job Posts ({jobPosts.length})
                </h2>
                {jobPosts.length === 0 ? (
                    <p className="text-gray-600 text-lg">No job posts submitted yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobPosts.map(post => (
                            <div
                                key={post._id}
                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleViewPostDetails(post._id, 'job')}
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                                    {post.jobDesignation} at {post.organizationName}
                                </h3>
                                <p className="text-gray-600 text-sm mb-1">
                                    <strong>Contact:</strong> {post.contactPerson} ({post.emailAddress})
                                </p>
                                <p className="text-gray-700 text-base mb-2 line-clamp-2">
                                    <strong>Description:</strong> {post.jobDescription?.substring(0, 100)}...
                                </p>
                                <p className="text-gray-500 text-xs mb-3">
                                    <strong>Submitted:</strong> {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                                <p className={`font-semibold text-sm mb-4 ${post.isAnnounced ? 'text-green-600' : 'text-red-600'}`}>
                                    <strong>Announced:</strong> {post.isAnnounced ? 'Yes' : 'No'}
                                </p>
                                <button
                                    onClick={(e) => handleToggleAnnouncement(post._id, 'job', post.isAnnounced, e)}
                                    className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-300 ease-in-out
                                        ${post.isAnnounced ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {post.isAnnounced ? 'Unannounce Job' : 'Announce Job'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-green-700 text-3xl font-semibold mb-6 border-b-2 border-green-200 pb-3">
                    Internship Posts ({internshipPosts.length})
                </h2>
                {internshipPosts.length === 0 ? (
                    <p className="text-gray-600 text-lg">No internship posts submitted yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {internshipPosts.map(post => (
                            <div
                                key={post._id}
                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleViewPostDetails(post._id, 'internship')}
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                                    {post.internshipProfile} at {post.organizationName}
                                </h3>
                                <p className="text-gray-600 text-sm mb-1">
                                    <strong>Contact:</strong> {post.contactPerson} ({post.emailAddress})
                                </p>
                                <p className="text-gray-700 text-base mb-2">
                                    <strong>Duration:</strong> {post.internshipDuration}
                                </p>
                                <p className="text-gray-500 text-xs mb-3">
                                    <strong>Submitted:</strong> {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                                <p className={`font-semibold text-sm mb-4 ${post.isAnnounced ? 'text-green-600' : 'text-red-600'}`}>
                                    <strong>Announced:</strong> {post.isAnnounced ? 'Yes' : 'No'}
                                </p>
                                <button
                                    onClick={(e) => handleToggleAnnouncement(post._id, 'internship', post.isAnnounced, e)}
                                    className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-300 ease-in-out
                                        ${post.isAnnounced ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {post.isAnnounced ? 'Unannounce Internship' : 'Announce Internship'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}