'use client'
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Header = () => {
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ redirect: true });
        //redirect('/'); 
    };

    return (
        <div className="bg-orange-500 text-white px-4 mb-4 rounded-md">
            <div className="container mx-auto py-4">
                <div className="flex items-center justify-between">
                    <nav className="flex">
                        <a href="/" className="ml-4 hover:text-gray-300">Home</a>
                        <a href="/bookreservation" className="ml-4 hover:text-gray-300">Book Reservation</a>
                        <a href="/bookinfo" className="ml-4 hover:text-gray-300">Book Information</a>
                        <a href="/bookcategory" className="ml-4 hover:text-gray-300">Book Category</a>
                        <a href="/userinfo" className="ml-4 hover:text-gray-300">User Information</a>
                    </nav>
                    <div>
                        {session ? (
                            <button onClick={handleSignOut}>Sign out</button>
                        ) : (
                            <button onClick={() => signIn('github', { callbackUrl: '/' })}>Sign in</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
