// src/app/auth-callback/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const AuthCallbackPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            console.log('Authenticated via NextAuth callback. Session:', session);
            if (session.user.isProfileComplete) {
                router.replace('/dashboard');
            } else {
                router.replace('/complete-profile');
            }
        } else if (status === 'unauthenticated') {
            console.error('Authentication failed after callback. No valid session.');
            router.replace('/login?error=authentication_failed');
        }
    }, [status, session, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center', backgroundColor: '#f0f2f5', color: '#333' }}>
            <h1>Authenticating...</h1>
            <p>Please wait, you're being redirected.</p>
        </div>
    );
};

export default AuthCallbackPage;