//import { getServerSession } from 'next-auth'
//import { authOptions } from '@/app/api/auth/authOptions'

export default async function Page() {
    /*const session = await getServerSession(authOptions)

    if (session?.role === 'Admin') {
        return (
            <section className='py-24'>
                <div className='container'>
                    <h1 className='text-2xl font-bold'>Admin Page</h1>
                    <h2 className='text-2xl font-bold'>
                        You are  authorized to view this page
                    </h2>
                </div>
            </section>
        )
    }*/

    return (
        <section className='py-24'>
            <div className='container'>
                <h1 className='text-2xl font-bold'>Admin Page</h1>
                <h2 className='text-2xl font-bold'>
                    You are authorized to view this page
                </h2>
            </div>
        </section>
    )
}
