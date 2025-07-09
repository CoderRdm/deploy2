// src/app/admin-login/page.jsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Call NextAuth.js signIn with 'credentials' provider
        const result = await signIn('credentials', {
            redirect: false, // Prevent NextAuth.js from redirecting directly
            email,
            password,
            callbackUrl: '/admin/dashboard' // Where to redirect on successful admin login
        });

        if (result.error) {
            setError(result.error);
            console.error('Admin login error:', result.error);
        } else {
            // Login successful, redirect to admin dashboard
            router.replace(result.url || '/admin/dashboard');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        margin: '8px 0',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        marginTop: '15px'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Admin Login</h1>
                {error && (
                    <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>
                        {error}
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}