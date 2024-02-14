'use client'
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parse, string, object, minLength, email } from 'valibot';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';
import Image from "next/image";

const UserEmailSchema = object({
    email: string([
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.')
    ]),
});

const UserPasswordSchema = object({
    password: string([
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.')
    ]),
});

const AuthForm: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setEmailError(null);
        setPasswordError(null);
        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'email':
                setEmailError(error);
                break;
            case 'password':
                setPasswordError(error);
                break;
            default:
                setMessage(error);
                break;
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;

        //console.log('Change event name:', name);
        //console.log('Change event value:', value);

        //console.log('Change formData Name:', formData.name);
        //console.log('Change formData Email:', formData.email);

        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;

        //Input field validation
        try {
            switch (name) {
                case 'email':
                    parse(UserEmailSchema, { email: value });
                    setEmailError(null);
                    break;
                case 'password':
                    parse(UserPasswordSchema, { password: value });
                    setPasswordError(null);
                    break;
                default:
                    setMessage(null);
                    break;
            }
        } catch (error: any) {
            displayErrorUnderField(name, error.message);

            // Checking values for developer
            console.log('Blur event name:', name);
            console.log('Blur event value:', value);

            console.log('Blur formData Email:', formData.email);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        console.error(formData); // return data in JSON format.

        let isError: boolean = false; // To check if any error is found in the form data.

        try {
            parse(UserEmailSchema, { email: formData.email });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('email', error.message);
        }

        try {
            parse(UserPasswordSchema, { password: formData.password });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('password', error.message);
        }

        if (isError) {
            setIsLoading(false);
            return;
        }

        try {
            // Clear error messages as the all validations are passed successfully.
            clearErrorUnderField();

            const email = formData.email;
            const password = formData.password;

            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl: '/'
            });

            console.log("------------", res);
            console.log("------------", res?.ok);
            console.log("------------", res?.error);

            if (res?.ok) {
                router.push('/');
            } else if (res?.error) {
                console.error(res?.error);
                setMessage(res?.error);
            } else {
                console.error("Something went wrong");
                setMessage("Something went wrong");
            }
        } catch (error: any) {
            console.error(error.message);
            setMessage(error.message);

        } finally {
            setIsLoading(false);
        }

        console.log('On Submit Email:', formData.email);
    };

    return (
        <form onSubmit={handleSubmit} >
            <label className="block mb-2 text-lg font-semibold text-gray-700">
                Email:
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
                {emailError && <p className="text-red-500">{emailError}</p>}
            </label>
            <br />
            <label className="block mb-2 text-lg font-semibold text-gray-700">
                Password:
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
                {passwordError && <p className="text-red-500">{passwordError}</p>}
            </label>
            <br />
            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-2 bg-blue-500 text-white rounded-md bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring focus:border-purple-300"
            >
                {isLoading ? 'Loading...' : 'Login'}
            </button>
            {message && (<div className="mt-4 text-red-700"><p>{message}</p></div>)}
        </form>
    );
}


const Auth = () => {
    return (
        <div className="relative h-* w-full bg-[url('/images/login-bg.jpg')] bg-no-repeat bg-center bg-fixed bg-cover" >
            <div className="bg-black w-full h-full lg:bg-opacity-50">
                <nav className="px-12 py-5 flex justify-center">
                    <Image src="/images/logo.png" width={500} height={0}  alt="Logo" />
                </nav>

                <div className="flex justify-center">
                    <div className="max-w-md mx-auto my-4 mb-10 p-4 bg-purple-300 shadow-md rounded-md">
                        <h1 className="text-3xl font-bold mb-4 text-center text-purple-700">Login</h1>
                        <div className="ml-2 mr-2">
                            <AuthForm />
                        </div>

                        <div className="flex flex-row items-center gap-4 mt-8 justify-center">
                            <div onClick={() => signIn('google', { callbackUrl: '/' })} className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                                <FcGoogle size={32} />
                            </div>
                            <div onClick={() => signIn('github', { callbackUrl: '/' })} className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                                <FaGithub size={32} />
                            </div>
                        </div>

                        <div className="text-neutral-500 mt-6 text-right">
                            <Link href="/register">Create an account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

