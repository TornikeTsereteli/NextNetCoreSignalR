import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter()
    const params = useParams()

    const {
        data: user,
        error,
        mutate,
    } = useSWR('/user', () =>
        axios
            .get('/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response.status !== 409) throw error
                console.log('from useSWR')
                router.push('/verify-email')
            }),
    )

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({ setErrors, ...props }) => {
        setErrors([]) // Clear previous errors
        console.log(props)
        try {
            // Call the registration endpoint
            const response = await axios.post(
                'http://localhost:5032/register',
                props,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true, // Include cookies if needed
                },
            )

            console.log('Registration successful:', response.data)

            // Redirect to login page after successful registration
            router.push('/login')
        } catch (exc) {
            console.log('Registration failed')
            console.log(exc.response?.status)
            console.log(exc.response?.data?.message)

            // Handle errors if needed
            setErrors([exc.response?.data?.message || 'An error occurred'])
        }
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        setErrors([])
        setStatus(null)

        try {
            const response = await axios.post(
                'http://localhost:5032/login',
                props,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true, // Include cookies if needed
                },
            )

            console.log('Login successful:', response.data)

            // Redirect to the dashboard after login
            router.push('/dashboard')
        } catch (exc) {
            console.log('Login failed')
            console.log(exc.response?.status)
            console.log(exc.response?.data?.message)

            console.log(exc.response?.data)
            // Handle errors
            setErrors({
                email_verified: [exc.response?.data],
            })

        }
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/reset-password', { token: params.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post(
                '/send-verification-notification',
                { email: user?.email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                },
            )
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate())
        }

        window.location.pathname = '/login'

        await csrf()
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)

        if (user && middleware === 'auth' && !user?.isVerified) {
            router.push('/verify-email')
        }

        if (
            window.location.pathname === '/verify-email' &&
            user?.isVerified
        )
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
