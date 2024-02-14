'use client'
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parse, string, object, minLength, email } from 'valibot';
import Link from 'next/link';
import Image from "next/image";

const UserNameSchema = object({
    name: string([
        minLength(1, 'Please enter your name.'),
        minLength(3, 'Your name must have 3 characters or more.')
    ]),
});

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

const UserRoleSchema = object({
    role: string([minLength(1, 'Please select a role.')]),
});

const RegisterForm: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setRoleError(null);
        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'name':
                setNameError(error);
                break;
            case 'email':
                setEmailError(error);
                break;
            case 'password':
                setPasswordError(error);
                break;
            case 'role':
                setRoleError(error);
                break;
            default:
                setMessage(error);
                break;
        }
    };

    const handleChange = (event: any): void => {
        const { name, value } = event.target;

        //console.log('Change event name:', name);
        //console.log('Change event value:', value);

        //console.log('Change formData Name:', formData.name);
        //console.log('Change formData Email:', formData.email);

        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleBlur = (event: any): void => {
        const { name, value } = event.target;

        //Input field validation
        try {
            switch (name) {
                case 'name':
                    parse(UserNameSchema, { name: value });
                    setNameError(null);
                    break;
                case 'email':
                    parse(UserEmailSchema, { email: value });
                    setEmailError(null);
                    break;
                case 'password':
                    parse(UserPasswordSchema, { password: value });
                    setPasswordError(null);
                    break;
                case 'role':
                    parse(UserRoleSchema, { role: value });
                    setRoleError(null);
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

            console.log('Blur formData Name:', formData.name);
            console.log('Blur formData Phone:', formData.email);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        let isError: boolean = false; // To check if any error is found in the form data.

        // Validate the entire form input field based on the schema
        try {
            parse(UserNameSchema, { name: formData.name });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('name', error.message);
        }

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

        try {
            parse(UserRoleSchema, { role: formData.role });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('role', error.message);
        }

        if (isError) {
            setIsLoading(false);
            return;
        }

        try {
            // Clear error messages as the all validations are passed successfully.
            clearErrorUnderField();

            const { name, email, password, role } = formData;
            const requestBody = JSON.stringify({
                name,
                email,
                password,
                role,
            })
            //
            const response = await fetch('/api-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: requestBody,
            });


            // Handle response
            const data = await response.json();

            // console.error("==========", data);
            // console.error("==========", data.user);
            // console.error("==========", data.message);

            // Check if the response has a user and message property
            if (data.message) {
                setMessage(data.message);
            }
            else if (data.user) {
                router.push('/auth');
            } else {
                setMessage('Error: Unexpected response from the server.');
            }
        } catch (error: any) {
            console.error(error.message);
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }

        // console.log('On Submit Name:', formData.name);
        // console.log('On Submit Phone:', formData.email);
    };

    return (
        <form onSubmit={handleSubmit} >
            <label className="block mb-2 text-lg font-semibold text-gray-700">
                Name:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
                {nameError && <p className="text-red-500">{nameError}</p>}
            </label>
            <br />
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
            <label className="block mb-2 text-lg font-semibold text-gray-700">
                Role:
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                >
                    <option value={undefined}>Select a role</option>
                    {/* <option value={1}>Admin</option> */}
                    <option value={2}>User</option>
                </select>
                {roleError && <p className="text-red-500">{roleError}</p>}
            </label>
            <br />
            <button
                type="submit"
                disabled={isLoading}
                className="w-full p-2 bg-blue-500 text-white rounded-md bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring focus:border-purple-300"
            >
                {isLoading ? 'Loading...' : 'Create'}
            </button>
            {message && (<div className="mt-4 text-red-700"><p>{message}</p></div>)}
        </form>
    );
}


const Register = () => {
    return (
        <div className="relative h-* w-full bg-[url('/images/login-bg.jpg')] bg-no-repeat bg-center bg-fixed bg-cover" >
            <div className="bg-black w-full h-full lg:bg-opacity-50">
                <nav className="px-12 py-5 flex justify-center">
                    <Image src="/images/logo.png" width={500} height={0} alt="Logo" />
                </nav>

                <div className="flex justify-center">
                    <div className="max-w-md mx-auto my-4 mb-10 p-4 bg-purple-300 shadow-md rounded-md">
                        <h1 className="text-3xl font-bold mb-4 text-center text-purple-700">Login</h1>
                        <div className="ml-2 mr-2">
                            <RegisterForm />
                        </div>

                        <div className="text-neutral-500 mt-6 text-right">
                            <Link href="/auth">Login account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    // return (
    //     <div className="max-w-md mx-auto my-4 p-4 bg-gray-100 shadow-md rounded-md">
    //         <h1 className="text-3xl font-bold mb-4 text-center text-gray-700">Register Form</h1>
    //         <RegisterForm />
    //     </div>
    // );
};

export default Register;


//https://formeezy.com/examples/next-js-example
