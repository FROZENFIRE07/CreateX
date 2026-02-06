/**
 * SACO Frontend App
 * Main application with routing and auth context
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ContentUpload from './components/Upload/ContentUpload';
import ContentDetail from './components/Content/ContentDetail';
import BrandSettings from './components/Brand/BrandSettings';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-page">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Layout with navbar for authenticated pages
function Layout({ children }) {
    const { user, logout } = useAuth();

    return (
        <>
            <nav className="navbar">
                <div className="container navbar-inner">
                    <a href="/" className="navbar-brand">
                        <div className="navbar-logo">S</div>
                        <span>SACO</span>
                    </a>

                    <div className="navbar-nav">
                        <a href="/" className="btn btn-ghost">Dashboard</a>
                        <a href="/upload" className="btn btn-ghost">Upload</a>
                        <a href="/brand" className="btn btn-ghost">Brand DNA</a>
                        <button onClick={logout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main className="page">
                <div className="container">
                    {children}
                </div>
            </main>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/upload" element={
                        <ProtectedRoute>
                            <Layout>
                                <ContentUpload />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/content/:id" element={
                        <ProtectedRoute>
                            <Layout>
                                <ContentDetail />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/brand" element={
                        <ProtectedRoute>
                            <Layout>
                                <BrandSettings />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
