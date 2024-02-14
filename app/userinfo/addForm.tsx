'use client'
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength, regex } from 'valibot';

const txtNameSchema = object({
    name: string([
        minLength(1, 'Please enter your name.'),
        minLength(3, 'Your name must have 3 characters or more.')
    ]),
});

const txtEmailSchema = object({
    email: string([
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.')
    ]),
});

const txtPhoneSchema = object({
    phone: string([
        minLength(1, 'Please enter your phone number.'),
        regex(/^\d{10}$/, 'The phone number is badly formatted.')
    ])
});

const txtPasswordSchema = object({
    password: string([
        minLength(1, "Please enter your password."),
        minLength(8, "Your password must have 8 characters or more."),
    ]),
});

const txtAddressSchema = object({
    address: string([
        minLength(1, 'Please enter address.'),
        minLength(3, 'The address must have 3 characters or more.'),
        maxLength(150, 'The address must have 150 characters or less.'),
    ]),
});

const AddForm = ({ userRoles, onCancel, onAddData }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [controlsValue, setControlsValue] = useState({
        txtName: '',
        txtEmail: '',
        txtPhone: '',
        txtAddress: '',
        cboUserRole: 10,
        txtPassword: '',
    });

    const [txtNameError, setTxtNameError] = useState<string | null>(null);
    const [txtEmailError, setTxtEmailError] = useState<string | null>(null);
    const [txtPhoneError, setTxtPhoneError] = useState<string | null>(null);
    const [txtAddressError, setTxtAddressError] = useState<string | null>(null);
    const [cboUserRoleError, setCboUserRoleError] = useState<string | null>(null);
    const [txtPasswordError, setTxtPasswordError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setTxtNameError(null);
        setTxtEmailError(null);
        setTxtPhoneError(null);
        setTxtAddressError(null);
        setCboUserRoleError(null);
        setTxtPasswordError(null);

        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'txtName':
                setTxtNameError(error);
                break;
            case 'txtEmail':
                setTxtEmailError(error);
                break;
            case 'txtPhone':
                setTxtPhoneError(error);
                break;
            case 'txtAddress':
                setTxtAddressError(error);
                break;
            case 'CboUserRole':
                setCboUserRoleError(error);
                break;
            case 'txtPassword':
                setTxtPasswordError(error);
                break;
            default:
                setMessage(error);
                break;
        }
    };

    const handleTextChange = (e: any) => {
        const { name, value } = e.target;

        if (name === 'txtNumber') {
            // // Ensure the value is within the allowed range
            // const sanitizedValue = Math.min(Math.max(Number(value), 0), 10000);

            // setControlsValue({
            //     ...ControlsValue,
            //     [name]: sanitizedValue
            // });
        }
        else {
            setControlsValue({
                ...controlsValue,
                [name]: value
            });
        }
    };

    const handleBlur = (event: any): void => {
        const { name, value } = event.target;
        //Input field validation
        try {
            switch (name) {
                case 'txtName':
                    parse(txtNameSchema, { name: value });
                    setTxtNameError(null);
                    break;

                case 'txtEmail':
                    parse(txtEmailSchema, { email: value });
                    setTxtEmailError(null);
                    break;
                case 'txtPhone':
                    parse(txtPhoneSchema, { phone: value });
                    setTxtPhoneError(null);
                    break;

                case 'txtAddress':
                    parse(txtAddressSchema, { address: value });
                    setTxtAddressError(null);
                    break;
                case 'cboUserRole':
                    parse(txtAddressSchema, { name: value });
                    setCboUserRoleError(null);
                    break;
                case 'txtPassword':
                    parse(txtPasswordSchema, { password: value });
                    setTxtPasswordError(null);
                    break;

                default:
                    setMessage('Input field does not exist');
                    break;
            }

            setMessage(null);
        } catch (error: any) {
            displayErrorUnderField(name, error.message);

            // // Checking values for developer
            // console.log('Blur event name:', name);
            // console.log('Blur event value:', value);
        }
    };

    const handleCancelButtonClick = async () => {
        if (controlsValue.txtName || controlsValue.txtAddress) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You want to cancel this user info!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, cancel it!",
            });

            if (result.isConfirmed) {
                onCancel();
            }
        }
        else {
            onCancel();
        }
    };

    const handleSubmitButtonClick = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);

        if (controlsValue.txtName.trim() === '' || !controlsValue.txtName) {
            await Swal.fire({
                title: "Error!",
                html: `User info is required.`,
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }
        else if (controlsValue.txtAddress.trim() === '' || !controlsValue.txtAddress) {
            await Swal.fire({
                title: "Error!",
                html: `Description is required.`,
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }

        let isError: boolean = false; // To check if any error is found in the form data.

        // Validate the input fields based on the schema
        try {
            parse(txtNameSchema, { name: controlsValue.txtName });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtName', error.message);
        }

        try {
            parse(txtEmailSchema, { email: controlsValue.txtEmail });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtEmail', error.message);
        }
        try {
            parse(txtPhoneSchema, { phone: controlsValue.txtPhone });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtPhone', error.message);
        }


        try {
            parse(txtAddressSchema, { address: controlsValue.txtAddress });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtAddress', error.message);
        }

        setIsLoading(false);

        if (isError) {
            return;
        }


        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to add this user info!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, add it!",
        });

        if (result.isConfirmed) {
            onAddData(controlsValue); // Call the onAddData function from the parent component

            // Clear form after submission
            setControlsValue({
                txtName: '',
                txtEmail: '',
                txtPhone: '',
                txtAddress: '',
                cboUserRole: 10,
                txtPassword: '',
            });

            clearErrorUnderField();
        }
    };

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">User Information</h1>
            <form onSubmit={handleSubmitButtonClick} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="lblName" className="block text-gray-700">Name<span className="text-red-500">*</span></label>
                    <input type="text" id="txtName" name="txtName" value={controlsValue.txtName} onChange={handleTextChange} onBlur={handleBlur} title='Enter name' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtNameError && <p className="text-red-500">{txtNameError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblEmail" className="block text-gray-700">Email<span className="text-red-500">*</span></label>
                    <input type="text" id="txtEmail" name="txtEmail" value={controlsValue.txtEmail} onChange={handleTextChange} onBlur={handleBlur} title='Enter email' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtEmailError && <p className="text-red-500">{txtEmailError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblPhone" className="block text-gray-700">Phone<span className="text-red-500">*</span></label>
                    <input type="text" id="txtPhone" name="txtPhone" value={controlsValue.txtPhone} onChange={handleTextChange} onBlur={handleBlur} title='Enter phone' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtPhoneError && <p className="text-red-500">{txtPhoneError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblAddress" className="block text-gray-700">Address<span className="text-red-500">*</span></label>
                    <textarea id="txtAddress" name="txtAddress" value={controlsValue.txtAddress} onChange={handleTextChange} title='Enter description' className="border rounded-md px-3 py-2 mt-1 w-full h-24 min-h-[6rem] max-h-[24rem]" />
                    {txtAddressError && <p className="text-red-500">{txtAddressError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblUserRole" className="block text-gray-700">Book Category</label>
                    <select
                        name="cboUserRole"
                        title={"Select book category"}
                        value={controlsValue.cboUserRole}
                        onChange={handleTextChange}
                        className="border p-2 mt-1 rounded-md w-full"
                    >
                        {Array.isArray(userRoles) &&
                            userRoles.map((userRole: any) => (
                                <option key={userRole.roleSerial} value={userRole.roleSerial}>
                                    {userRole.roleName}
                                </option>
                            ))}
                    </select>
                    {cboUserRoleError && <p className="text-red-500">{cboUserRoleError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblEmail" className="block text-gray-700">Password<span className="text-red-500">*</span></label>
                    <input type="text" id="txtPassword" name="txtPassword" value={controlsValue.txtPassword} onChange={handleTextChange} onBlur={handleBlur} title='Enter password' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtPasswordError && <p className="text-red-500">{txtPasswordError}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-green-700 w-36"
                >
                    {isLoading ? 'Wait...' : 'Add Book'}
                </button>
                <button type="button" onClick={handleCancelButtonClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">Cancel</button>
                {message && (<div className="mt-4 text-red-700"><p>{message}</p></div>)}
            </form>
        </>
    );
};

export default AddForm;
