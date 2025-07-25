import React, {useState, useEffect} from 'react'
import authService from '../appwrite/auth'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import {Button, Input, Logo} from './index.js'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const dispatch = useDispatch()
    const {register, handleSubmit, formState: { errors }} = useForm()

    // Ensure light mode is applied if it's the default
    useEffect(() => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (!isDarkMode) {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const create = async(data) => {
        setError("")
        setLoading(true)
        setSuccess(false)
        
        try {
            // Validate password strength
            if (data.password.length < 8) {
                setError("Password must be at least 8 characters long")
                setLoading(false)
                return
            }
            
            // Create account
            const userData = await authService.createAccount(data)
            if (userData) {
                setSuccess(true)
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(login({userData}));
                
                // Short delay before redirect for better UX
                setTimeout(() => {
                    navigate("/")
                }, 1000)
            }
        } catch (error) {
            console.error("Registration error:", error)
            // Extract and format error message
            let errorMsg = error.message || "Registration failed"
            
            // Handle specific Appwrite error codes
            if (error.code === 409) {
                errorMsg = "Email already exists. Please use a different email or login."
            } else if (error.code === 400) {
                errorMsg = "Invalid email or password format."
            }
            
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-secondary-white dark:bg-primary-charcoal rounded-xl p-10 border border-secondary-mediumGray dark:border-primary-slate`}>
            <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight text-primary-dark dark:text-secondary-white">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-secondary-darkGray dark:text-secondary-mediumGray">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-accent-blue transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
                {success && <p className="text-green-600 mt-4 text-center">Account created successfully! Redirecting...</p>}

                <form onSubmit={handleSubmit(create)}>
                    <div className='space-y-5'>
                        <Input
                        label="Full Name: "
                        placeholder="Enter your full name"
                        {...register("name", {
                            required: "Full name is required",
                            minLength: {
                                value: 2,
                                message: "Name must be at least 2 characters"
                            }
                        })}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                        
                        <Input
                        label="Email: "
                        placeholder="Enter your email"
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            validate: {
                                matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                        
                        <Input
                        label="Password: "
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters"
                            }
                        })}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                        
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </div>
                </form>
            </div>

    </div>
  )
}

export default Signup