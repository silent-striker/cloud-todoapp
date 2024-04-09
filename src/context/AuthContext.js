import React, { createContext } from 'react'

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const SESSION_KEY = "userData";

    const getUserInfo = ()  => {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    }

    const isLoggedIn = () => {
        const userData = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        return userData !== null && userData !== undefined
            && userData.accessToken !== null && userData.accessToken !== undefined
            && userData.userId !== undefined
            && userData.userId !== null;
    }

    const isSessionValid = () => {
        const userData = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        return isLoggedIn() && userData.expiry !== undefined
            && userData.expiry !== null
            && userData.expiry > Math.round(Date.now() / 1000);
    }

    const clearSession = () => {
        sessionStorage.removeItem(SESSION_KEY);
    }

    const authData = {
        getUserInfo,
        isSessionValid,
        clearSession
    }

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;