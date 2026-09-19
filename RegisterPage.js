// RegisterPage.js
// Registration Page Component - Full Stack Capstone Project
// Contains fetch request with method and headers attributes

import React, { useState } from 'react';

function RegisterPage() {
    // State for form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // State for loading and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);

        try {
            // =========================================
            // FETCH REQUEST WITH METHOD AND HEADERS
            // =========================================
            const response = await fetch('http://localhost:3000/api/register', {
                // METHOD ATTRIBUTE - Specifies HTTP method
                method: 'POST',

                // HEADERS ATTRIBUTE - Specifies request headers
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },

                // Request body with user data
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            // Parse the response
            const data = await response.json();

            // Handle response
            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: data.message || 'Registration successful! Please check your email.' 
                });
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || 'Registration failed. Please try again.' 
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Register to get started</p>

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

                {/* Registration Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            style={styles.input}
                        />
                    </div>

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
                            placeholder="Minimum 6 characters"
                            required
                            minLength="6"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            required
                            style={styles.input}
                        />
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
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account? <a href="/login" style={styles.link}>Login here</a>
                </p>
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
