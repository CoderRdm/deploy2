'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Assuming these components exist and handle their own data fetching/display
import PlacementAvailabilitySection from '@/components/PlacementAvailabilitySection';
import CompaniesSection from '@/components/CompaniesSection';
import AnnouncementsSection from '@/components/AnnouncementsSection';
import ApplicationsSection from '@/components/ApplicationsSection';

// A reusable, animated hamburger/close icon component
const AnimatedHamburgerIcon = ({ isOpen, ...props }) => (
    <div {...props} className="w-6 h-6 flex flex-col justify-around">
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
    </div>
);

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [studentProfile, setStudentProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const [announcedJobPosts, setAnnouncedJobPosts] = useState([]);
    const [announcedInternshipPosts, setAnnouncedInternshipPosts] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [announcementsError, setAnnouncementsError] = useState(null);

    const [activeSection, setActiveSection] = useState('my-profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed for a cleaner initial look

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false); // Close sidebar on section change for a better UX
    };

    const fetchStudentProfile = useCallback(async () => {
        setProfileLoading(true);
        setProfileError(null);
        try {
            const res = await fetch('/api/student/profile');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to fetch student profile.' }));
                throw new Error(errorData.message);
            }
            const data = await res.json();
            setStudentProfile(data.data);
        } catch (err) {
            console.error('Error fetching student profile:', err);
            const errorMessage = err.message || 'An unexpected error occurred while fetching your profile.';
            setProfileError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const fetchAnnouncements = useCallback(async () => {
        setAnnouncementsLoading(true);
        setAnnouncementsError(null);
        try {
            const [jobRes, internshipRes] = await Promise.all([
                fetch('/api/student/announcements/jobs'),
                fetch('/api/student/announcements/internships')
            ]);

            const jobData = jobRes.ok ? await jobRes.json() : { message: 'Failed to fetch job announcements.' };
            const internshipData = internshipRes.ok ? await internshipRes.json() : { message: 'Failed to fetch internship announcements.' };

            if (jobRes.ok) {
                setAnnouncedJobPosts(jobData.data || []);
            } else {
                setAnnouncementsError(jobData.message);
            }

            if (internshipRes.ok) {
                setAnnouncedInternshipPosts(internshipData.data || []);
            } else {
                setAnnouncementsError(prev => prev ? `${prev} & ${internshipData.message}` : internshipData.message);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
            setAnnouncementsError('An unexpected error occurred while fetching announcements.');
        } finally {
            setAnnouncementsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/login');
            return;
        }
        if (session.user.role !== 'student') {
            router.replace(session.user.role === 'admin' ? '/admin/dashboard' : '/login');
            return;
        }
        if (!session.user.isProfileComplete) {
            router.replace('/student/profile-completion');
            return;
        }
        fetchStudentProfile();
        fetchAnnouncements();
    }, [status, session, router, fetchStudentProfile, fetchAnnouncements]);

    if (status === 'loading' || profileLoading) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Loading Dashboard...</div>;
    }

    if (profileError) {
        return <div className="text-center py-12 text-red-600 bg-red-50 border border-red-200 rounded-lg mx-5"><p>Error: {profileError}</p></div>;
    }

    if (!studentProfile) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-700">No student profile data available.</div>;
    }

    const studentIdFromEmail = session?.user?.email ? session.user.email.split('@')[0] : 'N/A';

    return (
        <div className="relative min-h-screen bg-gray-100 font-sans">
            {/* Sidebar Backdrop - for the overlay effect */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300 ease-in-out"
                    aria-hidden="true"
                ></div>
            )}

            {/* Vertical Navigation Bar */}
            <nav className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h2 className="text-2xl font-bold mb-10 text-center text-blue-300">Student Portal</h2>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleSectionChange('my-profile')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'my-profile' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>My Profile</button></li>
                        <li><button onClick={() => handleSectionChange('companies')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'companies' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>Placement Companies</button></li>
                        <li><button onClick={() => handleSectionChange('applications')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'applications' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>My Applications</button></li>
                        <li><button onClick={() => handleSectionChange('announcements')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'announcements' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>Announcements</button></li>
                        <li><button onClick={() => handleSectionChange('handled-red-flags')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'handled-red-flags' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>Handled Red Flags</button></li>
                        <li><button onClick={() => handleSectionChange('check-availability')} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeSection === 'check-availability' ? 'bg-blue-600 shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}>Check Availability</button></li>
                    </ul>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md"
                >
                    Logout
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 ease-in-out">
                <header className="sticky top-0 bg-white z-20 shadow-md">
                    <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-gray-800 text-white rounded-md shadow-lg z-50 hover:bg-gray-700 transition"
                            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                        >
                            <AnimatedHamburgerIcon isOpen={isSidebarOpen} />
                        </button>

                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
                    </div>

                        <div className="w-10"></div> {/* Spacer to perfectly center the logo */}
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {/* The content for each section will render here based on activeSection */}
                    {activeSection === 'my-profile' && (
                        <section>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile Overview</h2>
                            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                                <p className="text-lg text-gray-800 mb-2">Welcome, <span className="font-bold">{session?.user?.name}</span>!</p>
                                <p className="text-gray-600 mb-1">Email: {session?.user?.email}</p>
                                <p className="text-gray-600 mb-1">Student ID: {studentIdFromEmail}</p>
                                <p className="text-gray-600">Profile Status: <span className={`font-semibold ${session?.user?.isProfileComplete ? 'text-green-700' : 'text-red-700'}`}>{session?.user?.isProfileComplete ? 'Completed' : 'Incomplete'}</span></p>
                            </div>

                            {session?.user?.isSPC && (
                                <div className="text-center mt-5 p-4 bg-green-100 border border-green-200 rounded-lg shadow-md mb-6">
                                    <p className="text-green-800 font-bold mb-2 text-lg">You are a Student Placement Coordinator!</p>
                                    <button onClick={() => router.push('/spc/dashboard')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300 hover:bg-green-700 shadow-md">Go to SPC Portal</button>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-lg shadow-md mt-8 border border-gray-200">
                                <h3 className="text-2xl font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">Detailed Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Year:</strong> {studentProfile.year}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Branch:</strong> {studentProfile.branch}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Gender:</strong> {studentProfile.gender}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>10th Score:</strong> {studentProfile.tenth_score || 'N/A'}%</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>12th Score:</strong> {studentProfile.twelfth_score || 'N/A'}%</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Father's Name:</strong> {studentProfile.father_name || 'N/A'}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Current Semester:</strong> {studentProfile.current_semester || 'N/A'}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Date of Birth:</strong> {studentProfile.dob ? new Date(studentProfile.dob).toLocaleDateString() : 'N/A'}</div>
                                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Current CGPA:</strong> {studentProfile.cgpa?.overall || 'N/A'}</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'companies' && <CompaniesSection />}
                    {activeSection === 'applications' && <ApplicationsSection />}

                    {activeSection === 'announcements' && (
                        <section>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h2>
                            {announcementsLoading ? <div className="text-center py-5">Loading announcements...</div> : announcementsError ? <div className="text-red-500 text-center py-5">{announcementsError}</div> : <AnnouncementsSection jobPosts={announcedJobPosts} internshipPosts={announcedInternshipPosts} />}
                        </section>
                    )}

                    {activeSection === 'handled-red-flags' && (
                        <section>
                            <h2 className="text-3xl font-bold text-red-700 mb-6">Handled Red Flags</h2>
                            <div className="border border-red-200 rounded-lg p-6 bg-white shadow-md">
                                <h3 className="border-b border-red-200 pb-3 mb-4 text-red-700 text-2xl font-semibold">Your Red Flags ({studentProfile.redflags?.length || 0})</h3>
                                <div className="max-h-64 overflow-y-auto pr-2 space-y-4">
                                    {studentProfile.redflags && studentProfile.redflags.length > 0 ? (
                                        studentProfile.redflags.map((flag, index) => (
                                            <div key={index} className="border-l-4 border-red-500 pl-4">
                                                <p className="text-red-800 font-semibold">Reason: {flag.reason}</p>
                                                <p className="text-sm text-gray-500 mt-1">Added on {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : 'N/A'} by {flag.assignedBy || 'Admin'}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-600 italic py-4">No red flags on your profile. Great work!</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-6 text-center italic">Red flags are internal notes. Please contact the placement cell if you have concerns.</p>
                            </div>
                        </section>
                    )}

                    {activeSection === 'check-availability' && (
                        <section>
                             <h2 className="text-3xl font-bold text-gray-800 mb-6">Check Placement Availability</h2>
                             {session?.user?.isProfileComplete && <PlacementAvailabilitySection />}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}