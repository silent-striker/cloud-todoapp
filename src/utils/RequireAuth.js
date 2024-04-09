import React, { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom';

export default function RequireAuth() {
    const { isSessionValid, clearSession } = useAuth();

    useEffect(() => {
        if (!isSessionValid()) {
            clearSession();
        }
    }, []);

    return (
        isSessionValid() ? <Outlet /> : <Navigate to="/login" replace />
    );
}