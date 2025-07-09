'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';

// --- Helper Component for Highlighting Search Matches ---
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

// --- Post Detail Modal Component ---
const PostDetailsModal = ({ post, isOpen, onClose, onToggleAnnouncement }) => {
    if (!post) return null;

    const isJobPost = post.jobDesignation !== undefined;
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
                    {getStatusBadge(post.isAnnounced)}
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

// --- Post Card Component ---
const PostCard = ({ post, onViewDetails, onToggleAnnouncement }) => {
    const isJobPost = post.jobDesignation !== undefined;
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
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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

// --- Skeleton Component for Better Loading UX ---
const RecruiterCardSkeleton = () => (
    <div className="bg-white p-5 rounded-xl shadow-md animate-pulse">
        <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
        <div className="mt-6 flex justify-around">
            <div className="text-center w-1/2"><div className="h-6 w-10 mx-auto bg-gray-300 rounded"></div><div className="h-4 w-16 mx-auto mt-2 bg-gray-200 rounded"></div></div>
            <div className="text-center w-1/2"><div className="h-6 w-10 mx-auto bg-gray-300 rounded"></div><div className="h-4 w-16 mx-auto mt-2 bg-gray-200 rounded"></div></div>
        </div>
        <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
            <div className="w-24 h-9 bg-gray-200 rounded-md"></div>
        </div>
    </div>
);

// --- Main Page Component ---
export default function AdminRecruiterDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [allRecruiters, setAllRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        const fetchRecruiters = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/recruiter/with-posts');
                const data = await res.json();
                if (res.ok) {
                    setAllRecruiters(data.data || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch recruiter data.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiters();
    }, [session, status, router]);

    // Client-side search
    const displayedRecruiters = useMemo(() => {
        return allRecruiters.filter(recruiter => {
            const query = searchQuery.toLowerCase();
            return recruiter.companyName?.toLowerCase().includes(query) ||
                   recruiter.email?.toLowerCase().includes(query);
        });
    }, [allRecruiters, searchQuery]);

    // Dashboard Stats
    const stats = useMemo(() => ({
        total: displayedRecruiters.length,
        withSubmissions: displayedRecruiters.filter(r => (r.jnfCount > 0 || r.infCount > 0)).length,
    }), [displayedRecruiters]);

    // Modal Controls
    const openConfirmModal = (title, message, callback) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmAction(() => callback);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const handleConfirm = () => {
        if (typeof confirmAction === 'function') {
            confirmAction();
        }
        closeConfirmModal();
    };

    // Email handler using the new modal
    const handleSendJnfInfEmail = useCallback((recruiter) => {
        openConfirmModal(
            'Confirm Email Action',
            `Are you sure you want to send JNF/INF details to ${recruiter.companyName} (${recruiter.email})?`,
            async () => {
                const toastId = toast.loading('Initiating email action...');
                try {
                    const res = await fetch(`/api/admin/recruiters/${recruiter._id}/send-form-email`, { method: 'POST' });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success(data.message || 'Email action successful.', { id: toastId });
                    } else {
                        throw new Error(data.message || 'Failed to initiate email action.');
                    }
                } catch (err) {
                    toast.error(err.message, { id: toastId });
                }
            }
        );
    }, []);

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-center text-gray-800 mb-8 text-4xl font-extrabold">Recruiter Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <RecruiterCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-20 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-4 sm:p-8 max-w-full mx-auto my-8 font-sans">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-gray-800 text-4xl font-extrabold">Recruiter Dashboard</h1>
                <div className="flex gap-4">
                     <button onClick={() => router.push('/recruiter/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md">Post a Job</button>
                     <button onClick={() => router.push('/recruiter/post-internship')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md">Post an Internship</button>
                </div>
            </div>
             <p className="text-gray-500 mb-8">View registered recruiters and their job/internship submissions.</p>

            {/* Stats Bar */}
            <button onClick={() => router.push('/admin/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md">Back to Dashboard</button> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
                <div className="p-4 bg-white rounded-lg shadow-sm"><p className="text-2xl font-bold text-blue-600">{stats.total}</p><p className="text-sm text-gray-500">Total Recruiters</p></div>
                <div className="p-4 bg-white rounded-lg shadow-sm"><p className="text-2xl font-bold text-green-600">{stats.withSubmissions}</p><p className="text-sm text-gray-500">Companies with Submissions</p></div>
            </div>
            
            {/* Filter Controls */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-8">
                <input type="text" placeholder="Search by company or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* Recruiter Cards Grid */}
            {displayedRecruiters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedRecruiters.map(recruiter => (
                        <div key={recruiter._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                           <div className="p-5 flex-grow">
                                <h3 className="font-bold text-xl text-gray-800"><Highlight text={recruiter.companyName} highlight={searchQuery} /></h3>
                                <p className="text-sm text-gray-500 mb-4"><Highlight text={recruiter.email} highlight={searchQuery} /></p>
                                
                                <div className="flex justify-around text-center border-t border-b border-gray-200 py-3 my-3">
                                    <div><p className="text-2xl font-semibold text-blue-600">{recruiter.jnfCount || 0}</p><p className="text-xs text-gray-500">Jobs Posted</p></div>
                                    <div className="border-l border-gray-200"></div>
                                    <div><p className="text-2xl font-semibold text-green-600">{recruiter.infCount || 0}</p><p className="text-xs text-gray-500">Internships Posted</p></div>
                                </div>
                                <p className="text-xs text-gray-400 text-center">Joined: {new Date(recruiter.createdAt).toLocaleDateString()}</p>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-b-xl border-t border-gray-200 flex justify-end items-center space-x-2">
                               <button onClick={() => handleSendJnfInfEmail(recruiter)} className="text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md transition-colors">✉️ Send Email</button>
                               {/* Placeholder for more actions */}
                               <button onClick={() => router.push(`/admin/recruiters/${recruiter._id}/posts`)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md transition-colors">View Posts</button>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16"><h3 className="text-2xl font-semibold text-gray-700">No Recruiters Found</h3><p className="text-gray-500 mt-2">Try adjusting your search or register a new recruiter.</p></div>
            )}

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} title={confirmTitle}>
                <p className="text-gray-700 text-base mb-6">{confirmMessage}</p>
                <div className="flex justify-end gap-3"><button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Yes, Confirm</button><button onClick={closeConfirmModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">Cancel</button></div>
            </Modal>
        </div>
    );
}