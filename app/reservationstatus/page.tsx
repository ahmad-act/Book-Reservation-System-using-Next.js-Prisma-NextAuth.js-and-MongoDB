'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaTimesCircle } from 'react-icons/fa';
import { ReservationStatus } from '@prisma/client';
import Swal from 'sweetalert2';

const Page: React.FC = () => {
    // Variables declarations
    const [data, setData] = useState<{ reservationStatus: ReservationStatus[] }>({ reservationStatus: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editableRows, setEditableRows] = useState<{ [key: string]: boolean }>({});
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const reservationStatusPerPage = parseInt(process.env.NEXT_PUBLIC_RECORD_PER_PAGE ?? '30');
    // New category variables
    const [newReservationStatusName, setNewReservationStatusName] = useState<string>('');
    const [newReservationStatusNum, setNewReservationStatusNum] = useState<number>(0);
    const [newReservationStatusDescription, setNewReservationStatusDescription] = useState<string>('');
    // Edit category variables
    const [editedReservationStatusName, setEditedReservationStatusName] = useState<string>('');
    const [editedReservationStatusNum, setEditedReservationStatusNum] = useState<number>(0);
    const [editedReservationStatusDescription, setEditedReservationStatusDescription] = useState<string>('');
    // Refs for input elements
    const mainSearchBoxRef = useRef<HTMLInputElement>(null);

    // Fetch data from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/reservationstatus');
                const result = await response.json();
                setData({ reservationStatus: result.reservationStatus });
            } catch (error: any) {
                console.error('Error fetching data:', error);

                Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve reservation status.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
        };

        fetchData();

        focusMainSearchBox();
    }, []);

    // Handler to clear search text
    const clearSearchText = () => {
        setSearchText('');
        setSearchQuery('');
    };

    // ----------------- DB Operations -----------------\\
    const addReservationStatus = async () => {
        try {
            const response = await fetch('/api/reservationstatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservationStatusName: newReservationStatusName,
                    reservationStatusNum: Number(newReservationStatusNum),
                    reservationStatusDescription: newReservationStatusDescription,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setData((prevData) => ({
                    ...prevData,
                    reservationStatus: [...prevData.reservationStatus, result.reservationStatus],
                }));

                // Clear input fields after successful addition
                setNewReservationStatusName('');
                setNewReservationStatusNum(0);
                setNewReservationStatusDescription('');

                // Success message
                Swal.fire({
                    title: "Added!",
                    html: "Reservation status added successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to add new reservation status.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error adding new reservation status:", error);

            Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to add reservation status.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // Function to send the changed data to the backend API for updating the records
    const updateReservationStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/reservationstatus`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    reservationStatusName: editedReservationStatusName,
                    reservationStatusNum: Number(editedReservationStatusNum),
                    reservationStatusDescription: editedReservationStatusDescription,
                }),
            });

            if (response.ok) {
                // Success message
                Swal.fire({
                    title: "Updated!",
                    html: "Reservation status updated successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });

                // Clear the edited data
                setEditedReservationStatusName('');
                setEditedReservationStatusDescription('');
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to update reservation status.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error('Error updating reservation status:', error);

            Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to update reservation status.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    };


    const deleteReservationStatus = async (id: string) => {
        try {
            // Perform the delete request
            const response = await fetch('/api/reservationstatus', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([id]),
            });

            if (response.ok) {
                // Update local state after successful deletion
                setData((prevData) => {
                    return {
                        ...prevData,
                        reservationStatus: prevData.reservationStatus.filter((reservationStatus: ReservationStatus) => reservationStatus.id !== id),
                    };
                });

                // Successful deletion
                Swal.fire({
                    title: "Deleted!",
                    html: "Reservation status deleted successfully.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete reservation status.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting record:", error);

            Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete reservation status.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    const deleteSelectedReservationStatus = async () => {
        try {
            // Perform the delete request
            const response = await fetch('/api/reservationstatus', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedRows),
            });

            if (response.ok) {
                // Update local state after successful deletion
                setData((prevData) => {
                    return {
                        ...prevData,
                        reservationStatus: prevData.reservationStatus.filter((reservationStatus: ReservationStatus) => !selectedRows.includes(reservationStatus.id)),
                    };
                });

                // Successful deletion
                Swal.fire({
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

                Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete selected reservation status.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting selected records:", error);

            Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete selected reservation status.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // ----------------- Control events -----------------\\
    // Function to handle submission of the new reservation status form
    const handleAddReservationStatus = async () => {
        if (newReservationStatusName.trim() === '' || !newReservationStatusName) {
            Swal.fire({
                title: "Error!",
                html: "Reservation status is required.",
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }
        else if (newReservationStatusDescription.trim() === '' || !newReservationStatusDescription) {
            Swal.fire({
                title: "Error!",
                html: "Description is required.",
                icon: "error",
                timer: 5000,
                timerProgressBar: true,
            });
        }
        else {
            Swal.fire({
                title: "Are you sure to add?",
                text: `Reservation status: ${newReservationStatusName}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, add it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    addReservationStatus();
                }
            });
        }
    };

    // Function to handle changes in the text input fields for editing
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'txtReservationStatusName') {
            setEditedReservationStatusName(value);
        } else if (name === 'txtReservationStatusNum') {
            setEditedReservationStatusNum(value as unknown as number);
        } else if (name === 'txtReservationStatusDescription') {
            setEditedReservationStatusDescription(value);
        }
    };

    const handleConfirmAndEditReservationStatus = (id: string) => {
        setEditableRows((prevRows) => ({
            ...prevRows,
            [id]: true,
        }));

        const reservationStatusName = data.reservationStatus.find(reservationStatus => reservationStatus.id === id)?.reservationStatusName || '';
        setEditedReservationStatusName(reservationStatusName);
        setEditedReservationStatusNum(data.reservationStatus.find(reservationStatus => reservationStatus.id === id)?.reservationStatusNum || 0);
        setEditedReservationStatusDescription(data.reservationStatus.find(reservationStatus => reservationStatus.id === id)?.reservationStatusDescription || '');

        Swal.fire({
            title: "Are you sure to edit?",
            text: `Reservation status: ${reservationStatusName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
        }).then((result) => {
            if (!result.isConfirmed) {
                handleCancelEditReservationStatus(id);
            }
        });
    };

    const handleSaveReservationStatus = (id: string) => {
        // Implement logic to save changes for the specific row
        setEditableRows((prevRows) => ({
            ...prevRows,
            [id]: false,
        }));

        const reservationStatusName = data.reservationStatus.find(reservationStatus => reservationStatus.id === id)?.reservationStatusName || '';

        Swal.fire({
            title: `Reservation status: ${reservationStatusName}`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Save",
            denyButtonText: `Don't save`
        }).then((result) => {
            if (result.isConfirmed) {
                updateReservationStatus(id);

                // Update local data directly without fetching from the server
                setData(prevData => ({
                    ...prevData,
                    reservationStatus: prevData.reservationStatus.map(reservationStatus => {
                        if (reservationStatus.id === id) {
                            return {
                                ...reservationStatus,
                                reservationStatusName: editedReservationStatusName || reservationStatus.reservationStatusName,
                                reservationStatusNum: editedReservationStatusNum || reservationStatus.reservationStatusNum,
                                reservationStatusDescription: editedReservationStatusDescription || reservationStatus.reservationStatusDescription,
                            };
                        }
                        return reservationStatus;
                    }),
                }));

                // Clear the input fields
                setEditedReservationStatusName('');
                setEditedReservationStatusDescription('');

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

    const handleCancelEditReservationStatus = (id: string) => {
        // Implement logic to cancel editing for the specific row
        setEditableRows((prevRows) => ({
            ...prevRows,
            [id]: false,
        }));

        // Clear the input fields
        setEditedReservationStatusName('');
        setEditedReservationStatusDescription('');
    };

    const handleConfirmAndDeleteReservationStatus = async (id: string) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            deleteReservationStatus(id);
        }
    };



    const handleConfirmAndDeleteSelected = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete selected",
        });

        if (result.isConfirmed) {
            deleteSelectedReservationStatus();
        }
    };

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
        if (selectedRows.length === data.reservationStatus.length) {
            // If all rows are already selected, deselect all
            setSelectedRows([]);
        } else {
            // Otherwise, select all rows
            setSelectedRows(data.reservationStatus.map((category) => category.id));
        }
    };


    // Function to focus on the main search input box
    const focusMainSearchBox = () => {
        if (mainSearchBoxRef.current) {
            mainSearchBoxRef.current.focus();
        }
    };


    // ----------------- Filter and sort the data -----------------\\
    const filteredBookCategories = Array.isArray(data.reservationStatus) && data.reservationStatus.length > 0
        ? data.reservationStatus.filter((reservationStatus: ReservationStatus) =>
            reservationStatus.reservationStatusName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reservationStatus.reservationStatusNum.toString().includes(searchQuery) ||
            reservationStatus.reservationStatusDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const sortedBookCategories = filteredBookCategories.sort((a, b) => {
        if (sortBy === '') return 0; // If no sort column selected, return 0 to maintain original order

        const factor = sortDirection === 'asc' ? 1 : -1;

        if (sortBy === 'reservationStatusName') {
            // Sort by reservationStatusName
            const nameA = a.reservationStatusName.toLowerCase();
            const nameB = b.reservationStatusName.toLowerCase();
            if (nameA < nameB) return -1 * factor;
            if (nameA > nameB) return 1 * factor;
            return 0;

        } else if (sortBy === 'reservationStatusNum') {
            // Sort by reservationStatusNum
            const nameA = a.reservationStatusNum;
            const nameB = b.reservationStatusNum;
            if (nameA < nameB) return -1 * factor;
            if (nameA > nameB) return 1 * factor;
            return 0;
        } else if (sortBy === 'reservationStatusDescription') {
            // Sort by reservationStatusDescription
            const descriptionA = (a.reservationStatusDescription ?? '').toLowerCase();
            const descriptionB = (b.reservationStatusDescription ?? '').toLowerCase();
            if (descriptionA < descriptionB) return -1 * factor;
            if (descriptionA > descriptionB) return 1 * factor;
            return 0;
        } else {
            // Default sorting behavior
            return 0;
        }
    });


    // Function to calculate the total number of pages based on the total number of profiles and profiles per page
    const totalPages = Math.ceil(sortedBookCategories.length / reservationStatusPerPage);

    // Function to handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the index of the last and first profiles on the current page
    const indexOfLastProfile = currentPage * reservationStatusPerPage;
    const indexOfFirstProfile = indexOfLastProfile - reservationStatusPerPage;

    // Slice the sortedBookCategories array to display only the profiles for the current page
    const currentBookCategories = sortedBookCategories.slice(indexOfFirstProfile, indexOfLastProfile);


    // ----------------- UI -----------------\\
    return (
        <div className="p-4 bg-purple-300 min-h-screen">
            <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Reservation Status</h1>

            {/* Search Bar */}
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
                    className="bg-purple-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-purple-700 w-20"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>


            {/* New Reservation Status Form */}
            <div className="flex mb-4">
                <input
                    name='txtNewReservationStatusName'
                    type="text"
                    placeholder="New Reservation Status Name"
                    value={newReservationStatusName}
                    onChange={(e) => setNewReservationStatusName(e.target.value)}
                    className="border p-2 rounded-md w-full text-black mr-2"
                />
                <input
                    name='txtNewReservationStatusNum'
                    type="number"
                    placeholder="New Status Number"
                    value={newReservationStatusNum}
                    onChange={(e) => setNewReservationStatusNum(e.target.value as unknown as number)}
                    className="border p-2 rounded-md w-full text-black mr-2"
                />
                <input
                    name='txtReservationStatusDescription'
                    type="text"
                    placeholder="New Category Description"
                    value={newReservationStatusDescription}
                    onChange={(e) => setNewReservationStatusDescription(e.target.value)}
                    className="border p-2 rounded-md w-full text-black mr-1"
                />
                <button
                    className="bg-green-600 text-white py-2 px-4 ml-2 rounded-md hover:bg-green-700 w-36"
                    onClick={handleAddReservationStatus}
                >
                    Add
                </button>
            </div>

            {/* Data display table */}
            <table className="min-w-full border rounded-md overflow-hidden mb-4">
                <thead>
                    <tr className="bg-purple-400">
                        <th
                            className="py-2 px-4 border-b border-r text-purple-800 w-14 text-center"
                        >
                            <input
                                name="chkSelectAll"
                                title={selectedRows.length === data.reservationStatus.length ? 'Deselect All' : 'Select All'}
                                type="checkbox"
                                onChange={handleSelectAllRows}
                                checked={selectedRows.length === data.reservationStatus.length}
                            />
                        </th>
                        <th
                            className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-1/3"
                            onClick={() => handleSort('reservationStatusName')}
                        >
                            Reservation Status
                            {sortBy === 'reservationStatusName' && (
                                <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                            )}
                        </th>
                        <th
                            className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-1/3"
                            onClick={() => handleSort('reservationStatusNum')}
                        >
                            Reservation Status Number
                            {sortBy === 'reservationStatusNum' && (
                                <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                            )}
                        </th>
                        <th
                            className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-2/3"
                            onClick={() => handleSort('reservationStatusDescription')}
                        >
                            Description
                            {sortBy === 'reservationStatusDescription' && (
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
                        currentBookCategories.map((reservationStatus) => (
                            <tr key={reservationStatus.id} className="hover:bg-purple-50">
                                <td className="py-2 px-4 border-b border-r text-center">
                                    <input
                                        name="txtReservationStatusId"
                                        title={
                                            selectedRows.includes(reservationStatus.id)
                                                ? `Deselect ${reservationStatus.reservationStatusName}`
                                                : `Select ${reservationStatus.reservationStatusName}`
                                        }
                                        type="checkbox"
                                        onChange={() => handleRowSelection(reservationStatus.id)}
                                        checked={selectedRows.includes(reservationStatus.id)}
                                    />
                                </td>
                                <td className="py-2 px-4 border-b border-r">
                                    {editableRows[reservationStatus.id] ? (
                                        <input
                                            name="txtReservationStatusName"
                                            title={`Edit ${reservationStatus.reservationStatusName}`}
                                            type="text"
                                            value={editedReservationStatusName}
                                            onChange={handleEditInputChange}
                                            className="border p-2 rounded-md w-full"
                                        />
                                    ) : (
                                        reservationStatus.reservationStatusName
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b border-r">
                                    {editableRows[reservationStatus.id] ? (
                                        <input
                                            name="txtReservationStatusNum"
                                            title={`Edit ${reservationStatus.reservationStatusNum}`}
                                            type="number"
                                            value={editedReservationStatusNum}
                                            onChange={handleEditInputChange}
                                            className="border p-2 rounded-md w-full"
                                        />
                                    ) : (
                                        reservationStatus.reservationStatusNum
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b border-r">
                                    {editableRows[reservationStatus.id] ? (
                                        <input
                                            name="txtReservationStatusDescription"
                                            title={`Edit ${reservationStatus.reservationStatusDescription}`}
                                            type="text"
                                            value={editedReservationStatusDescription}
                                            onChange={handleEditInputChange}
                                            className="border p-2 rounded-md w-full"
                                        />
                                    ) : (
                                        reservationStatus.reservationStatusDescription
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    {editableRows[reservationStatus.id] ? (
                                        <>
                                            <button
                                                title={`Save changes for ${reservationStatus.reservationStatusName}`}
                                                className="bg-green-500 text-white p-1 rounded-md mr-2 hover:bg-green-700"
                                                onClick={() => handleSaveReservationStatus(reservationStatus.id)}
                                            >
                                                <FaSave size={16} />
                                            </button>
                                            <button
                                                title={`Cancel editing for ${reservationStatus.reservationStatusName}`}
                                                className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                onClick={() => handleCancelEditReservationStatus(reservationStatus.id)}
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                title={`Edit ${reservationStatus.reservationStatusName}`}
                                                className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                onClick={() => handleConfirmAndEditReservationStatus(reservationStatus.id)}
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                title={`Delete ${reservationStatus.reservationStatusName}`}
                                                className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                onClick={() => handleConfirmAndDeleteReservationStatus(reservationStatus.id)}
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

            {/* Delete selected button */}
            {selectedRows.length > 0 && (
                <div className="flex justify-center mt-4">
                    <button
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                        onClick={handleConfirmAndDeleteSelected}
                    >
                        Delete Selected
                    </button>
                </div>
            )}
        </div>
    );
};

export default Page;
