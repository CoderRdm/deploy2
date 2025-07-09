// src/app/login/page.jsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

// Component that uses useSearchParams - needs to be wrapped in Suspense
const ErrorDisplay = () => {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');
    
    if (!errorMessage) return null;
    
    return (
        <p style={{ color: 'red', marginBottom: '15px', maxWidth: '400px', textAlign: 'center' }}>
            {decodeURIComponent(errorMessage).replace(/_/g, ' ')}
        </p>
    );
};

const LoginPage = () => {
    const router = useRouter();

    const { data: session, status } = useSession();

    // State for Admin login form
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminLoginLoading, setAdminLoginLoading] = useState(false);
    const [adminLoginError, setAdminLoginError] = useState(null);


    useEffect(() => {
        if (status === 'authenticated') {
            // Determine redirection based on role
            if (session.user.role === 'admin') {
                router.replace('/admin/dashboard');
            } else if (session.user.role === 'student') {
                // Students always go to dashboard as profile_completed is true by default
                router.replace('/dashboard');
            } else {
                // Fallback for unexpected roles
                router.replace('/');
            }
        }
    }, [status, session, router]);

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/auth-callback' });
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAdminLoginLoading(true);
        setAdminLoginError(null);

        const result = await signIn('credentials', {
            redirect: false, // Do not redirect automatically, handle manually
            email: adminEmail,
            password: adminPassword,
        });

        if (result.error) {
            setAdminLoginError(result.error);
            console.error('Admin login error:', result.error);
        } else {
            // Success: session status will update, and useEffect will handle redirect
            setAdminLoginError(null); // Clear any previous error
            setAdminEmail('');
            setAdminPassword('');
        }
        setAdminLoginLoading(false);
    };


    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>Loading authentication status...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <h1 style={{ color: '#333', marginBottom: '30px' }}>Placement Portal Login</h1>

<Suspense fallback={<p>Loading...</p>}>
                <ErrorDisplay />
            </Suspense>

            {/* Google Login for Students */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>Student Login (Google)</h2>
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        padding: '12px 25px',
                        fontSize: '1.1em',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'center',
                        width: '100%'
                    }}
                >
                    <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google logo" width="24" height="24" />
                    Login with College Google
                </button>
            </div>

            {/* Admin Login Form */}
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', width: '300px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>Admin Login</h2>
                <form onSubmit={handleAdminLogin} style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label htmlFor="adminEmail" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                        <input
                            type="email"
                            id="adminEmail"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="adminPassword" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                        <input
                            type="password"
                            id="adminPassword"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    {adminLoginError && (
                        <p style={{ color: 'red', textAlign: 'center' }}>
                            {adminLoginError === 'CredentialsSignin' ? 'Invalid email or password.' : adminLoginError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={adminLoginLoading}
                        style={{
                            padding: '10px 15px',
                            fontSize: '1em',
                            backgroundColor: adminLoginLoading ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: adminLoginLoading ? 'not-allowed' : 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {adminLoginLoading ? 'Logging In...' : 'Login as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;