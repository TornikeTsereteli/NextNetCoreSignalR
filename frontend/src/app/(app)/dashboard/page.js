'use client'
import Header from '@/app/(app)/Header'
import Trip from './trip'
import React, { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

// export const metadata = {
//     title: 'Laravel - Dashboard',
// }

const Dashboard = () => {
    const router = useRouter()
    const [routes, setRoutes] = useState([])
    const { user, userGetAllRoutes } = useAuth({ middleware: 'auth' })


    useEffect(() => {
        console.log(user)
    }, [])

    return (
        <>
            {/* <Header title="Tickets" /> */}
            <div className="py-12">
                <div className=" w-max max-auto sm:px-6 lg:px-8">
                    <div className="bg-white max-w-screen-xl w-screen overflow-hidden  sm:rounded-lg flex flex-wrap justify-around bg-transparent">



                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
