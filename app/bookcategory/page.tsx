'use client'
import { formatDate } from '@/lib/commonUtil';
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaTimesCircle } from 'react-icons/fa';
import LoadingAnimation from '@/lib/LoadingAnimation';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';
import AddForm from './addForm';
import { BookCategory } from '@prisma/client';
import Header from '@/app/components/header';


interface IShowEditableRow {
    [key: string]: boolean
}

interface IEditedTextValue {
    [key: string]: string;
}

const Page: React.FC = () => {
    // Variables declarations
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchText, setSearchText] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [showHideEditableRow, setShowHideEditableRow] = useState<IShowEditableRow>({});
    const [editedTextValue, setEditedTextValue] = useState<any>({});
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch data from database using API
    const [data, setData] = useState<any>({});

    const bookCategoryPerPage = parseInt(process.env.NEXT_PUBLIC_RECORD_PER_PAGE ?? '30');
    // Refs for input elements
    const mainSearchBoxRef = useRef<HTMLInputElement>(null);

    const endpoint = "/api/bookcategory";

    // Fetch data from the API
    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await fetch(endpoint,
                    {
                        method: 'GET',
                        next: {
                            revalidate: 10
                        },
                    });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                setData({ bookCategories: result.bookCategories });
                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book categories.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchData();
        focusMainSearchBox();
    }, [endpoint]);

    // Handler to clear search text
    const clearSearchText = () => {
        setSearchText('');
        setSearchQuery('');
    };

    const clearEditText = (id: string) => {
        setEditedTextValue((prevEditedState: IEditedTextValue) => ({
            ...prevEditedState,
            [id]: '', // Clear the data by setting it to an empty string
        }));

        setMessage(null);
    };


    // ----------------- DB Operations -----------------\\
    const addData = async (newData: any) => {
        try {
            const requestBody = JSON.stringify({
                bookCategoryName: newData.txtBookCategoryName.trim(),
                bookCategoryDescription: newData.txtBookCategoryDescription.trim(),
            });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (response.ok) {
                const result = await response.json();
                setData((prevData: any) => ({
                    ...prevData,
                    bookCategories: [...prevData.bookCategories, result.bookCategory],
                }));

                // Success message
                await Swal.fire({
                    title: "Added!",
                    html: "Book category added successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to add new book category.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error adding new book category:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to add book category.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // Function to send the changed data to the backend API for updating the records
    const updateData = async (id: string) => {
        try {
            const requestBody = JSON.stringify({
                id: id,
                bookCategoryName: editedTextValue[id]?.txtBookCategoryName?.trim(),
                bookCategoryDescription: editedTextValue[id]?.txtBookCategoryDescription?.trim(),
            });

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (response.ok) {
                // Update local data directly without fetching from the server
                setData((prevData: any) => ({
                    ...prevData,
                    bookCategories: prevData.bookCategories.map((bookCategory: any) => {
                        if (bookCategory.id === id) {
                            return {
                                ...bookCategory,
                                bookCategoryName: editedTextValue[id]?.txtBookCategoryName?.trim() || bookCategory.bookCategoryName,
                                bookCategoryDescription: editedTextValue[id]?.txtBookCategoryDescription?.trim() || bookCategory.bookCategoryDescription,
                            };
                        }
                        return bookCategory;
                    }),
                }));

                // Hide the editable controls
                setShowHideEditableRow((prevRows) => ({
                    ...prevRows,
                    [id]: false,
                }));

                // Clear the edited text data from the local state variables
                clearEditText(id);

                // Success message
                await Swal.fire({
                    title: "Updated!",
                    html: "Book category updated successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to update book category.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error('Error updating book category:', error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to update book category.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    };

    const deleteData = async (id: string) => {
        try {
            const requestBody = JSON.stringify([id]);

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (response.ok) {
                // Update local state after successful deletion
                setData((prevData: any) => {
                    return {
                        ...prevData,
                        bookCategories: prevData.bookCategories.filter((bookCategory: BookCategory) => bookCategory.id !== id),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Book category deleted successfully.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete book category.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting record:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete book category.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    const deleteSelectedData = async () => {
        try {
            const requestBody = JSON.stringify(selectedRows);

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (response.ok) {
                // Update local state after successful deletion
                setData((prevData: any) => {
                    return {
                        ...prevData,
                        bookCategories: prevData.bookCategories.filter((bookCategory: BookCategory) => !selectedRows.includes(bookCategory.id)),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Selected book categories deleted successfully.",
                    icon: "success",
                    timer: 5000,
                    timerProgressBar: true,
                });

                // Clear selected rows
                setSelectedRows([]);
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete selected reservation status.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting selected records:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete selected book category.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // ----------------- Control events -----------------\\
    // Function to handle changes in the text input fields for editing
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>, id: string) => {
        const { name, value } = e.target;

        setEditedTextValue((prevEditedTextState: IEditedTextValue) => ({
            ...prevEditedTextState,
            [id]: {
                ...(prevEditedTextState[id] as any),
                [name]: value,
            },
        }));
    };

    // To call the add DB function
    const handleAddFormData = async (newData: any) => {
        addData(newData);
    };

    // To show the AddForm
    const handleAddButtonClick = async () => {
        setShowAddForm(true); // Show the AddForm
    };

    // To active editable controls for editing 
    const handleEditButtonClick = async (id: string) => {
        setShowHideEditableRow((prevRows) => ({
            ...prevRows,
            [id]: true,
        }));

        const bookCategoryName = data.bookCategories.find((bookCategory: any) => bookCategory.id === id)?.bookCategoryName || '';

        await Swal.fire({
            title: "Are you sure to edit?",
            text: `Book category: ${bookCategoryName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
        }).then((result) => {
            if (result.isConfirmed) {
                //setTxtBookCategoryName(bookCategoryName);
                //setTxtBookCategoryDescription(data.bookCategories.find(bookCategory => bookCategory.id === id)?.bookCategoryDescription || '');
            }
            else {
                setShowHideEditableRow((prevRows) => ({
                    ...prevRows,
                    [id]: false,
                }));
            }
        });
    };

    // To inactive editable controls for editing
    const handleCancelEditButtonClick = async (id: string) => {
        const bookCategoryName = data.bookCategories.find((bookCategory: any) => bookCategory.id === id)?.bookCategoryName || '';
        const bookCategoryDescription = data.bookCategories.find((bookCategory: any) => bookCategory.id === id)?.bookCategoryDescription || '';

        if (editedTextValue[id]?.txtBookCategoryName?.trim() !== bookCategoryName?.trim()
            || editedTextValue[id]?.txtBookCategoryDescription?.trim() !== bookCategoryDescription?.trim()) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You want to cancel the editing!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, cancel it!",
                cancelButtonText: "No",
            });

            if (result.isConfirmed) {
                setShowHideEditableRow((prevRows) => ({
                    ...prevRows,
                    [id]: false,
                }));

                // Clear the input fields
                clearEditText(id);
            }
        }
        else {
            setShowHideEditableRow((prevRows) => ({
                ...prevRows,
                [id]: false,
            }));

            // Clear the input fields
            clearEditText(id);
        }
    };

    // To ask for confirmation and update in the DB
    const handleSaveButtonClick = async (id: string) => {
        const bookCategoryName = data.bookCategories.find((bookCategory: any) => bookCategory.id === id)?.bookCategoryName || '';

        await Swal.fire({
            title: `Book category: ${bookCategoryName}`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Save",
            denyButtonText: `Don't save`
        }).then((result) => {
            if (result.isConfirmed) {
                updateData(id);
            } else if (result.isDenied) {
                Swal.fire({
                    title: "Cancelled!",
                    html: "Changes are not saved.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    // To ask for confirmation and delete from the DB
    const handleDeleteButtonClick = async (id: string) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            deleteData(id);
        }
    };

    // To ask for confirmation and delete selected from the DB
    const handleDeleteSelectedButtonClick = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete selected",
        });

        if (result.isConfirmed) {
            deleteSelectedData();
        }
    };


    // Handle search & sorting
    const handleSearch = () => {
        setSearchQuery(searchText)
        setCurrentPage(1);
    };

    const handleSort = (columnName: string) => {
        if (sortBy === columnName) {
            // If already sorted by the clicked column, toggle the sorting direction
            setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
        } else {
            // If not already sorted by the clicked column, set the clicked column as the new sort column and set direction to 'asc'
            setSortBy(columnName);
            setSortDirection('asc');
        }
    };

    // Handle row selection
    const handleRowSelection = (id: string) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(id)) {
                // If already selected, deselect it
                return prevSelectedRows.filter((rowId) => rowId !== id);
            } else {
                // If not selected, select it
                return [...prevSelectedRows, id];
            }
        });
    };

    const handleSelectAllRows = () => {
        if (selectedRows.length === data.bookCategories.length) {
            // If all rows are already selected, deselect all
            setSelectedRows([]);
        } else {
            // Otherwise, select all rows
            setSelectedRows(data.bookCategories.map((category: any) => category.id));
        }
    };


    // Function to focus on the main search input box
    const focusMainSearchBox = () => {
        if (mainSearchBoxRef.current) {
            mainSearchBoxRef.current.focus();
        }
    };


    // ----------------- Filter and sort the data -----------------\\
    const filteredBookCategories = Array.isArray(data.bookCategories) && data.bookCategories.length > 0
        ? data.bookCategories.filter((bookCategory: BookCategory) =>
            bookCategory.bookCategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookCategory.bookCategoryDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const sortedBookCategories = filteredBookCategories.sort((a: any, b: any) => {
        if (sortBy === '') return 0; // If no sort column selected, return 0 to maintain original order

        const factor = sortDirection === 'asc' ? 1 : -1;

        if (sortBy === 'bookCategoryName') {
            // Sort by bookCategoryName
            const bookCategoryNameA = a.bookCategoryName.toLowerCase();
            const bookCategoryNameB = b.bookCategoryName.toLowerCase();
            if (bookCategoryNameA < bookCategoryNameB) return -1 * factor;
            if (bookCategoryNameA > bookCategoryNameB) return 1 * factor;
            return 0;
        } else if (sortBy === 'bookCategoryDescription') {
            // Sort by bookCategoryDescription
            const bookCategoryDescriptionA = (a.bookCategoryDescription ?? '').toLowerCase();
            const bookCategoryDescriptionB = (b.bookCategoryDescription ?? '').toLowerCase();
            if (bookCategoryDescriptionA < bookCategoryDescriptionB) return -1 * factor;
            if (bookCategoryDescriptionA > bookCategoryDescriptionB) return 1 * factor;
            return 0;
        } else {
            // Default sorting behavior
            return 0;
        }
    });


    // Function to calculate the total number of pages based on the total number of profiles and profiles per page
    const totalPages = Math.ceil(sortedBookCategories.length / bookCategoryPerPage);

    // Function to handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the index of the last and first profiles on the current page
    const indexOfLastProfile = currentPage * bookCategoryPerPage;
    const indexOfFirstProfile = indexOfLastProfile - bookCategoryPerPage;

    // Slice the sortedBookCategories array to display only the profiles for the current page
    const currentBookCategories = sortedBookCategories.slice(indexOfFirstProfile, indexOfLastProfile);


    // ----------------- UI -----------------\\
    return (
        <div className="p-4 bg-purple-300 min-h-screen">
            <Header />

            {showAddForm ? (
                <AddForm
                    onCancel={() => setShowAddForm(false)} // Pass a callback to handle cancel action
                    onAddData={async (newData: BookCategory) => {
                        // Handle adding the new book data

                        handleAddFormData(newData);
                        setShowAddForm(false); // Hide the form after adding
                    }}
                />
            ) : (
                // Data display UI
                <>
                    <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Category</h1>
                    {
                    }
                    {message && (
                        <div className="mt-4 mb-4 text-red-700">
                            <textarea
                                value={message}
                                readOnly
                                className="border-none p-2 rounded-md w-full"
                                style={{ width: '100%', height: '100%', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', background: '#f5f5f' }}
                            />
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center items-center h-screen">
                            <LoadingAnimation />
                        </div>
                    )}

                    {isLoading === false && data && Array.isArray(data.bookCategories) && data.bookCategories.length === 0 && (
                        <>
                            <div className="flex justify-center items-top">
                                <button
                                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 w-36"
                                    onClick={handleAddButtonClick}
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex justify-center items-top h-screen">
                                <p className="text-blue-600 text-lg font-semibold ml-1">No data found.</p>
                            </div>
                        </>
                    )}

                    {isLoading === false && data && Array.isArray(data.bookCategories) && data.bookCategories.length > 0 && (
                        <>
                            {/* Search Bar and Add Button or Delete Button */}
                            <div className="flex mb-4">
                                <input
                                    name='txtSearchText'
                                    type="text"
                                    placeholder="Search by category"
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        if (e.target.value === '') {

                                            setSearchQuery(e.target.value);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                    ref={mainSearchBoxRef}
                                    className="border p-2 rounded-md w-full text-black mr-1"
                                />
                                <div className="relative">
                                    {searchText !== '' && (
                                        <FaTimesCircle
                                            className="absolute top-0 right-0 text-red-500 cursor-pointer mt-3 mr-3"
                                            onClick={clearSearchText}
                                        />
                                    )}
                                </div>
                                <button
                                    className="bg-purple-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-purple-700 w-24"
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>

                                {
                                    selectedRows && selectedRows.length > 0 ? (
                                        <button
                                            className="bg-red-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-red-700 w-36"
                                            onClick={handleDeleteSelectedButtonClick}
                                        >
                                            Delete
                                        </button>
                                    ) :
                                        (
                                            <button
                                                className="bg-green-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-green-700 w-36"
                                                onClick={handleAddButtonClick}
                                            >
                                                Add
                                            </button>
                                        )
                                }
                            </div>


                            {/* Data display table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-[900px] min-w-full border rounded-md overflow-hidden mb-4">
                                    <thead>
                                        <tr className="bg-purple-400 h-16">
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 w-14 text-center"
                                            >
                                                <input
                                                    name="chkSelectAll"
                                                    title={selectedRows.length === data.bookCategories.length ? 'Deselect All' : 'Select All'}
                                                    type="checkbox"
                                                    onChange={handleSelectAllRows}
                                                    checked={selectedRows.length === data.bookCategories.length}
                                                />
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-2/6"
                                                onClick={() => handleSort('bookCategoryName')}
                                            >
                                                Book Category
                                                {sortBy === 'bookCategoryName' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('bookCategoryDescription')}
                                            >
                                                Description
                                                {sortBy === 'bookCategoryDescription' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 w-24 text-center"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(currentBookCategories) &&
                                            currentBookCategories.map((bookCategory: any) => (
                                                <tr key={bookCategory.id} className="hover:bg-blue-300">
                                                    <td className="py-2 px-4 border-b border-r text-center">
                                                        <input
                                                            name="txtBookCategoryId"
                                                            title={
                                                                selectedRows.includes(bookCategory.id)
                                                                    ? `Deselect ${bookCategory.bookCategoryName}`
                                                                    : `Select ${bookCategory.bookCategoryName}`
                                                            }
                                                            type="checkbox"
                                                            onChange={() => handleRowSelection(bookCategory.id)}
                                                            checked={selectedRows.includes(bookCategory.id)}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookCategory.id] ? (
                                                            <input
                                                                name="txtBookCategoryName"
                                                                title={`Edit ${bookCategory.bookCategoryName}`}
                                                                type="text"
                                                                value={editedTextValue[bookCategory.id]?.txtBookCategoryName || bookCategory.bookCategoryName}
                                                                onChange={(e) => handleTextChange(e, bookCategory.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {bookCategory.bookCategoryName}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r" style={{ maxWidth: '400px', maxHeight: '100px' }}>
                                                        {showHideEditableRow[bookCategory.id] ? (
                                                            <textarea
                                                                name="txtBookCategoryDescription"
                                                                title={`Edit ${bookCategory.bookCategoryDescription}`}
                                                                value={editedTextValue[bookCategory.id]?.txtBookCategoryDescription || bookCategory.bookCategoryDescription || ''}
                                                                onChange={(e) => handleTextChange(e, bookCategory.id)}
                                                                className="border p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '100px', minHeight: '2.5rem', maxHeight: '24rem' }}
                                                            />
                                                        ) : (
                                                            <textarea
                                                                value={bookCategory.bookCategoryDescription || ''}
                                                                readOnly
                                                                className="border-none p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '2.5rem', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', backgroundColor: 'transparent' }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        {showHideEditableRow[bookCategory.id] ? (
                                                            <>
                                                                <button
                                                                    title={`Save changes for ${bookCategory.bookCategoryName}`}
                                                                    className="bg-green-500 text-white p-1 rounded-md mr-2 hover:bg-green-700"
                                                                    onClick={() => handleSaveButtonClick(bookCategory.id)}
                                                                >
                                                                    <FaSave size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Cancel editing for ${bookCategory.bookCategoryName}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleCancelEditButtonClick(bookCategory.id)}
                                                                >
                                                                    <FaTimes size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    title={`Edit ${bookCategory.bookCategoryName}`}
                                                                    className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                                    onClick={() => handleEditButtonClick(bookCategory.id)}
                                                                >
                                                                    <FaEdit size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Delete ${bookCategory.bookCategoryName}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleDeleteButtonClick(bookCategory.id)}
                                                                >
                                                                    <FaTrash size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination controls */}
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1} //{/* Disable when currentPage is 1 */}
                                    className={`bg-${currentPage === 1 ? 'gray' : 'purple'}-600 text-white py-2 px-4 mr-2 rounded-md hover:bg-purple-700 ${currentPage === 1 ? 'disabled:bg-gray-400' : ''}`}
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1} //{/* Disable when currentPage is 1 */}
                                    className={`bg-${currentPage === 1 ? 'gray' : 'purple'}-600 text-white py-2 px-4 mr-2 rounded-md hover:bg-purple-700 ${currentPage === 1 ? 'disabled:bg-gray-400' : ''}`}
                                >
                                    Previous
                                </button>
                                <span className="text-purple-800 mx-4 mt-2 text-center">{`Page ${currentPage} of ${totalPages}`}</span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages} //{/* Disable when currentPage is totalPages */}
                                    className={`bg-${currentPage === totalPages ? 'gray' : 'purple'}-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-purple-700 ${currentPage === totalPages ? 'disabled:bg-gray-400' : ''}`}
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages} //{/* Disable when currentPage is totalPages */}
                                    className={`bg-${currentPage === totalPages ? 'gray' : 'purple'}-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-purple-700 ${currentPage === totalPages ? 'disabled:bg-gray-400' : ''}`}
                                >
                                    Last
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}

        </div >
    );
};

export default Page;
