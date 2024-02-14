import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import { generateReferenceNumber } from '@/lib/commonUtil'

const txtBookReservationNameSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(500, 'The book title must have 500 characters or less.'),
    ]),
});

const txtBookReservationDescriptionSchema = object({
    name: string([
        minLength(1, 'Please enter book title.'),
        minLength(3, 'The book title must have 3 characters or more.'),
        maxLength(1000, 'The book title must have 1000 characters or less.'),
    ]),
});

const AddForm = ({ bookInfos, onCancel, onAddData }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [controlsValue, setControlsValue] = useState({
        txtReservationRef: generateReferenceNumber('REF'),
        txtReservationComment: '',
        txtClientName: '',
        txtClientEmail: '',
        txtClientPhone: '',
        txtClientAddress: '',
        txtReservationDate: new Date().toISOString().slice(0, 10),
        reservationDetails: [{ cboBookInfo: bookInfos.length > 0 ? bookInfos[0].id : '', txtQuantity: 1 }],
    });

    const [txtBookReservationNameError, setTxtBookReservationNameError] = useState<string | null>(null);
    const [txtBookReservationDescriptionError, setTxtBookReservationDescriptionError] = useState<string | null>(null);

    const clearErrorUnderField = (): void => {
        setTxtBookReservationNameError(null);
        setTxtBookReservationDescriptionError(null);
        setMessage(null);
    };

    const displayErrorUnderField = (fieldName: string, error: string): void => {
        switch (fieldName) {
            case 'txtReservationRef':
                setTxtBookReservationNameError(error);
                break;
            case 'txtReservationComment':
                setTxtBookReservationDescriptionError(error);
                break;
            default:
                setMessage(error);
                break;
        }
    };

    const handleTextChange = (e: any) => {
        const { name, value } = e.target;
        setControlsValue({
            ...controlsValue,
            [name]: value
        });
    };

    const handleBlur = (event: any): void => {
        const { name, value } = event.target;
        try {
            switch (name) {
                case 'txtReservationRef':
                    parse(txtBookReservationNameSchema, { name: value });
                    setTxtBookReservationNameError(null);
                    break;
                case 'txtReservationComment':
                    parse(txtBookReservationDescriptionSchema, { name: value });
                    setTxtBookReservationDescriptionError(null);
                    break;
                default:
                    setMessage('Input field does not exist');
                    break;
            }
            setMessage(null);
        } catch (error: any) {
            displayErrorUnderField(name, error.message);
        }
    };

    const handleCancelButtonClick = async () => {
        if (controlsValue.txtReservationRef || controlsValue.txtReservationComment) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You want to cancel this book reservation!",
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

        // Check if there's at least one reservation detail entered
        if (controlsValue.reservationDetails.length === 0 || controlsValue.reservationDetails[0].cboBookInfo.trim() === '') {
            await Swal.fire({
                title: "Error!",
                html: `At least one reservation detail is required.`,
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
            setIsLoading(false);
            return;
        }

        // Validate the input fields based on the schema
        try {
            parse(txtBookReservationNameSchema, { name: controlsValue.txtReservationRef });
            parse(txtBookReservationDescriptionSchema, { name: controlsValue.txtReservationComment });
        } catch (error: any) {
            displayErrorUnderField(error.fieldName, error.message);
            setIsLoading(false);
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to add this book reservation!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, add it!",
        });

        if (result.isConfirmed) {
            setIsLoading(false);
            onAddData(controlsValue);
            setControlsValue({
                txtReservationRef: '',
                txtReservationComment: '',
                txtClientName: '',
                txtClientEmail: '',
                txtClientPhone: '',
                txtClientAddress: '',
                txtReservationDate: '',
                reservationDetails: [{ cboBookInfo: '', txtQuantity: 1 }],
            });
            clearErrorUnderField();
        }
    };

    const handleReservationDetailChange = (e: any, index: number) => {
        const { name, value } = e.target;
        const updatedDetails = [...controlsValue.reservationDetails];
        updatedDetails[index] = {
            ...updatedDetails[index],
            [name]: value
        };
        setControlsValue({
            ...controlsValue,
            reservationDetails: updatedDetails
        });
    };

    const handleAddReservationDetail = () => {
        setControlsValue({
            ...controlsValue,
            reservationDetails: [
                ...controlsValue.reservationDetails,
                {
                    cboBookInfo: bookInfos && bookInfos.length > 0 ? bookInfos[0] : '', // Preselect the first book title if available
                    txtQuantity: 1
                }
            ]
        });
    };

    const handleRemoveReservationDetailButtonClick = (index: number) => {
        const updatedDetails = [...controlsValue.reservationDetails];
        updatedDetails.splice(index, 1);
        setControlsValue({
            ...controlsValue,
            reservationDetails: updatedDetails
        });
    };

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Reservation</h1>
            <form onSubmit={handleSubmitButtonClick} className="max-w-sm mx-auto">
                <div className="mb-4">
                    <label htmlFor="lblBookReservationName" className="block text-gray-700">Book Reservation<span className="text-red-500">*</span></label>
                    <input type="text" id="txtReservationRef" name="txtReservationRef" value={controlsValue.txtReservationRef} onChange={handleTextChange} onBlur={handleBlur} title='Enter book title' className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {txtBookReservationNameError && <p className="text-red-500">{txtBookReservationNameError}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblBookReservationDescription" className="block text-gray-700">Description<span className="text-red-500">*</span></label>
                    <textarea id="txtReservationComment" name="txtReservationComment" value={controlsValue.txtReservationComment} onChange={handleTextChange} title='Enter description' className="border rounded-md px-3 py-2 mt-1 w-full h-24 min-h-[6rem] max-h-[24rem]" />
                    {txtBookReservationDescriptionError && <p className="text-red-500">{txtBookReservationDescriptionError}</p>}
                </div>

                {/* Client Information */}
                <div className="mb-4">
                    <label htmlFor="lblClientName" className="block text-gray-700">Client Name<span className="text-red-500">*</span></label>
                    <input type="text" id="txtClientName" name="txtClientName" value={controlsValue.txtClientName} onChange={handleTextChange} onBlur={handleBlur} className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {/* Add error display if needed */}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblClientEmail" className="block text-gray-700">Client Email<span className="text-red-500">*</span></label>
                    <input type="email" id="txtClientEmail" name="txtClientEmail" value={controlsValue.txtClientEmail} onChange={handleTextChange} onBlur={handleBlur} className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {/* Add error display if needed */}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblClientPhone" className="block text-gray-700">Client Phone<span className="text-red-500">*</span></label>
                    <input type="tel" id="txtClientPhone" name="txtClientPhone" value={controlsValue.txtClientPhone} onChange={handleTextChange} onBlur={handleBlur} className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {/* Add error display if needed */}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblClientAddress" className="block text-gray-700">Client Address<span className="text-red-500">*</span></label>
                    <textarea id="txtClientAddress" name="txtClientAddress" value={controlsValue.txtClientAddress} onChange={handleTextChange} onBlur={handleBlur} className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {/* Add error display if needed */}
                </div>
                <div className="mb-4">
                    <label htmlFor="lblReservationDate" className="block text-gray-700">Reservation Date<span className="text-red-500">*</span></label>
                    <input type="date" id="txtReservationDate" name="txtReservationDate" value={controlsValue.txtReservationDate} onChange={handleTextChange} onBlur={handleBlur} className="border rounded-md px-3 py-2 mt-1 w-full" />
                    {/* Add error display if needed */}
                </div>

                {/* Reservation Details Section */}
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Reservation Details</h2>
                    {controlsValue.reservationDetails.map((detail, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <select
                                name="cboBookInfo"
                                value={detail.cboBookInfo}
                                onChange={(e) => handleReservationDetailChange(e, index)}
                                className="border rounded-md px-3 py-2 mt-1 mr-2 w-2/3"
                            >
                                {Array.isArray(bookInfos) &&
                                    bookInfos.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.bookTitle}
                                        </option>
                                    ))}
                            </select>
                            <input
                                name='txtQuantity'
                                type="number"
                                value={detail.txtQuantity}
                                onChange={(e) => handleReservationDetailChange(e, index)}
                                placeholder="Quantity"
                                min={1}
                                max={10000}
                                className="border rounded-md px-3 py-2 mt-1 w-1/3"
                            />
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveReservationDetailButtonClick(index)}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                >
                                    <FaMinusCircle className="h-5 w-5" /> {/* React icon for remove button */}
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddReservationDetail}
                        className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                        <FaPlusCircle className="h-5 w-5 mr-2" /> {/* React icon for add button */}
                        Add Detail
                    </button>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mr-2"
                    >
                        {isLoading ? 'Wait...' : 'Add Book'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelButtonClick}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>

                {message && (<div className="mt-4 text-red-700"><p>{message}</p></div>)}
            </form>
        </>
    );
};

export default AddForm;
