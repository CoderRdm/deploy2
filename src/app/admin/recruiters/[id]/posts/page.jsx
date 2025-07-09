'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';

// Helper Component for Highlighting Search Matches
const Highlight = ({ text = '', highlight = '' }) => {
    if (!highlight.trim() || !text) {
        return <span>{text}</span>;
    }
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 px-0 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

// Post Detail Modal Component
const PostDetailsModal = ({ post, isOpen, onClose, onToggleAnnouncement }) => {
    if (!post) return null;

    const isJobPost = post.type === 'job';
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (isAnnounced) => {
        return isAnnounced ? 
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Announced</span> :
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
    };

    const formatRequiredBranches = (branches) => {
        if (!branches) return 'N/A';
        const branchList = [];
        Object.entries(branches).forEach(([key, value]) => {
            if (key !== 'allBranchesApplicable' && Array.isArray(value) && value.length > 0) {
                branchList.push(`${key.toUpperCase()}: ${value.join(', ')}`);
            }
        });
        return branchList.length > 0 ? branchList.join('; ') : 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isJobPost ? post.jobDesignation : post.internshipProfile}
                    </h3>
                    <div className="flex gap-2">
                        {getStatusBadge(post.isAnnounced)}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            isJobPost ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {isJobPost ? 'Job' : 'Internship'}
                        </span>
                    </div>
                </div>
                <p className="text-gray-600">{post.organizationName}</p>
                <p className="text-sm text-gray-500">Submitted: {formatDate(post.dateSubmitted)}</p>
            </div>

            {/* Organization Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Organization Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><strong>Website:</strong> {post.website || 'N/A'}</div>
                    <div><strong>Type:</strong> {post.organizationType}</div>
                    <div><strong>Industry:</strong> {post.industrySector}</div>
                    <div><strong>Location:</strong> {post.placeOfPosting || 'N/A'}</div>
                </div>
            </div>

            {/* Position Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Position Details</h4>
                <div className="text-sm space-y-2">
                    <div><strong>Description:</strong> {isJobPost ? post.jobDescription : post.internshipProfile}</div>
                    <div><strong>Positions:</strong> {post.numberOfPositions || 'N/A'}</div>
                    <div><strong>CGPA Requirements:</strong> {post.cgpaRequirements || 'N/A'}</div>
                    <div><strong>Joining Date:</strong> {formatDate(post.tentativeDateOfJoining)}</div>
                    {!isJobPost && <div><strong>Duration:</strong> {post.internshipDuration || 'N/A'}</div>}
                </div>
            </div>

            {/* Eligibility */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Eligibility</h4>
                <div className="text-sm space-y-2">
                    <div><strong>Programs:</strong> {post.requiredPrograms?.join(', ') || 'N/A'}</div>
                    <div><strong>Branches:</strong> {formatRequiredBranches(post.requiredBranches)}</div>
                    <div><strong>Other Requirements:</strong> {post.anyOtherRequirement || 'N/A'}</div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                <div className="text-sm space-y-2">
                    <div><strong>Contact Person:</strong> {post.contactPerson}</div>
                    <div><strong>Email:</strong> {post.emailAddress}</div>
                    <div><strong>Phone:</strong> {post.mobileNo || 'N/A'}</div>
                    <div><strong>Address:</strong> {post.contactAddress || 'N/A'}</div>
                </div>
            </div>

            {/* Applications */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Applications</h4>
                <div className="text-sm">
                    <div><strong>Total Applications:</strong> {post.applications?.length || 0}</div>
                    {post.applications?.length > 0 && (
                        <div className="mt-2">
                            <strong>Status Breakdown:</strong>
                            {/* You can add more detailed status breakdown here */}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    onClick={() => onToggleAnnouncement(post)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        post.isAnnounced
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {post.isAnnounced ? 'Unannounce' : 'Announce'}
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Post Card Component
const PostCard = ({ post, onViewDetails, onToggleAnnouncement }) => {
    const isJobPost = post.type === 'job';
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-1">
                        {isJobPost ? post.jobDesignation : post.internshipProfile}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{post.organizationName}</p>
                    <p className="text-xs text-gray-500">Submitted: {formatDate(post.dateSubmitted)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {post.isAnnounced ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Announced</span>
                    ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                        isJobPost ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {isJobPost ? 'Job' : 'Internship'}
                    </span>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
                <div className="flex justify-between items-center">
                    <span><strong>Positions:</strong> {post.numberOfPositions || 'N/A'}</span>
                    <span><strong>Applications:</strong> {post.applications?.length || 0}</span>
                </div>
                <div className="mt-1">
                    <span><strong>CGPA:</strong> {post.cgpaRequirements || 'N/A'}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <button
                    onClick={() => onViewDetails(post)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View Details
                </button>
                <button
                    onClick={() => onToggleAnnouncement(post)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        post.isAnnounced
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {post.isAnnounced ? 'Unannounce' : 'Announce'}
                </button>
            </div>
        </div>
    );
};

// Main Page Component
export default function RecruiterPostsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const recruiterId = params.id;

    const [recruiter, setRecruiter] = useState(null);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'job', 'internship'

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        const fetchRecruiterPosts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/recruiters/${recruiterId}/posts`);
                const data = await res.json();
                if (res.ok) {
                    setRecruiter(data.data.recruiter);
                    setPosts(data.data.posts);
                    setStats(data.data.stats);
                } else {
                    throw new Error(data.message || 'Failed to fetch recruiter posts.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiterPosts();
    }, [session, status, router, recruiterId]);

    // Filter posts based on search query and filter type
    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            (post.jobDesignation && post.jobDesignation.toLowerCase().includes(query)) ||
            (post.internshipProfile && post.internshipProfile.toLowerCase().includes(query)) ||
            (post.organizationName && post.organizationName.toLowerCase().includes(query))
        );
        const matchesFilter = filter === 'all' || post.type === filter;
        return matchesSearch && matchesFilter;
    });

    const handleViewDetails = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleToggleAnnouncement = async (post) => {
        try {
            const endpoint = post.type === 'job' ? 'job-posts' : 'internship-posts';
            const res = await fetch(`/api/admin/${endpoint}/${post._id}/toggle-announcement`, {
                method: 'PUT',
            });
            const data = await res.json();
            if (res.ok) {
                // Update the post in the local state
                setPosts(prevPosts => 
                    prevPosts.map(p => 
                        p._id === post._id ? { ...p, isAnnounced: !p.isAnnounced } : p
                    )
                );
                toast.success(data.message || 'Post status updated successfully');
            } else {
                throw new Error(data.message || 'Failed to update post status');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-md">
                                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="text-red-600 text-lg">Error: {error}</div>
                <button
                    onClick={() => router.push('/admin/recruiters')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Back to Recruiters
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-full mx-auto my-8 font-sans">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-gray-800 text-4xl font-extrabold">
                            {recruiter?.companyName || 'Company'} Posts
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Recruiter: {recruiter?.firstName} {recruiter?.lastName} ({recruiter?.email})
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/recruiters')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
                    >
                        Back to Recruiters
                    </button>
                </div>
                <p className="text-gray-500">
                    View all job and internship posts submitted by this recruiter.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPosts || 0}</p>
                    <p className="text-sm text-gray-500">Total Posts</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{stats.jobPosts || 0}</p>
                    <p className="text-sm text-gray-500">Job Posts</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-purple-600">{stats.internshipPosts || 0}</p>
                    <p className="text-sm text-gray-500">Internship Posts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 p-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Posts</option>
                        <option value="job">Job Posts</option>
                        <option value="internship">Internship Posts</option>
                    </select>
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onViewDetails={handleViewDetails}
                            onToggleAnnouncement={handleToggleAnnouncement}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-2xl font-semibold text-gray-700">No Posts Found</h3>
                    <p className="text-gray-500 mt-2">
                        {searchQuery || filter !== 'all' 
                            ? 'Try adjusting your search or filter.'
                            : 'This recruiter has not submitted any posts yet.'
                        }
                    </p>
                </div>
            )}

            {/* Post Details Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post Details">
                <PostDetailsModal
                    post={selectedPost}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onToggleAnnouncement={handleToggleAnnouncement}
                />
            </Modal>
        </div>
    );
}
