'use client'
import { formatDate } from '@/lib/commonUtil';
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaTimesCircle } from 'react-icons/fa';
import LoadingAnimation from '@/lib/LoadingAnimation';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength } from 'valibot';
import AddForm from './addForm';
import { User } from '@prisma/client';
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
    const [dataUserRole, setDataUserRole] = useState<any>({});

    const userInfoPerPage = parseInt(process.env.NEXT_PUBLIC_RECORD_PER_PAGE ?? '30');
    // Refs for input elements
    const mainSearchBoxRef = useRef<HTMLInputElement>(null);

    const endpoint = "/api/userinfo";

    // Fetch data from the API
    useEffect(() => {
        const endpointUserRole = "/api/userrole";

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

                setData({ userInfos: result.userInfos });
                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve user infos.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
            finally {
                setIsLoading(false);
            }
        };

        const fetchUserRole = async () => {
            try {
                const response = await fetch(endpointUserRole, {
                    method: 'GET',
                    next: {
                        revalidate: 60
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                const result = await response.json();
                setDataUserRole({ userRoles: result.userRoles });


                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve user role.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
        };

        fetchData();
        fetchUserRole();
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
                name: newData.txtName.trim(),
                email: newData.txtEmail.trim(),
                phone: newData.txtPhone.trim(),
                roleNum: Number(newData.cboUserRole),
                userAccessLevel: 10,
                password: newData.txtPassword,
                address: {
                    street: newData.txtAddress.trim(),
                },
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
                    userInfos: [...prevData.userInfos, result.userInfo],
                }));

                // Success message
                await Swal.fire({
                    title: "Added!",
                    html: "User info added successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to add new user info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error adding new user info:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to add user info.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // Function to send the changed data to the backend API for updating the records
    const updateData = async (id: string) => {
        try {
            const requestBody = JSON.stringify({
                id: id,
                name: editedTextValue[id]?.txtName?.trim(),
                email: editedTextValue[id]?.txtEmail?.trim(),
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
                    userInfos: prevData.userInfos.map((userInfo: any) => {
                        if (userInfo.id === id) {
                            return {
                                ...userInfo,
                                name: editedTextValue[id]?.txtName?.trim() || userInfo.name,
                                email: editedTextValue[id]?.txtEmail?.trim() || userInfo.email,
                            };
                        }
                        return userInfo;
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
                    html: "User info updated successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to update user info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error('Error updating user info:', error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to update user info.<br>Error: ${error.message}`,
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
                        userInfos: prevData.userInfos.filter((userInfo: User) => userInfo.id !== id),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "User info deleted successfully.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete user info.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting record:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete user info.<br>Error: ${error.message}`,
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
                        userInfos: prevData.userInfos.filter((userInfo: User) => !selectedRows.includes(userInfo.id)),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Selected user infos deleted successfully.",
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
                html: `Failed to delete selected user info.<br>Error: ${error.message}`,
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

        const name = data.userInfos.find((userInfo: any) => userInfo.id === id)?.name || '';

        await Swal.fire({
            title: "Are you sure to edit?",
            text: `User info: ${name}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
        }).then((result) => {
            if (result.isConfirmed) {
                //setTxtName(name);
                //setTxtEmail(data.userInfos.find(userInfo => userInfo.id === id)?.email || '');
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
        const name = data.userInfos.find((userInfo: any) => userInfo.id === id)?.name || '';
        const email = data.userInfos.find((userInfo: any) => userInfo.id === id)?.email || '';

        if (editedTextValue[id]?.txtName?.trim() !== name?.trim()
            || editedTextValue[id]?.txtEmail?.trim() !== email?.trim()) {
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
        const name = data.userInfos.find((userInfo: any) => userInfo.id === id)?.name || '';

        await Swal.fire({
            title: `User info: ${name}`,
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
        if (selectedRows.length === data.userInfos.length) {
            // If all rows are already selected, deselect all
            setSelectedRows([]);
        } else {
            // Otherwise, select all rows
            setSelectedRows(data.userInfos.map((category: any) => category.id));
        }
    };


    // Function to focus on the main search input box
    const focusMainSearchBox = () => {
        if (mainSearchBoxRef.current) {
            mainSearchBoxRef.current.focus();
        }
    };


    // ----------------- Filter and sort the data -----------------\\
    const filteredUserInfos = Array.isArray(data.userInfos) && data.userInfos.length > 0
        ? data.userInfos.filter((userInfo: User) =>
            userInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userInfo.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const sortedUserInfos = filteredUserInfos.sort((a: any, b: any) => {
        if (sortBy === '') return 0; // If no sort column selected, return 0 to maintain original order

        const factor = sortDirection === 'asc' ? 1 : -1;

        if (sortBy === 'name') {
            // Sort by name
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1 * factor;
            if (nameA > nameB) return 1 * factor;
            return 0;
        } else if (sortBy === 'email') {
            // Sort by email
            const emailA = (a.email ?? '').toLowerCase();
            const emailB = (b.email ?? '').toLowerCase();
            if (emailA < emailB) return -1 * factor;
            if (emailA > emailB) return 1 * factor;
            return 0;
        } else {
            // Default sorting behavior
            return 0;
        }
    });


    // Function to calculate the total number of pages based on the total number of profiles and profiles per page
    const totalPages = Math.ceil(sortedUserInfos.length / userInfoPerPage);

    // Function to handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the index of the last and first profiles on the current page
    const indexOfLastProfile = currentPage * userInfoPerPage;
    const indexOfFirstProfile = indexOfLastProfile - userInfoPerPage;

    // Slice the sortedUserInfos array to display only the profiles for the current page
    const currentUserInfos = sortedUserInfos.slice(indexOfFirstProfile, indexOfLastProfile);


    // ----------------- UI -----------------\\
    return (
        <div className="p-4 bg-purple-300 min-h-screen">
            <Header />

            {showAddForm ? (
                <AddForm
                    userRoles={dataUserRole.userRoles}
                    onCancel={() => setShowAddForm(false)} // Pass a callback to handle cancel action
                    onAddData={async (newData: User) => {
                        // Handle adding the new book data

                        handleAddFormData(newData);
                        setShowAddForm(false); // Hide the form after adding
                    }}
                />
            ) : (
                // Data display UI
                <>
                    <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">User Information</h1>
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

                    {isLoading === false && data && Array.isArray(data.userInfos) && data.userInfos.length === 0 && (
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

                    {isLoading === false && data && Array.isArray(data.userInfos) && data.userInfos.length > 0 && (
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
                                                    title={selectedRows.length === data.userInfos.length ? 'Deselect All' : 'Select All'}
                                                    type="checkbox"
                                                    onChange={handleSelectAllRows}
                                                    checked={selectedRows.length === data.userInfos.length}
                                                />
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('name')}
                                            >
                                                Name
                                                {sortBy === 'name' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('email')}
                                            >
                                                Email
                                                {sortBy === 'email' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('phone')}
                                            >
                                                Phone
                                                {sortBy === 'phone' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('address')}
                                            >
                                                Address
                                                {sortBy === 'address' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-28"
                                                onClick={() => handleSort('role')}
                                            >
                                                Role
                                                {sortBy === 'role' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('recordAccess')}
                                            >
                                                Record Access
                                                {sortBy === 'recordAccess' && (
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
                                        {Array.isArray(currentUserInfos) &&
                                            currentUserInfos.map((userInfo: any) => (
                                                <tr key={userInfo.id} className="hover:bg-blue-300">
                                                    <td className="py-2 px-4 border-b border-r text-center">
                                                        <input
                                                            name="txtUserInfoId"
                                                            title={
                                                                selectedRows.includes(userInfo.id)
                                                                    ? `Deselect ${userInfo.name}`
                                                                    : `Select ${userInfo.name}`
                                                            }
                                                            type="checkbox"
                                                            onChange={() => handleRowSelection(userInfo.id)}
                                                            checked={selectedRows.includes(userInfo.id)}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <input
                                                                name="txtName"
                                                                title={`Edit ${userInfo.name}`}
                                                                type="text"
                                                                value={editedTextValue[userInfo.id]?.txtName || userInfo.name}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {userInfo.name}</div>
                                                        )}
                                                    </td>


                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <input
                                                                name="txtEmail"
                                                                title={`Edit ${userInfo.email}`}
                                                                type="text"
                                                                value={editedTextValue[userInfo.id]?.txtEmail || userInfo.email}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {userInfo.email}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <input
                                                                name="txtPhone"
                                                                title={`Edit ${userInfo.phone}`}
                                                                type="text"
                                                                value={editedTextValue[userInfo.id]?.txtPhone || userInfo.phone}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {userInfo.phone}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r" style={{ maxWidth: '400px', maxHeight: '100px' }}>
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <textarea
                                                                name="txtEmail"
                                                                title={`Edit ${userInfo?.addresses[0]?.street}`}
                                                                value={editedTextValue[userInfo.id]?.txtAddress || userInfo && userInfo.addresses && userInfo.addresses.length > 0 ? userInfo.addresses[0].street : ''}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '100px', minHeight: '2.5rem', maxHeight: '24rem' }}
                                                            />
                                                        ) : (
                                                            <textarea
                                                                value={userInfo && userInfo.addresses && userInfo.addresses.length > 0 ? userInfo.addresses[0].street : ''}
                                                                //
                                                                readOnly
                                                                className="border-none p-2 rounded-md w-full"
                                                                style={{ width: '100%', height: '2.5rem', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', backgroundColor: 'transparent' }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r border-white">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <select
                                                                name="cboUserRole"
                                                                title={`Edit ${userInfo.userRole.roleName}`}
                                                                value={editedTextValue[userInfo.id]?.cboUserRole || userInfo.userRole.roleSerial}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            >
                                                                {Array.isArray(dataUserRole.userRoles) &&
                                                                    dataUserRole.userRoles.map((userRole: any) => (
                                                                        <option key={userRole.roleSerial} value={userRole.roleSerial}>
                                                                            {userRole.roleName}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        ) : (
                                                            <div className="whitespace-pre-line">
                                                                {Array.isArray(dataUserRole.userRoles) && dataUserRole.userRoles.find((userRole: any) => userRole.roleSerial === userInfo.roleNum)?.roleName}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-r">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <input
                                                                name="txtUserAccessLevel"
                                                                title={`Edit ${userInfo.phone}`}
                                                                type="text"
                                                                value={editedTextValue[userInfo.id]?.txtUserAccessLevel || userInfo.userAccessLevel}
                                                                onChange={(e) => handleTextChange(e, userInfo.id)}
                                                                className="border p-2 rounded-md w-full"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-line"> {userInfo.userAccessLevel}</div>
                                                        )}
                                                    </td>


                                                    <td className="py-2 px-4 border-b text-center">
                                                        {showHideEditableRow[userInfo.id] ? (
                                                            <>
                                                                <button
                                                                    title={`Save changes for ${userInfo.name}`}
                                                                    className="bg-green-500 text-white p-1 rounded-md mr-2 hover:bg-green-700"
                                                                    onClick={() => handleSaveButtonClick(userInfo.id)}
                                                                >
                                                                    <FaSave size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Cancel editing for ${userInfo.name}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleCancelEditButtonClick(userInfo.id)}
                                                                >
                                                                    <FaTimes size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    title={`Edit ${userInfo.name}`}
                                                                    className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                                    onClick={() => handleEditButtonClick(userInfo.id)}
                                                                >
                                                                    <FaEdit size={16} />
                                                                </button>
                                                                <button
                                                                    title={`Delete ${userInfo.name}`}
                                                                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                    onClick={() => handleDeleteButtonClick(userInfo.id)}
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
