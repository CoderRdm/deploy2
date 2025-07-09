'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// A reusable, animated hamburger/close icon component
const AnimatedHamburgerIcon = ({ isOpen, ...props }) => (
    <div {...props} className="w-6 h-6 flex flex-col justify-around">
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
        <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
    </div>
);


export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'loading') {
            return;
        }
        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }
        setLoading(false);
    }, [session, status, router]);

    const handleNavigation = (path) => {
        router.push(path);
        setIsSidebarOpen(false); // Close sidebar upon navigation
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Loading Admin Dashboard...</div>;
    }

    // Fallback to prevent rendering if session is invalid, though useEffect should handle it
    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="relative min-h-screen bg-transparent font-sans">
            {/* Sidebar Backdrop - for the overlay effect */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-gray-800 bg-opacity-60 z-30 transition-opacity duration-300 ease-in-out"
                    aria-hidden="true"
                ></div>
            )}

            {/* Vertical Navigation Bar */}
            <nav className={`fixed top-0 left-0 h-full bg-transparent text-white w-64 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h2 className="text-2xl font-bold mb-10 text-center text-blue-300">Admin Panel</h2>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigation('/admin/students')} className="w-full text-left py-3 px-4 rounded-lg transition hover:bg-gray-700 hover:text-white">Manage Students</button></li>
                        <li><button onClick={() => handleNavigation('/admin/students/available')} className="w-full text-left py-3 px-4 rounded-lg transition hover:bg-gray-700 hover:text-white">View Available Students</button></li>
                        <li><button onClick={() => handleNavigation('/admin/announcements')} className="w-full text-left py-3 px-4 rounded-lg transition hover:bg-gray-700 hover:text-white">Manage Announcements</button></li>
                        <li><button onClick={() => handleNavigation('/admin/recruiters')} className="w-full text-left py-3 px-4 rounded-lg transition hover:bg-gray-700 hover:text-white">Recruiter Dashboard</button></li>
                    </ul>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
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
                        
                        {/* Make sure to replace this with your actual logo path */}
<div className="flex items-center">
    <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
</div>
                        <div className="w-10"></div> {/* Spacer to perfectly center the logo */}
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
                    <h1 className="mb-4 text-gray-800 text-4xl font-extrabold">
                        Welcome, Admin!
                    </h1>
                    <p className="text-gray-600 text-lg max-w-xl">
                        Use the navigation menu to manage students, announcements, and recruiters. All your administrative tools are just a click away.
                    </p>
                    {/* You could add summary cards or charts here for a more dynamic dashboard */}
                </div>
            </main>
        </div>
    );
}