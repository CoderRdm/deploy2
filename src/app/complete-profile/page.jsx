// src/app/complete-profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CompleteProfilePage() {
    const { data: session, status, update } = useSession(); // <--- MODIFIED HERE
    const router = useRouter();

    const [formData, setFormData] = useState({
        year: '',
        branch: '',
        gender: '',
        tenth_score: '',
        twelfth_score: '',
        father_name: '',
        current_semester: '',
        dob: '', // Date of Birth
        cgpa: '',
        availableForPlacement: false, // Add placement availability
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

  // This useEffect will now correctly react when 'update()' fetches the new session state
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        } else if (status === 'authenticated' && session.user.isProfileComplete) {
            router.replace('/dashboard');
        }
    }, [status, session, router]); // Dependencies remain the same

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/student/profile', { // This is your new API route
                method: 'PUT', // Using PUT for updating an existing resource
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

           if (response.ok) {
                setSuccess(data.message || 'Profile updated successfully!');

                // Force a session update immediately after successful profile update
                await update({ isProfileComplete: true }); // <--- ADDED THIS LINE

                // The useEffect above will now trigger the redirect as session.user.isProfileComplete will be true
                // You can remove the setTimeout here, as the useEffect will handle it based on session state.
                // If you prefer immediate, unconditional redirect:
                // router.replace('/dashboard');

                // For better UX, let's keep a small delay,
                // but the redirect relies on the session state update, not just this timeout.
                setTimeout(() => {
                    router.replace('/dashboard');
                }, 500); // Small delay for success message to show
            } else {
                setError(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
    }

    if (status === 'unauthenticated' || (status === 'authenticated' && session.user.isProfileComplete)) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Complete Your Profile</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Welcome, {session?.user?.name || 'User'}! Please provide additional details to complete your profile.</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <label htmlFor="year">Current Year:</label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="branch">Branch:</label>
                    <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        <option value="">Select Branch</option>
                        {/* Short forms (common usage) */}
                        <option value="CSE">Computer Science & Engineering (CSE)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="ECE">Electronics & Communication Engineering (ECE)</option>
                        <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                        <option value="EE">Electrical Engineering (EE)</option>
                        <option value="Mechanical">Mechanical Engineering</option>
                        <option value="Civil">Civil Engineering</option>
                        <option value="Chemical">Chemical Engineering</option>
                        <option value="Automobile">Automobile Engineering</option>
                        <option value="Environmental">Environmental Engineering</option>
                        <option value="Design">Design Engineering</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Aerospace">Aerospace Engineering</option>
                        <option value="Petroleum">Petroleum Engineering</option>
                        <option value="Mining">Mining Engineering</option>
                        <option value="Metallurgy">Metallurgy</option>
                        <option value="Production">Production Engineering</option>
                        <option value="Industrial">Industrial Engineering</option>
                        <option value="Agricultural">Agricultural Engineering</option>
                        {/* Full forms for compatibility */}
                        <option value="Computer Science & Engineering">Computer Science & Engineering (Full)</option>
                        <option value="Information Technology">Information Technology (Full)</option>
                        <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (Full)</option>
                        <option value="Electrical Engineering">Electrical Engineering (Full)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering (Full)</option>
                        <option value="Civil Engineering">Civil Engineering (Full)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="gender">Gender:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="tenth_score">10th Score (%):</label>
                    <input
                        type="number"
                        id="tenth_score"
                        name="tenth_score"
                        value={formData.tenth_score}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="twelfth_score">12th Score (%):</label>
                    <input
                        type="number"
                        id="twelfth_score"
                        name="twelfth_score"
                        value={formData.twelfth_score}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="father_name">Father's Name:</label>
                    <input
                        type="text"
                        id="father_name"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="current_semester">Current Semester:</label>
                    <input
                        type="number"
                        id="current_semester"
                        name="current_semester"
                        value={formData.current_semester}
                        onChange={handleChange}
                        min="1"
                        max="8"
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="dob">Date of Birth:</label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="cgpa">Current CGPA:</label>
                    <input
                        type="number"
                        id="cgpa"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        min="0"
                        max="10"
                        step="0.01"
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                
                {/* Placement Availability Toggle */}
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="availableForPlacement"
                            name="availableForPlacement"
                            checked={formData.availableForPlacement}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="availableForPlacement" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}>
                            Mark me as available for placement
                        </label>
                    </div>
                    <p style={{ margin: '10px 0 0 28px', fontSize: '14px', color: '#6c757d', lineHeight: '1.4' }}>
                        By checking this box, you indicate that you are available for the current placement season. 
                        Companies and recruiters will be able to see your profile. You can change this setting later in your dashboard.
                    </p>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px 25px',
                        fontSize: '1.1em',
                        backgroundColor: loading ? '#007bff99' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '20px',
                    }}
                >
                    {loading ? 'Saving...' : 'Complete Profile'}
                </button>
            </form>

            <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', width: '100%' }}>Logout</button>
        </div>
    );
}