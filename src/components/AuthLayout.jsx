import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import { Loader } from '@welcome-ui/loader'

export default function Protected({children, authentication = true}) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        // Ensure theme is applied before rendering
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // If authentication is required but user is not authenticated
        if (authentication && !authStatus) {
            navigate("/login")
        } 
        // If authentication is not required but user is already authenticated
        else if (!authentication && authStatus) {
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? <Loader size="lg" /> : <>{children}</>
}

