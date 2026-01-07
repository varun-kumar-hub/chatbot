import React from 'react';
import { LogIn } from 'lucide-react';
import styles from '../styles/LoginScreen.module.css';

import { supabase } from '../supabaseClient';

const LoginScreen = () => {

    const handleGoogleLogin = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <div className={styles.sparkle}>✨</div>
                </div>
                <h1>Welcome Back</h1>
                <p>Sign in to continue to your AI workspace.</p>

                <button className={styles.googleButton} onClick={handleGoogleLogin}>
                    <LogIn size={20} />
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
