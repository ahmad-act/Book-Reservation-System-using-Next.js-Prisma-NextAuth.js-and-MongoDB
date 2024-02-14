'use server'
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/authOptions'

export const ServerSession = async () => {
    const session = await getServerSession(authOptions);

  return <pre>{JSON.stringify(session)}</pre>
}
