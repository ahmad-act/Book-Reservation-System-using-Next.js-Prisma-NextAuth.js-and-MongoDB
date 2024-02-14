'use client'
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';

const txtBookCategoryNameSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(500, 'The book title must have 500 characters or less.'),
    ]),
});

const txtBookCategoryDescriptionSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(1000, 'The book title must have 1000 characters or less.'),
    ]),
});

const AddForm = ({ onCancel, onAddData }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [controlsValue, setControlsValue] = useState({
        txtBookCategoryName: '',
        txtBookCategoryDescription: '',
    });

    const [txtBookCategoryNameError, setTxtBookCategoryNameError] = useState<string | null>(null);
    const [txtBookCategoryDescriptionError, setTxtBookCategoryDescriptionError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setTxtBookCategoryNameError(null);
        setTxtBookCategoryDescriptionError(null);

        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'txtBookCategoryName':
                setTxtBookCategoryNameError(error);
                break;
            case 'txtBookCategoryDescription':
                setTxtBookCategoryDescriptionError(error);
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
                case 'txtBookCategoryName':
                    parse(txtBookCategoryNameSchema, { name: value });
                    setTxtBookCategoryNameError(null);
                    break;
                case 'txtBookCategoryDescription':
                    parse(txtBookCategoryDescriptionSchema, { name: value });
                    setTxtBookCategoryDescriptionError(null);
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
        if (controlsValue.txtBookCategoryName || controlsValue.txtBookCategoryDescription) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You want to cancel this book category!",
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

        if (controlsValue.txtBookCategoryName.trim() === '' || !controlsValue.txtBookCategoryName) {
            await Swal.fire({
                title: "Error!",
                html: `Book category is required.`,
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }
        else if (controlsValue.txtBookCategoryDescription.trim() === '' || !controlsValue.txtBookCategoryDescription) {
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
            parse(txtBookCategoryNameSchema, { name: controlsValue.txtBookCategoryName });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtBookCategoryName', error.message);
        }

        try {
            parse(txtBookCategoryDescriptionSchema, { name: controlsValue.txtBookCategoryDescription });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtBookCategoryDescription', error.message);
        }

        setIsLoading(false);

        if (isError) {
            return;
        }


        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to add this book category!",
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
                txtBookCategoryName: '',
                txtBookCategoryDescription: '',
            });

            clearErrorUnderField();
        }
    };

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Category</h1>
            <form onSubmit={handleSubmitButtonClick} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="lblBookCategoryName" className="block text-gray-700">Book Category<span className="text-red-500">*</span></label>
                    <input type="text" id="txtBookCategoryName" name="txtBookCategoryName" value={controlsValue.txtBookCategoryName} onChange={handleTextChange} onBlur={handleBlur} title='Enter book title' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtBookCategoryNameError && <p className="text-red-500">{txtBookCategoryNameError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblBookCategoryDescription" className="block text-gray-700">Description<span className="text-red-500">*</span></label>
                    <textarea id="txtBookCategoryDescription" name="txtBookCategoryDescription" value={controlsValue.txtBookCategoryDescription} onChange={handleTextChange} title='Enter description' className="border rounded-md px-3 py-2 mt-1 w-full h-24 min-h-[6rem] max-h-[24rem]" />
                    {txtBookCategoryDescriptionError && <p className="text-red-500">{txtBookCategoryDescriptionError}</p>}
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
