// src/app/spc/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SPCDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [jobPosts, setJobPosts] = useState([]);
    const [internshipPosts, setInternshipPosts] = useState([]);
    const [students, setStudents] = useState([]); // State to store all students for SPC to manage
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Red flag management states
    const [showRedFlagModal, setShowRedFlagModal] = useState(false);
    const [selectedStudentForRedFlags, setSelectedStudentForRedFlags] = useState(null); // The student object
    const [newRedFlagReason, setNewRedFlagReason] = useState('');
    const [editingRedFlag, setEditingRedFlag] = useState(null); // The red flag object being edited

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'student' || !session.user.isSPC) {
            toast.error("Access denied. You must be an SPC to view this page.");
            router.replace('/dashboard');
            return;
        }

        const fetchSPCDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Job Posts for management (using SPC API)
                const jobRes = await fetch('/api/spc/job-posts');
                const jobData = await jobRes.json();
                if (jobRes.ok) {
                    setJobPosts(jobData.data);
                } else {
                    setError(jobData.message || 'Failed to fetch job posts for SPC.');
                    toast.error(jobData.message || 'Failed to fetch job posts.');
                }

                // Fetch Internship Posts for management (using SPC API)
                const internshipRes = await fetch('/api/spc/internship-posts');
                const internshipData = await internshipRes.json();
                if (internshipRes.ok) {
                    setError(null); // Clear previous error if this one succeeds
                    setInternshipPosts(internshipData.data);
                } else {
                    setError(prev => prev ? `${prev} & ${internshipData.message}` : internshipData.message || 'Failed to fetch internship posts for SPC.');
                    toast.error(internshipData.message || 'Failed to fetch internship posts.');
                }

                // Fetch all students for red flag management (using SPC API)
                const studentsRes = await fetch('/api/spc/students');
                const studentsData = await studentsRes.json();
                if (studentsRes.ok) {
                    setError(null); // Clear previous error if this one succeeds
                    setStudents(studentsData.data);
                } else {
                    setError(prev => prev ? `${prev} & ${studentsData.message}` : studentsData.message || 'Failed to fetch students for SPC.');
                    toast.error(studentsData.message || 'Failed to fetch students.');
                }

            } catch (err) {
                console.error('Error fetching SPC dashboard data:', err);
                setError('An unexpected error occurred while fetching data.');
                toast.error('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchSPCDashboardData();
    }, [session, status, router]);

    const handleToggleAnnouncement = async (postId, postType, currentStatus, event) => {
        event.stopPropagation();

        if (!confirm(`Are you sure you want to ${currentStatus ? 'UNANNOUNCE' : 'ANNOUNCE'} this ${postType} post?`)) {
            return;
        }

        try {
            const res = await fetch('/api/spc/posts/toggle-announcement', { // Using SPC API route
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, postType, isAnnounced: !currentStatus }),
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
        router.push(`/spc/${postType}-posts/${postId}`);
    };

    // --- Red Flag Management Handlers ---

    const openRedFlagModal = (student) => {
        setSelectedStudentForRedFlags(student);
        setNewRedFlagReason('');
        setEditingRedFlag(null); // Reset editing state
        setShowRedFlagModal(true);
    };

    const closeRedFlagModal = () => {
        setShowRedFlagModal(false);
        setSelectedStudentForRedFlags(null);
        setNewRedFlagReason('');
        setEditingRedFlag(null);
    };

    const handleAddRedFlag = async (e) => {
        e.preventDefault();
        if (!selectedStudentForRedFlags || !newRedFlagReason.trim()) {
            toast.error('Please provide a reason for the red flag.');
            return;
        }

        try {
            const res = await fetch(`/api/spc/students/${selectedStudentForRedFlags._id}/red-flags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: newRedFlagReason.trim() }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                // Update the student's red flags in the local state
                setStudents(prev => prev.map(s =>
                    s._id === selectedStudentForRedFlags._id ? { ...s, redflags: data.data } : s
                ));
                setSelectedStudentForRedFlags(prev => ({ ...prev, redflags: data.data })); // Update modal's student
                setNewRedFlagReason(''); // Clear input
            } else {
                toast.error(data.message || 'Failed to add red flag.');
            }
        } catch (err) {
            console.error('Error adding red flag:', err);
            toast.error('An unexpected error occurred while adding red flag.');
        }
    };

    const handleEditRedFlagClick = (flag) => {
        setEditingRedFlag(flag);
        setNewRedFlagReason(flag.reason); // Pre-fill with current reason
    };

    const handleUpdateRedFlag = async (e) => {
        e.preventDefault();
        if (!selectedStudentForRedFlags || !editingRedFlag || !newRedFlagReason.trim()) {
            toast.error('Invalid red flag or reason.');
            return;
        }

        try {
            const res = await fetch(`/api/spc/students/${selectedStudentForRedFlags._id}/red-flags/${editingRedFlag._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: newRedFlagReason.trim() }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                // Update the red flag in the local state
                setStudents(prev => prev.map(s =>
                    s._id === selectedStudentForRedFlags._id
                        ? {
                            ...s,
                            redflags: s.redflags.map(rf =>
                                rf._id === editingRedFlag._id ? { ...rf, reason: newRedFlagReason.trim() } : rf
                            )
                        }
                        : s
                ));
                // Also update the selectedStudentForRedFlags in the modal
                setSelectedStudentForRedFlags(prev => ({
                    ...prev,
                    redflags: prev.redflags.map(rf =>
                        rf._id === editingRedFlag._id ? { ...rf, reason: newRedFlagReason.trim() } : rf
                    )
                }));
                setEditingRedFlag(null); // Exit editing mode
                setNewRedFlagReason(''); // Clear input
            } else {
                toast.error(data.message || 'Failed to update red flag.');
            }
        } catch (err) {
            console.error('Error updating red flag:', err);
            toast.error('An unexpected error occurred while updating red flag.');
        }
    };

    const handleDeleteRedFlag = async (flagId) => {
        if (!confirm('Are you sure you want to delete this red flag?')) {
            return;
        }
        if (!selectedStudentForRedFlags) return;

        try {
            const res = await fetch(`/api/spc/students/${selectedStudentForRedFlags._id}/red-flags/${flagId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                // --- REFINEMENT: Use data.data (updated student) for state update ---
                // The API now returns the full updated student object after deletion
                setStudents(prev => prev.map(s =>
                    s._id === selectedStudentForRedFlags._id ? data.data : s // Use data.data which is the updated student
                ));
                setSelectedStudentForRedFlags(data.data); // Update modal's student with the latest data
                // --- END REFINEMENT ---
            } else {
                toast.error(data.message || 'Failed to delete red flag.');
            }
        } catch (err) {
            console.error('Error deleting red flag:', err);
            toast.error('An unexpected error occurred while deleting red flag.');
        }
    };

    // --- End Red Flag Management Handlers ---

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading SPC Dashboard...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <p>Error loading SPC Dashboard: {error}</p>
                <button onClick={() => router.replace('/dashboard')} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Go to Student Dashboard
                </button>
            </div>
        );
    }

    if (!session || session.user.role !== 'student' || !session.user.isSPC) {
        return null; // Should be redirected by useEffect
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#155724' }}>
                Welcome, SPC {session?.user?.name || session?.user?.email}!
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                You are logged in as a Student Placement Coordinator.
            </p>

            {/* Job Posts Management Section */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#007bff', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Job Posts Management ({jobPosts.length})
                </h2>
                {jobPosts.length === 0 ? (
                    <p>No job posts available for management.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {jobPosts.map(post => (
                            <div
                                key={post._id}
                                style={{
                                    border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#fff',
                                    boxShadow: '0 1px 5px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s ease-in-out',
                                }}
                                onClick={() => handleViewPostDetails(post._id, 'job')}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3>{post.jobDesignation} at {post.organizationName}</h3>
                                <p><strong>Status:</strong> {post.isAnnounced ? 'Announced' : 'Unannounced'}</p>
                                <p><strong>Submitted:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
                                <button
                                    onClick={(e) => handleToggleAnnouncement(post._id, 'job', post.isAnnounced, e)}
                                    style={{
                                        backgroundColor: post.isAnnounced ? '#ffc107' : '#28a745',
                                        color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px',
                                        cursor: 'pointer', marginTop: '10px', width: '100%',
                                    }}
                                >
                                    {post.isAnnounced ? 'Unannounce Job' : 'Announce Job'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Internship Posts Management Section */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#28a745', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Internship Posts Management ({internshipPosts.length})
                </h2>
                {internshipPosts.length === 0 ? (
                    <p>No internship posts available for management.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {internshipPosts.map(post => (
                            <div
                                key={post._id}
                                style={{
                                    border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#fff',
                                    boxShadow: '0 1px 5px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s ease-in-out',
                                }}
                                onClick={() => handleViewPostDetails(post._id, 'internship')}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3>{post.internshipProfile} at {post.organizationName}</h3>
                                <p><strong>Status:</strong> {post.isAnnounced ? 'Announced' : 'Unannounced'}</p>
                                <p><strong>Submitted:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
                                <button
                                    onClick={(e) => handleToggleAnnouncement(post._id, 'internship', post.isAnnounced, e)}
                                    style={{
                                        backgroundColor: post.isAnnounced ? '#ffc107' : '#007bff',
                                        color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px',
                                        cursor: 'pointer', marginTop: '10px', width: '100%',
                                    }}
                                >
                                    {post.isAnnounced ? 'Unannounce Internship' : 'Announce Internship'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Student Red Flag Management Section */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#dc3545', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Student Red Flag Management ({students.length})
                </h2>
                {students.length === 0 ? (
                    <p>No students found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th style={tableHeaderStyle}>Student ID</th>
                                    <th style={tableHeaderStyle}>Name</th>
                                    <th style={tableHeaderStyle}>Email</th>
                                    <th style={tableHeaderStyle}>Red Flags</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tableCellStyle}>{student.student_id}</td>
                                        <td style={tableCellStyle}>{student.name}</td>
                                        <td style={tableCellStyle}>{student.email}</td>
                                        <td style={tableCellStyle}>
                                            <span style={{ fontWeight: 'bold', color: student.redflags.length > 0 ? 'red' : 'green' }}>
                                                {student.redflags.length}
                                            </span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <button
                                                onClick={() => openRedFlagModal(student)}
                                                style={{
                                                    backgroundColor: '#17a2b8', color: '#fff', border: 'none',
                                                    padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px'
                                                }}
                                            >
                                                Manage Red Flags
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Red Flag Management Modal */}
            {showRedFlagModal && selectedStudentForRedFlags && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <button onClick={closeRedFlagModal} style={modalCloseButtonStyle}>X</button>
                        <h3 style={{ marginBottom: '20px', color: '#333' }}>
                            Manage Red Flags for {selectedStudentForRedFlags.name} ({selectedStudentForRedFlags.student_id})
                        </h3>

                        {/* Display existing red flags */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#fdfdfd' }}>
                                {selectedStudentForRedFlags.redflags.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#666' }}>No red flags assigned yet.</p>
                                ) : (
                                    <ul>
                                        {selectedStudentForRedFlags.redflags.map((flag, index) => (
                                            <li key={flag._id || `legacy-${index}`} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px dashed #eee' }}>
                                                <p style={{ margin: '0' }}><strong>Reason:</strong> {flag.reason || flag.toString() || 'Legacy red flag'}</p>
                                                <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                                                    Assigned by: {flag.assignedBy || 'Unknown'} on {flag.createdAt && !isNaN(new Date(flag.createdAt)) ? new Date(flag.createdAt).toLocaleDateString() : 'Unknown Date'}
                                                    {!flag._id && <span style={{ color: '#ff8c00', fontSize: '0.8em', marginLeft: '5px' }}>(Legacy data)</span>}
                                                </p>
                                                {/* --- REFINEMENT: Ensure comparison uses .toString() for ObjectIds --- */}
                                                {flag._id && session.user.id === flag.assignedById.toString() && ( // Only allow creator to edit/delete
                                                    <div style={{ marginTop: '5px' }}>
                                                        <button
                                                            onClick={() => handleEditRedFlagClick(flag)}
                                                            style={{
                                                                backgroundColor: '#ffc107', color: '#fff', border: 'none',
                                                                padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px', fontSize: '0.8em'
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRedFlag(flag._id)}
                                                            style={{
                                                                backgroundColor: '#dc3545', color: '#fff', border: 'none',
                                                                padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8em'
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                                {!flag._id && (
                                                    <span style={{ marginTop: '5px', color: '#ff8c00', fontSize: '0.8em' }}>Cannot edit/delete legacy data</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                        </div>

                        {/* Add/Edit Red Flag Form */}
                        <form onSubmit={editingRedFlag ? handleUpdateRedFlag : handleAddRedFlag} style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <label htmlFor="redFlagReason" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                {editingRedFlag ? 'Edit Red Flag Reason:' : 'Add New Red Flag:'}
                            </label>
                            <textarea
                                id="redFlagReason"
                                value={newRedFlagReason}
                                onChange={(e) => setNewRedFlagReason(e.target.value)}
                                placeholder="Enter red flag reason..."
                                rows="3"
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }}
                            ></textarea>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: editingRedFlag ? '#ffc107' : '#007bff',
                                    color: '#fff', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', width: '100%'
                                }}
                            >
                                {editingRedFlag ? 'Update Red Flag' : 'Add Red Flag'}
                            </button>
                            {editingRedFlag && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingRedFlag(null); setNewRedFlagReason(''); }}
                                    style={{
                                        backgroundColor: '#6c757d', color: '#fff', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '10px'
                                    }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <Link href="/dashboard" passHref>
                    <button style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Go to Student Dashboard
                    </button>
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
        </div>
    );
}

// Basic inline styles for table and modal
const tableHeaderStyle = {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    color: '#555',
    fontWeight: 'bold',
};

const tableCellStyle = {
    padding: '10px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #eee',
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '600px',
    position: 'relative',
    maxHeight: '80vh',
    overflowY: 'auto',
};

const modalCloseButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
};