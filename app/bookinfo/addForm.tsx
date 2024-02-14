'use client'
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';

const txtBookTitleSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(500, 'The book title must have 500 characters or less.'),
    ]),
});

const txtNoteSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(1000, 'The book title must have 1000 characters or less.'),
    ]),
});

const AddForm = ({ bookCategories, onCancel, onAddData }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [controlsValue, setControlsValue] = useState({
        txtBookTitle: '',
        txtAuthor: '',
        txtISBN: '',
        txtPublisher: '',
        txtPublishDate: '',
        txtLanguage: '',
        cboBookCategory: '',
        txtCoverImage: '',
        txtNote: '',
        txtStock: 1,
    });

    const [txtBookTitleError, setTxtBookTitleError] = useState<string | null>(null);
    const [txtNoteError, setTxtNoteError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setTxtBookTitleError(null);
        setTxtNoteError(null);

        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'txtBookTitle':
                setTxtBookTitleError(error);
                break;
            case 'txtNote':
                setTxtNoteError(error);
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
                case 'txtBookTitle':
                    parse(txtBookTitleSchema, { name: value });
                    setTxtBookTitleError(null);
                    break;
                case 'txtNote':
                    parse(txtNoteSchema, { name: value });
                    setTxtNoteError(null);
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
        if (controlsValue.txtBookTitle || controlsValue.txtNote) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You want to cancel this book info!",
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

        if (controlsValue.txtBookTitle.trim() === '' || !controlsValue.txtBookTitle) {
            await Swal.fire({
                title: "Error!",
                html: `Book info is required.`,
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }
        else if (controlsValue.txtNote.trim() === '' || !controlsValue.txtNote) {
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
            parse(txtBookTitleSchema, { name: controlsValue.txtBookTitle });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtBookTitle', error.message);
        }

        try {
            parse(txtNoteSchema, { name: controlsValue.txtNote });
        } catch (error: any) {
            isError = true;
            displayErrorUnderField('txtNote', error.message);
        }

        setIsLoading(false);

        if (isError) {
            return;
        }


        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to add this book info!",
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
                txtBookTitle: '',
                txtAuthor: '',
                txtISBN: '',
                txtPublisher: '',
                txtPublishDate: '',
                txtLanguage: '',
                cboBookCategory: '',
                txtCoverImage: '',
                txtNote: '',
                txtStock: 1,
            });

            clearErrorUnderField();
        }
    };

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Information</h1>
            <form onSubmit={handleSubmitButtonClick} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="lblBookTitle" className="block text-gray-700">Book Info<span className="text-red-500">*</span></label>
                    <input type="text" id="txtBookTitle" name="txtBookTitle" value={controlsValue.txtBookTitle} onChange={handleTextChange} onBlur={handleBlur} title='Enter book title' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtBookTitleError && <p className="text-red-500">{txtBookTitleError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="author" className="block text-gray-700">Author<span className="text-red-500">*</span></label>
                    <input type="text" id="txtAuthor" name="txtAuthor" value={controlsValue.txtAuthor} onChange={handleTextChange} title='Enter author' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="ISBN" className="block text-gray-700">ISBN</label>
                    <input type="text" id="txtISBN" name="txtISBN" value={controlsValue.txtISBN} onChange={handleTextChange} title='Enter ISBN' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="publisher" className="block text-gray-700">Publisher</label>
                    <input type="text" id="txtPublisher" name="txtPublisher" value={controlsValue.txtPublisher} onChange={handleTextChange} title='Enter publisher' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="publishDate" className="block text-gray-700">Publish Date</label>
                    <input type="date" id="txtPublishDate" name="txtPublishDate" value={controlsValue.txtPublishDate} onChange={handleTextChange} title='Enter publish Date' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="language" className="block text-gray-700">Language</label>
                    <input type="text" id="txtLanguage" name="txtLanguage" value={controlsValue.txtLanguage} onChange={handleTextChange} title='Enter language' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="language" className="block text-gray-700">Book Category</label>
                    <select
                        name="cboBookCategory"
                        title={"Select book category"}
                        value={controlsValue.cboBookCategory}
                        onChange={handleTextChange}
                        className="border p-2 mt-1 rounded-md w-full"
                    >
                        {Array.isArray(bookCategories) &&
                            bookCategories.map((bookCategory: any) => (
                                <option key={bookCategory.id} value={bookCategory.id}>
                                    {bookCategory.bookCategoryName}
                                </option>
                            ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="coverImage" className="block text-gray-700">Cover Image</label>
                    <input type="text" id="txtCoverImage" name="txtCoverImage" value={controlsValue.txtCoverImage} onChange={handleTextChange} title='Enter cover image' className="border rounded-md px-3 py-2 mt-1 w-full" />
                </div>
                <div className="mb-4">
                    <label htmlFor="lblNote" className="block text-gray-700">Description<span className="text-red-500">*</span></label>
                    <textarea id="txtNote" name="txtNote" value={controlsValue.txtNote} onChange={handleTextChange} title='Enter description' className="border rounded-md px-3 py-2 mt-1 w-full h-24 min-h-[6rem] max-h-[24rem]" />
                    {txtNoteError && <p className="text-red-500">{txtNoteError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="stock" className="block text-gray-700">Stock<span className="text-red-500">*</span></label>
                    <input type="number" id="txtStock" name="txtStock" value={controlsValue.txtStock} onChange={handleTextChange} title='Enter stock' min={0} max={10000} step={1} className="border rounded-md px-3 py-2 mt-1 w-full" />
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
