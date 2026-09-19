// LoginPage.js
// Login Page Component - Full Stack Capstone Project
// Contains fetch request with Content-Type and Authorization in headers

import React, { useState } from 'react';

function LoginPage() {
    // State for form fields
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // State for loading and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [token, setToken] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate inputs
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setLoading(true);

        try {
            // =========================================
            // STEP 1: AUTHENTICATE TO GET TOKEN
            // =========================================
            const authResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const authData = await authResponse.json();

            if (!authResponse.ok) {
                setMessage({ 
                    type: 'error', 
                    text: authData.message || 'Invalid credentials. Please try again.' 
                });
                setLoading(false);
                return;
            }

            // Store the token received from authentication
            const authToken = authData.token;
            setToken(authToken);

            // =========================================
            // STEP 2: FETCH USER PROFILE WITH AUTHORIZATION
            // =========================================
            const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
                // METHOD ATTRIBUTE
                method: 'GET',

                // HEADERS OBJECT WITH CONTENT-TYPE AND AUTHORIZATION
                headers: {
                    // CONTENT-TYPE ATTRIBUTE - Specifies the media type of the resource
                    'Content-Type': 'application/json',
                    
                    // AUTHORIZATION ATTRIBUTE - Contains credentials for authentication
                    'Authorization': `Bearer ${authToken}`,
                    
                    // Additional headers
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const profileData = await profileResponse.json();

            // Handle response
            if (profileResponse.ok) {
                setMessage({ 
                    type: 'success', 
                    text: `Welcome back, ${profileData.name || 'User'}! Login successful.` 
                });
                
                // Reset form
                setFormData({
                    email: '',
                    password: ''
                });

                // Store token in localStorage for future requests
                localStorage.setItem('authToken', authToken);
            } else {
                setMessage({ 
                    type: 'error', 
                    text: profileData.message || 'Failed to fetch user profile.' 
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ 
                type: 'error', 
                text: 'Network error. Please check your connection and try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Please login to your account</p>

                {/* Display messages */}
                {message.text && (
                    <div style={{
                        ...styles.message,
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.forgotPassword}>
                        <a href="/forgot-password" style={styles.link}>Forgot password?</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account? <a href="/register" style={styles.link}>Register here</a>
                </p>

                {/* Display token for debugging */}
                {token && (
                    <div style={styles.tokenDisplay}>
                        <strong>Auth Token:</strong> {token.substring(0, 20)}...
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline styles for the component
const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7f6',
        padding: '2rem'
    },
    card: {
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        maxWidth: '450px',
        width: '100%'
    },
    title: {
        color: '#1e3c72',
        textAlign: 'center',
        marginBottom: '0.5rem',
        fontSize: '2rem'
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '2rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#333'
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '1rem'
    },
    button: {
        backgroundColor: '#2a5298',
        color: '#fff',
        padding: '0.85rem',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        marginTop: '1rem'
    },
    message: {
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        textAlign: 'center'
    },
    forgotPassword: {
        textAlign: 'right'
    },
    footer: {
        textAlign: 'center',
        marginTop: '1.5rem',
        color: '#666'
    },
    link: {
        color: '#2a5298',
        textDecoration: 'none',
        fontWeight: '600'
    },
    tokenDisplay: {
        marginTop: '1.5rem',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#666',
        wordBreak: 'break-all'
    }
};

export default LoginPage;