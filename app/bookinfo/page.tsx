'use client'
import { formatDate } from '@/lib/commonUtil';
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaTimesCircle } from 'react-icons/fa';
import LoadingAnimation from '@/lib/LoadingAnimation';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';
import AddForm from './addForm';
import { BookInfo } from '@prisma/client';
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
    const [dataBookCategory, setDataBookCategory] = useState<any>({});

    const bookInfoPerPage = parseInt(process.env.NEXT_PUBLIC_RECORD_PER_PAGE ?? '30');
    // // Edit book info variables
    // const [txtBookTitle, setTxtBookTitle] = useState<string>('');
    // const [txtNote, setTxtNote] = useState<string>('');
    // // Refs for input elements
    const mainSearchBoxRef = useRef<HTMLInputElement>(null);

    const endpoint = "/api/bookinfo";

    // Fetch data from the API
    useEffect(() => {
        const endpointBookAvailability = "/api/bookstockposition";
        const endpointBookCategory = "/api/bookcategory";

        const fetchData = async () => {
            try {
                const response = await fetch(endpointBookAvailability,
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

                setData({ bookInfos: [...result.bookStockPositions.availableBooks, ...result.bookStockPositions.unavailableBooks] });
                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book infos.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
            finally {
                setIsLoading(false);
            }
        };

        const fetchBookCategory = async () => {
            try {
                const response = await fetch(endpointBookCategory, {
                    method: 'GET',
                    next: {
                        revalidate: 60
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                const result = await response.json();
                setDataBookCategory({ bookCategories: result.bookCategories });


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
        };

        fetchData();
        focusMainSearchBox();
        fetchBookCategory();
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
                bookTitle: newData.txtBookTitle.trim(),
                author: newData.txtAuthor.trim(),
                ISBN: newData.txtISBN.trim(),
                publisher: newData.txtPublisher.trim(),
                publishDate: new Date(newData.txtPublishDate),
                language: newData.txtLanguage.trim(),
                bookCategoryId: newData.cboBookCategory,
                coverImage: newData.txtCoverImage.trim(),
                note: newData.txtNote.trim(),
                stock: Number(newData.txtStock),
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
                    bookInfos: [
                        ...prevData.bookInfos,
                        {
                            ...result.bookInfo,
                            bookCategory: {
                                id: result.bookInfo.bookCategoryId
                            }
                        }
                    ]
                }));


                // Success message
                await Swal.fire({
                    title: "Added!",
                    html: "Book info added successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to add new book info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error adding new book info:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to add book info.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // Function to send the changed data to the backend API for updating the records
    const updateData = async (id: string) => {
        try {
            const editedText = editedTextValue[id] || {}; // Get the edited text for the specific ID
            const { txtBookTitle, txtNote } = editedText;

            const requestBody = JSON.stringify({
                id: id,
                bookTitle: txtBookTitle?.trim(),
                note: txtNote?.trim(),
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
                    bookInfos: prevData.bookInfos.map((bookInfo: any) => {
                        if (bookInfo.id === id) {
                            return {
                                ...bookInfo,
                                bookTitle: editedTextValue[id]?.txtBookTitle || bookInfo.bookTitle,
                                note: editedTextValue[id]?.txtNote || bookInfo.note,
                            };
                        }
                        return bookInfo;
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
                    html: "Book info updated successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to update book info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error('Error updating book info:', error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to update book info.<br>Error: ${error.message}`,
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
                        bookInfos: prevData.bookInfos.filter((bookInfo: BookInfo) => bookInfo.id !== id),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Book info deleted successfully.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete book info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting record:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete book info.<br>Error: ${error.message}`,
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
                        bookInfos: prevData.bookInfos.filter((bookInfo: BookInfo) => !selectedRows.includes(bookInfo.id)),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Selected book infos deleted successfully.",
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
                html: `Failed to delete selected book info.<br>Error: ${error.message}`,
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

        const bookTitle = data.bookInfos.find((bookInfo: any) => bookInfo.id === id)?.bookTitle || '';

        await Swal.fire({
            title: "Are you sure to edit?",
            text: `Book info: ${bookTitle}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
        }).then((result) => {
            if (result.isConfirmed) {
                //setTxtBookTitle(bookTitle);
                //setTxtNote(data.bookInfos.find(bookInfo => bookInfo.id === id)?.note || '');
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
        const bookTitle = data.bookInfos.find((bookInfo: any) => bookInfo.id === id)?.bookTitle || '';
        const note = data.bookInfos.find((bookInfo: any) => bookInfo.id === id)?.note || '';

        if (editedTextValue[id]?.txtBookTitle?.trim() !== bookTitle?.trim()
            || editedTextValue[id]?.txtNote?.trim() !== note?.trim()) {
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
        const bookTitle = data.bookInfos.find((bookInfo: any) => bookInfo.id === id)?.bookTitle || '';

        await Swal.fire({
            title: `Book info: ${bookTitle}`,
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
        if (selectedRows.length === data.bookInfos.length) {
            // If all rows are already selected, deselect all
            setSelectedRows([]);
        } else {
            // Otherwise, select all rows
            setSelectedRows(data.bookInfos.map((category: any) => category.id));
        }
    };


    // Function to focus on the main search input box
    const focusMainSearchBox = () => {
        if (mainSearchBoxRef.current) {
            mainSearchBoxRef.current.focus();
        }
    };


    // ----------------- Filter and sort the data -----------------\\
    const filteredBookCategories = Array.isArray(data.bookInfos) && data.bookInfos.length > 0
        ? data.bookInfos.filter((bookInfo: BookInfo) =>
            bookInfo.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookInfo.note?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const sortedBookCategories = filteredBookCategories.sort((a: any, b: any) => {
        if (sortBy === '') return 0; // If no sort column selected, return 0 to maintain original order

        const factor = sortDirection === 'asc' ? 1 : -1;

        if (sortBy === 'bookTitle') {
            // Sort by bookTitle
            const bookTitleA = a.bookTitle.toLowerCase();
            const bookTitleB = b.bookTitle.toLowerCase();
            if (bookTitleA < bookTitleB) return -1 * factor;
            if (bookTitleA > bookTitleB) return 1 * factor;
            return 0;
        } else if (sortBy === 'note') {
            // Sort by note
            const noteA = (a.note ?? '').toLowerCase();
            const noteB = (b.note ?? '').toLowerCase();
            if (noteA < noteB) return -1 * factor;
            if (noteA > noteB) return 1 * factor;
            return 0;
        } else {
            // Default sorting behavior
            return 0;
        }
    });


    // Function to calculate the total number of pages based on the total number of profiles and profiles per page
    const totalPages = Math.ceil(sortedBookCategories.length / bookInfoPerPage);

    // Function to handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the index of the last and first profiles on the current page
    const indexOfLastProfile = currentPage * bookInfoPerPage;
    const indexOfFirstProfile = indexOfLastProfile - bookInfoPerPage;

    // Slice the sortedBookCategories array to display only the profiles for the current page
    const currentBookInfos = sortedBookCategories.slice(indexOfFirstProfile, indexOfLastProfile);


    // ----------------- UI -----------------\\
    return (
        <div className="p-4 bg-purple-300 min-h-screen">

            <Header />

            {showAddForm ? (
                <AddForm
                    bookCategories={dataBookCategory.bookCategories}
                    onCancel={() => setShowAddForm(false)} // Pass a callback to handle cancel action
                    onAddData={async (newData: BookInfo) => {
                        // Handle adding the new book data

                        handleAddFormData(newData);
                        setShowAddForm(false); // Hide the form after adding
                    }}
                />
            ) : (
                // Data display UI
                <>
                    <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Information</h1>
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

                    {isLoading === false && data && Array.isArray(data.bookInfos) && data.bookInfos.length === 0 && (
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

                    {isLoading === false && data && Array.isArray(data.bookInfos) && data.bookInfos.length > 0 && (
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
                                <table className="min-w-[2400px] min-w-full border rounded-md overflow-hidden mb-4">
                                    <thead>
                                        <tr className="bg-purple-400 h-16">
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 w-14 text-center"
                                            >
                                                <input
                                                    name="chkSelectAll"
                                                    title={selectedRows.length === data.bookInfos.length ? 'Deselect All' : 'Select All'}
                                                    type="checkbox"
                                                    onChange={handleSelectAllRows}
                                                    checked={selectedRows.length === data.bookInfos.length}
                                                />
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer min-w-[150px] w-*"
                                                onClick={() => handleSort('bookTitle')}
                                            >
                                                Book Title
                                                {sortBy === 'bookTitle' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>


                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer min-w-[120px] w-120"
                                                //style={{ minWidth: '200px', maxWidth: '200px' }}
                                                onClick={() => handleSort('author')}
                                            >
                                                Author
                                                {sortBy === 'author' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>

                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-50px"
                                            >
                                                ISBN
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-100px"
                                            //style={{ minWidth: '300px', maxWidth: '300px' }}
                                            >
                                                Publisher
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-96px"
                                            >
                                                Publish Date
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-28"
                                            //style={{ minWidth: '110px', maxWidth: '110px' }}
                                            >
                                                Language
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer min-w-120 max-w-200 w-120"
                                            >
                                                Book Category
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer min-w-120 max-w-200 w-120"
                                            >
                                                Cover Image
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-28"
                                            >
                                                Total
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-28"
                                            >
                                                Availability
                                            </th>

                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('note')}
                                            >
                                                Note
                                                {sortBy === 'note' && (
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
                                        {Array.isArray(currentBookInfos) &&
                                            currentBookInfos.map((bookInfo: any) => (
                                                <tr key={bookInfo.id} className="hover:bg-blue-300">
                                                    <td className="py-2 px-4 border-b border-r text-center">
                                                        <input
                                                            name="txtBookInfoId"
                                                            title={
                                                                selectedRows.includes(bookInfo.id)
                                                                    ? `Deselect ${bookInfo.bookTitle}`
                                                                    : `Select ${bookInfo.bookTitle}`
                                                            }
                                                            type="checkbox"
                                                            onChange={() => handleRowSelection(bookInfo.id)}
                                                            checked={selectedRows.includes(bookInfo.id)}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtBookTitle"
                                                                title={`Edit ${bookInfo.bookTitle}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtBookTitle || bookInfo.bookTitle}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {bookInfo.bookTitle}</div>
                                                        )}
                                                    </td>


                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtAuthor"
                                                                title={`Edit ${bookInfo.author}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtAuthor || bookInfo.author}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.author
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtISBN"
                                                                title={`Edit ${bookInfo.ISBN}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtISBN || bookInfo.ISBN}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.ISBN
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtPublisher"
                                                                title={`Edit ${bookInfo.publisher}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtPublisher || bookInfo.publisher}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.publisher
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtPublishDate"
                                                                title={`Edit ${bookInfo.publishDate}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtPublishDate ? new Date(bookInfo.publishDate).toLocaleDateString('en-US') : bookInfo.publishDate ? new Date(bookInfo.publishDate).toLocaleDateString('en-US') : ''}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.publishDate ? new Date(bookInfo.publishDate).toLocaleDateString('en-US') : ''
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtLanguage"
                                                                title={`Edit ${bookInfo.language}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtLanguage || bookInfo.language}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.language
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r border-white">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <select
                                                                name="cboBookCategory"
                                                                title={`Edit ${bookInfo.bookCategory.bookCategoryName}`}
                                                                value={editedTextValue[bookInfo.id]?.cboBookCategory || bookInfo.bookCategory.id}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            >
                                                                {Array.isArray(dataBookCategory.bookCategories) &&
                                                                    dataBookCategory.bookCategories.map((bookCategory: any) => (
                                                                        <option key={bookCategory.id} value={bookCategory.id}>
                                                                            {bookCategory.bookCategoryName}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        ) : (
                                                            <div className="whitespace-pre-line">
                                                                {Array.isArray(dataBookCategory.bookCategories) && dataBookCategory.bookCategories.find((bookCategory: any) => bookCategory.id === bookInfo.bookCategory.id)?.bookCategoryName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {/* {bookInfo.coverImage} */}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r text-right">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtStock"
                                                                title={`Edit ${bookInfo.stock}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtStock || bookInfo.stock}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.stock
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r text-right">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <input
                                                                name="txtAvailable"
                                                                title={`Edit ${bookInfo.available}`}
                                                                type="text"
                                                                value={editedTextValue[bookInfo.id]?.txtAvailable || bookInfo.available}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            bookInfo.available
                                                        )}
                                                    </td>

                                                    <td className="py-2 px-4 border-b border-r" style={{ maxWidth: '400px', maxHeight: '100px' }}>
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <textarea
                                                                name="txtNote"
                                                                title={`Edit ${bookInfo.note}`}
                                                                value={editedTextValue[bookInfo.id]?.txtNote || bookInfo.note || ''}
                                                                onChange={(e) => handleTextChange(e, bookInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '100px', minHeight: '2.5rem', maxHeight: '24rem' }}
                                                            />
                                                        ) : (
                                                            <textarea
                                                                value={bookInfo.note || ''}
                                                                readOnly
                                                                className="border-none p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '2.5rem', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', backgroundColor: 'transparent' }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        {showHideEditableRow[bookInfo.id] ? (
                                                            <>
                                                                <button
                                                                    title={`Save changes for ${bookInfo.bookTitle}`}
                                                                    className="bg-green-500 text-white p-1 rounded-md mr-2 hover:bg-green-700"
                                                                    onClick={() => handleSaveButtonClick(bookInfo.id)}
                                                                >
                                                                    <FaSave size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Cancel editing for ${bookInfo.bookTitle}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleCancelEditButtonClick(bookInfo.id)}
                                                                >
                                                                    <FaTimes size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    title={`Edit ${bookInfo.bookTitle}`}
                                                                    className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                                    onClick={() => handleEditButtonClick(bookInfo.id)}
                                                                >
                                                                    <FaEdit size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Delete ${bookInfo.bookTitle}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleDeleteButtonClick(bookInfo.id)}
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
