'use client'
import { formatDate } from '@/lib/commonUtil';
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaTimesCircle, FaAngleUp, FaAngleDown } from 'react-icons/fa';
import LoadingAnimation from '@/lib/LoadingAnimation';
import Swal from 'sweetalert2';
import { parse, string, object, minLength, email, maxLength, number } from 'valibot';
import AddForm from './addForm';
import Header from '@/app/components/header';


interface IShowEditableRow {
    [key: string]: boolean
}

interface IExpandedRows {
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
    const [expandedRows, setExpandedRows] = useState<IExpandedRows>({});
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch data from database using API
    const [data, setData] = useState<any>({});
    const [dataReservationStatus, setDataReservationStatus] = useState<any>({});
    const [dataBookInfos, setDataBookInfos] = useState<any>({});
    const [dataBookInfosStockPosition, setDataBookInfosStockPosition] = useState<any>({});


    const bookReservationPerPage = parseInt(process.env.NEXT_PUBLIC_RECORD_PER_PAGE ?? '30');

    // // Edit book reservation variables
    // const [txtReservationRef, setTxtReservationRef] = useState<string>('');
    // const [txtReservationDate, setTxtReservationDate] = useState<Date>(new Date());
    // const [txtReservationComment, setTxtReservationComment] = useState<string>('');
    // // Edit user variables
    // const [txtClientName, setTxtClientName] = useState<string>('');
    // const [txtClientEmail, setTxtClientEmail] = useState<string>('');
    // const [txtClientPhone, setTxtClientPhone] = useState<string>('');
    // const [txtClientAddress, setTxtClientAddress] = useState<string>('');
    // Edit details variables
    //const [txtBookCategory, setTxtBookCategory] = useState<string>('');
    //const [txtQuantity, setTxtQuantity] = useState<number>(1);

    // Refs for input elements
    const mainSearchBoxRef = useRef<HTMLInputElement>(null);


    const endpoint = "/api/bookreservation";

    // Fetch data from the API
    useEffect(() => {
        const endpointReservationStatus = "/api/reservationstatus";
        const endpointBookInfo = "/api/bookinfo";
        const endpointBookInfoStockPosition = "/api/bookstockposition";

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

                setData({ bookReservations: result.bookReservations });
                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book reservations.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
            finally {
                setIsLoading(false);
            }
        };

        const fetchReservationStatus = async () => {
            try {
                const response = await fetch(endpointReservationStatus, {
                    method: 'GET',
                    next: {
                        revalidate: 60
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                const result = await response.json();

                setDataReservationStatus({ reservationStatus: result.reservationStatus });


                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book reservations.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
        };

        const fetchBookInfo = async () => {
            try {
                const response = await fetch(endpointBookInfo,
                    {
                        method: 'GET',
                        next: {
                            revalidate: 60
                        },
                    });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                setDataBookInfos({ bookInfos: result.bookInfos });
                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book reservations.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
        };

        const fetchBookInfoStockPosition = async () => {
            try {
                const response = await fetch(endpointBookInfoStockPosition,
                    {
                        method: 'GET',
                        next: {
                            revalidate: 60
                        },
                    });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}. Status: ${response.status}`);
                }

                setDataBookInfosStockPosition({ bookInfosAvailable: result.bookStockPositions.availableBooks, bookInfosUnavailable: result.bookStockPositions.unavailableBooks });

                setMessage(null);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setMessage(`Status: ${error.status} \nError: ${error.message}`);

                await Swal.fire({
                    title: `Error! [${error.status}]`,
                    html: `Failed to retrieve book stock position.<br>Error: ${error.message}`,
                    icon: "error",
                });
            }
        };

        fetchData();
        fetchReservationStatus();
        fetchBookInfo();
        focusMainSearchBox();
        fetchBookInfoStockPosition();
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
                bookReservation: {
                    reservationRef: newData?.txtReservationRef.trim(),
                    reservationDate: newData?.txtReservationDate,
                    reservationComment: newData?.txtReservationComment.trim(),
                },
                reservationDetails: newData?.reservationDetails?.map((detail: any) => ({
                    bookInfoId: detail.cboBookInfo,
                    quantity: Number(detail.txtQuantity),
                })) ?? [],
                user: {
                    name: newData?.txtClientName.trim(),
                    email: newData?.txtClientEmail.trim(),
                    phone: newData?.txtClientPhone.trim(),
                },
                address: {
                    street: newData?.txtClientAddress?.trim(),
                }
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
                    bookReservations: [...prevData.bookReservations, result.bookReservation],
                }));

                // Success message
                await Swal.fire({
                    title: "Added!",
                    html: "Book reservation added successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to add new book reservation.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error adding new book reservation:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to add book reservation.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // Function to send the changed data to the backend API for updating the records
    const updateData = async (id: string) => {
        try {
            // const {
            //     txtReservationRef,
            //     txtReservationDate,
            //     txtReservationComment,
            //     txtClientName,
            //     txtClientEmail,
            //     txtClientPhone,
            //     txtClientAddress
            // } = editedTextValue[id]; // Get the edited text value for the current row

            const userId = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.userId;

            const reservationDetails = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationDetails;
            const requestBody = JSON.stringify({
                bookReservation: {
                    id: id,
                    userId,
                    reservationRef: editedTextValue[id]?.txtReservationRef?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationRef,
                    reservationDate: editedTextValue[id]?.txtReservationDate ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationDate,
                    reservationStatusNum: Number(editedTextValue[id]?.cboReservationStatus ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationStatusNum),
                    reservationComment: editedTextValue[id]?.txtReservationComment?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationComment,
                },
                reservationDetails: reservationDetails?.map((detail: any) => ({
                    id: detail.id,
                    bookInfoId: editedTextValue?.[detail.id]?.cboBookTitle,
                    quantity: Number(editedTextValue?.[detail.id]?.txtQuantity || 1),
                })) ?? [],
                user: {
                    id: userId,
                    name: editedTextValue[id]?.txtClientName?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.name,
                    email: editedTextValue[id]?.txtClientEmail?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.email,
                    phone: editedTextValue[id]?.txtClientPhone?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.phone,
                },
                address: {
                    id: data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.addresses[0]?.id,
                    street: editedTextValue[id]?.txtClientAddress?.trim() ?? data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.addresses[0]?.street,
                }
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
                    bookReservations: prevData.bookReservations.map((bookReservation: any) => {
                        if (bookReservation.id === id) {
                            return {
                                ...bookReservation,
                                reservationRef: editedTextValue[id]?.txtReservationRef || bookReservation.reservationRef,
                                reservationDate: editedTextValue[id]?.txtReservationDate || bookReservation.reservationDate,
                                reservationStatusNum: Number(editedTextValue[id]?.cboReservationStatus || bookReservation.reservationStatusNum),
                                reservationComment: editedTextValue[id]?.txtReservationComment || bookReservation.reservationComment,

                                reservationDetails: bookReservation.reservationDetails.map((detail: any) => {
                                    const editedDetail = {
                                        ...detail,
                                        bookInfoId: editedTextValue[detail.id]?.cboBookTitle || detail.bookInfoId,
                                        quantity: editedTextValue[detail.id]?.txtQuantity || detail.quantity,
                                        bookInfo: {
                                            ...detail.bookInfo,
                                            bookTitle: dataBookInfos?.bookInfos.find((book: any) => book.id === editedTextValue[detail.id]?.cboBookTitle)?.bookTitle || detail.bookInfo.bookTitle,
                                            bookCategory: {
                                                ...detail.bookInfo.bookCategory,
                                                bookCategoryName: dataBookInfos?.bookInfos.find((book: any) => book.id === editedTextValue[detail.id]?.cboBookTitle)?.bookCategory.bookCategoryName || detail.bookInfo.bookCategory.bookCategoryName
                                            },
                                        },
                                    };

                                    return editedDetail;
                                }),

                                user: {
                                    ...bookReservation?.user,
                                    name: editedTextValue[id]?.txtClientName || bookReservation?.user?.name,
                                    email: editedTextValue[id]?.txtClientEmail || bookReservation?.user?.email,
                                    phone: editedTextValue[id]?.txtClientPhone || bookReservation?.user?.phone,
                                    addresses: [
                                        {
                                            ...bookReservation?.user?.addresses[0],
                                            street: editedTextValue[id]?.txtClientAddress || bookReservation?.user?.addresses[0]?.street,
                                        }
                                    ]
                                },
                            };
                        }

                        return bookReservation;
                    }),
                }));


                // Hide the editable controls
                setShowHideEditableRow((prevRows) => ({
                    ...prevRows,
                    [id]: false,
                }));

                // Clear the txt data
                clearEditText(id);

                // Success message
                await Swal.fire({
                    title: "Updated!",
                    html: "Book reservation updated successfully.",
                    icon: "success",
                    timer: 10000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();
                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to update book reservation.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error('Error updating book reservation:', error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to update book reservation.<br>Error: ${error.message}`,
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
                        bookReservations: prevData.bookReservations.filter((bookReservation: any) => bookReservation.id !== id),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Book reservation deleted successfully.",
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                const errorStatus = response.status;
                const errorText = await response.text();

                await Swal.fire({
                    title: `Error! [${errorStatus}]`,
                    html: `Failed to delete book reservation.<br>Error: ${errorText}`,
                    icon: "error",
                });
            }
        } catch (error: any) {
            console.error("Error deleting record:", error);
            setMessage(`Status: ${error.status} \nError: ${error.message}`);

            await Swal.fire({
                title: `Error! [${error.status}]`,
                html: `Failed to delete book reservation.<br>Error: ${error.message}`,
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
                        bookReservations: prevData.bookReservations.filter((bookReservation: any) => !selectedRows.includes(bookReservation.id)),
                    };
                });

                // Successful deletion
                await Swal.fire({
                    title: "Deleted!",
                    html: "Selected book reservations deleted successfully.",
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
                html: `Failed to delete selected book reservation.<br>Error: ${error.message}`,
                icon: "error",
            });
        }
    }

    // ----------------- Control events -----------------\\
    // Function to handle changes in the text input fields for editing
    const handleTextChange = async (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>, id: string) => {
        const { name, value } = e.target;

        if (name === 'cboBookTitle') {

            const isBookExists = dataBookInfosStockPosition.bookInfosAvailable.some((bookInfo: any) =>
                bookInfo.id === value
            );

            if (!isBookExists) {
                // Success message
                await Swal.fire({
                    title: "Error!",
                    html: "Book does not exist.",
                    icon: "error",
                    timer: 10000,
                    timerProgressBar: true,
                });

                return
            }


            const selectedBook = dataBookInfos.bookInfos.find((book: any) => book.id === value);

            setEditedTextValue((prevEditedTextState: IEditedTextValue) => ({
                ...prevEditedTextState,
                [id]: {
                    ...(prevEditedTextState[id] as any),
                    ["txtBookCategoryName"]: selectedBook.bookCategory.bookCategoryName,
                },
            }));
        }

        setEditedTextValue((prevEditedTextState: IEditedTextValue) => ({
            ...prevEditedTextState,
            [id]: {
                ...(prevEditedTextState[id] as any),
                [name]: value,
            },
        }));


        // if (name === 'cboBookTitle') {
        //     const selectedBook = dataBookInfos.bookInfos.find((book: any) => book.id === value);

        //     setEditedTextValue((prevEditedTextState: IEditedTextValue) => ({
        //         ...prevEditedTextState,
        //         [id]: {
        //             ...(prevEditedTextState[id] as any),
        //             ["txtBookCategoryName"]: selectedBook.bookCategory.bookCategoryName,
        //         },
        //     }));
        // }
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

        const reservationRef = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationRef || '';

        await Swal.fire({
            title: "Are you sure to edit?",
            text: `Book reservation: ${reservationRef}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, edit it!"
        }).then((result) => {
            if (result.isConfirmed) {
                // setTxtReservationRef(reservationRef);
                // setTxtReservationDate(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationDate || new Date());
                // setTxtReservationComment(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationComment || '');

                // setTxtClientName(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.name || '');
                // setTxtClientEmail(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.email || '');
                // setTxtClientPhone(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.phone || '');
                // setTxtClientAddress(data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user?.addresses[0].street || '');
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
        const reservationRef = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationRef || '';
        const reservationDate = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationDate;
        const reservationComment = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationComment || '';

        const clientName = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.name || '';
        const clientEmail = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.email || '';
        const clientPhone = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.phone || '';
        const clientAddress = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.user.addresses[0].street || '';

        if (editedTextValue[id]?.txtReservationRef?.trim() !== reservationRef?.trim()
            || editedTextValue[id]?.txtReservationDate !== reservationDate
            || editedTextValue[id]?.txtReservationComment?.trim() !== reservationComment?.trim()
            || editedTextValue[id]?.txtClientName?.trim() !== clientName?.trim()
            || editedTextValue[id]?.txtClientEmail?.trim() !== clientEmail?.trim()
            || editedTextValue[id]?.txtClientPhone?.trim() !== clientPhone?.trim()
            || editedTextValue[id]?.txtClientAddress?.trim() !== clientAddress?.trim()) {
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
        const reservationRef = data.bookReservations.find((bookReservation: any) => bookReservation.id === id)?.reservationRef || '';

        await Swal.fire({
            title: `Book reservation: ${reservationRef}`,
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
        if (selectedRows.length === data.bookReservations.length) {
            // If all rows are already selected, deselect all
            setSelectedRows([]);
        } else {
            // Otherwise, select all rows
            setSelectedRows(data.bookReservations.map((category: any) => category.id));
        }
    };


    // Function to focus on the main search input box
    const focusMainSearchBox = () => {
        if (mainSearchBoxRef.current) {
            mainSearchBoxRef.current.focus();
        }
    };


    // ----------------- Filter and sort the data -----------------\\
    const filteredBookCategories = Array.isArray(data.bookReservations) && data.bookReservations.length > 0
        ? data.bookReservations.filter((bookReservation: any) =>
            bookReservation.reservationRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookReservation.reservationDate.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookReservation.reservationComment?.toLowerCase().includes(searchQuery.toLowerCase()) ||

            bookReservation?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookReservation?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookReservation?.user?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookReservation?.user?.addresses[0].street?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const sortedBookCategories = filteredBookCategories.sort((a: any, b: any) => {
        if (sortBy === '') return 0; // If no sort column selected, return 0 to maintain original order

        const factor = sortDirection === 'asc' ? 1 : -1;

        if (sortBy === 'reservationRef') {
            // Sort by reservationRef
            const reservationRefA = a.reservationRef.toLowerCase();
            const reservationRefB = b.reservationRef.toLowerCase();
            if (reservationRefA < reservationRefB) return -1 * factor;
            if (reservationRefA > reservationRefB) return 1 * factor;
            return 0;
        } else if (sortBy === 'reservationDate') {
            // Sort by reservationDate
            const reservationDateA = a.reservationDate;
            const reservationDateB = b.reservationDate;
            if (reservationDateA < reservationDateB) return -1 * factor;
            if (reservationDateA > reservationDateB) return 1 * factor;
            return 0;
        } else if (sortBy === 'reservationComment') {
            // Sort by reservationComment
            const reservationCommentA = (a.reservationComment ?? '').toLowerCase();
            const reservationCommentB = (b.reservationComment ?? '').toLowerCase();
            if (reservationCommentA < reservationCommentB) return -1 * factor;
            if (reservationCommentA > reservationCommentB) return 1 * factor;
            return 0;
        } else if (sortBy === 'clientName') {
            // Sort by clientNames
            const clientNameA = (a.user.name ?? '').toLowerCase();
            const clientNameB = (b.user.name ?? '').toLowerCase();
            if (clientNameA < clientNameB) return -1 * factor;
            if (clientNameA > clientNameB) return 1 * factor;
            return 0;
        } else if (sortBy === 'clientEmail') {
            // Sort by clientNames
            const clientEmailA = (a.user.email ?? '').toLowerCase();
            const clientEmailB = (b.user.email ?? '').toLowerCase();
            if (clientEmailA < clientEmailB) return -1 * factor;
            if (clientEmailA > clientEmailB) return 1 * factor;
            return 0;
        } else if (sortBy === 'clientPhone') {
            // Sort by clientNames
            const clientPhoneA = (a.user.phone ?? '').toLowerCase();
            const clientPhoneB = (b.user.phone ?? '').toLowerCase();
            if (clientPhoneA < clientPhoneB) return -1 * factor;
            if (clientPhoneA > clientPhoneB) return 1 * factor;
            return 0;
        } else if (sortBy === 'clientAddress') {
            const clientAddressA = (a.user.addresses[0].street ?? '').toLowerCase() + (a.user.addresses[0] ?? '').toLowerCase();
            const clientAddressB = (b.user.addresses[0].street ?? '').toLowerCase();
            if (clientAddressA < clientAddressB) return -1 * factor;
            if (clientAddressA > clientAddressB) return 1 * factor;
            return 0;
        } else {
            return 0;
        }
    });


    // Function to calculate the total number of pages based on the total number of profiles and profiles per page
    const totalPages = Math.ceil(sortedBookCategories.length / bookReservationPerPage);

    // Function to handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the index of the last and first profiles on the current page
    const indexOfLastProfile = currentPage * bookReservationPerPage;
    const indexOfFirstProfile = indexOfLastProfile - bookReservationPerPage;

    // Slice the sortedBookCategories array to display only the profiles for the current page
    const currentBookCategories = sortedBookCategories.slice(indexOfFirstProfile, indexOfLastProfile);

    // Define the toggleRowExpansion function
    const toggleRowExpansion = (id: string) => {
        setExpandedRows((prevExpandedRows) => ({
            ...prevExpandedRows,
            [id]: !prevExpandedRows[id],
        }));
    };




    // ----------------- UI -----------------\\
    return (
        <div className="p-4 bg-purple-300 min-h-screen">
            <Header />

            {showAddForm ? (
                <AddForm
                    bookInfos={dataBookInfosStockPosition.bookInfosAvailable}
                    onCancel={() => setShowAddForm(false)} // Pass a callback to handle cancel action
                    onAddData={async (newData: any) => {
                        // Handle adding the new book data
                        handleAddFormData(newData);
                        setShowAddForm(false); // Hide the form after adding
                    }}
                />
            ) : (
                // Data display UI
                <>
                    <h1 className="text-3xl font-semibold mb-4 text-purple-800 text-center">Book Reservation</h1>

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

                    {isLoading === false && data && Array.isArray(data.bookReservations) && data.bookReservations.length === 0 && (
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

                    {isLoading === false && data && Array.isArray(data.bookReservations) && data.bookReservations.length > 0 && (
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
                                <table className="min-w-[1400px] min-w-full border rounded-md overflow-hidden mb-4">
                                    <thead>
                                        <tr className="bg-purple-400 h-16">
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 w-14 text-center"
                                            >
                                                <input
                                                    name="chkSelectAll"
                                                    title={selectedRows.length === data.bookReservations.length ? 'Deselect All' : 'Select All'}
                                                    type="checkbox"
                                                    onChange={handleSelectAllRows}
                                                    checked={selectedRows.length === data.bookReservations.length}
                                                />
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-1/10"
                                                onClick={() => handleSort('reservationRef')}
                                            >
                                                Book Reservation
                                                {sortBy === 'reservationRef' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>

                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('clientName')}
                                            >
                                                Client Name
                                                {sortBy === 'clientName' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-1/10"
                                                onClick={() => handleSort('clientEmail')}
                                            >
                                                Email
                                                {sortBy === 'email' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-1/10"
                                                onClick={() => handleSort('clientPhone')}
                                            >
                                                Phone
                                                {sortBy === 'phone' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-*"
                                                onClick={() => handleSort('clientAddress')}
                                            >
                                                Address
                                                {sortBy === 'address' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>



                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-16"
                                                onClick={() => handleSort('reservationDate')}
                                            >
                                                Reservation Date
                                                {sortBy === 'reservationDate' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-36"
                                                onClick={() => handleSort('reservationStatus')}
                                            >
                                                Status
                                                {sortBy === 'reservationStatus' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th>
                                            {/* <th
                                                className="py-2 px-4 border-b border-r text-purple-800 cursor-pointer w-2/10"
                                                onClick={() => handleSort('reservationComment')}
                                            >
                                                Description
                                                {sortBy === 'reservationComment' && (
                                                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                                                )}
                                            </th> */}
                                            <th
                                                className="py-2 px-4 border-b border-r text-purple-800 w-36 text-center"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(currentBookCategories) &&
                                            currentBookCategories.map((bookReservation: any) => (
                                                <React.Fragment key={bookReservation.id}>

                                                    <tr key={bookReservation.id} className="hover:bg-blue-300">
                                                        <td className="py-2 px-4 border-b border-r text-center">
                                                            <input
                                                                name="txtBookReservationId"
                                                                title={
                                                                    selectedRows.includes(bookReservation.id)
                                                                        ? `Deselect ${bookReservation.reservationRef}`
                                                                        : `Select ${bookReservation.reservationRef}`
                                                                }
                                                                type="checkbox"
                                                                onChange={() => handleRowSelection(bookReservation.id)}
                                                                checked={selectedRows.includes(bookReservation.id)}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <input
                                                                    name="txtReservationRef"
                                                                    title={`Edit ${bookReservation.reservationRef}`}
                                                                    type="text"
                                                                    value={editedTextValue[bookReservation.id]?.txtReservationRef || bookReservation.reservationRef}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                />
                                                            ) : (
                                                                <div className="whitespace-pre-line"> {bookReservation.reservationRef}</div>
                                                            )}
                                                        </td>


                                                        <td className="py-2 px-4 border-b border-r">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <input
                                                                    name="txtClientName"
                                                                    title={`Edit ${bookReservation?.user?.name}`}
                                                                    type="text"
                                                                    value={editedTextValue[bookReservation.id]?.txtClientName || bookReservation?.user?.name}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                />
                                                            ) : (
                                                                <div className="whitespace-pre-line"> {bookReservation?.user?.name}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <input
                                                                    name="txtClientEmail"
                                                                    title={`Edit ${bookReservation?.user?.email}`}
                                                                    type="text"
                                                                    value={editedTextValue[bookReservation.id]?.txtClientEmail || bookReservation?.user?.email}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                />
                                                            ) : (
                                                                <div className="whitespace-pre-line"> {bookReservation?.user?.email}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <input
                                                                    name="txtClientPhone"
                                                                    title={`Edit ${bookReservation?.user?.phone}`}
                                                                    type="text"
                                                                    value={editedTextValue[bookReservation.id]?.txtClientPhone || bookReservation?.user?.phone}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                />
                                                            ) : (
                                                                <div className="whitespace-pre-line"> {bookReservation?.user?.phone}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r" style={{ maxWidth: '400px', maxHeight: '100px' }}>
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <textarea
                                                                    name="txtClientAddress"
                                                                    title={`Edit ${bookReservation?.user?.addresses[0].street}`}
                                                                    value={editedTextValue[bookReservation.id]?.txtClientAddress || bookReservation?.user?.addresses[0].street}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                    style={{ width: '100%', height: '100px', minHeight: '2.5rem', maxHeight: '24rem' }}
                                                                />
                                                            ) : (
                                                                <textarea
                                                                    value={bookReservation?.user?.addresses[0].street || ''}
                                                                    readOnly
                                                                    className="border-none p-2 rounded-md w-full"
                                                                    style={{ width: '100%', height: '2.5rem', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', backgroundColor: 'transparent' }}
                                                                />
                                                            )}
                                                        </td>

                                                        <td className="py-2 px-4 border-b border-r">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <input
                                                                    name="txtReservationDate"
                                                                    title={`Edit ${bookReservation.reservationDate}`}
                                                                    type="date"
                                                                    value={new Date(editedTextValue[bookReservation.id]?.txtReservationDate ? editedTextValue[bookReservation.id]?.txtReservationDate : bookReservation.reservationDate).toISOString().split('T')[0]}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                />
                                                            ) : (
                                                                <div className="whitespace-pre-line">{bookReservation.reservationDate ? formatDate(new Date(bookReservation.reservationDate)) : ''}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-r border-white">
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <select
                                                                    name="cboReservationStatus"
                                                                    value={editedTextValue[bookReservation.id]?.cboReservationStatus || bookReservation.reservationStatusNum}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                >
                                                                    {Array.isArray(dataReservationStatus.reservationStatus) &&
                                                                        dataReservationStatus.reservationStatus.map((status: any) => (
                                                                            <option key={status.id} value={status.reservationStatusNum}>
                                                                                {status.reservationStatusName}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            ) : (
                                                                <div className="whitespace-pre-line">
                                                                    {Array.isArray(dataReservationStatus.reservationStatus) && dataReservationStatus.reservationStatus.find((status: any) => status.reservationStatusNum === bookReservation.reservationStatusNum)?.reservationStatusName}
                                                                </div>
                                                            )}
                                                        </td>
                                                        {/* <td className="py-2 px-4 border-b border-r" style={{ maxWidth: '400px', maxHeight: '100px' }}>
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <textarea
                                                                    name="txtReservationComment"
                                                                    title={`Edit ${bookReservation.reservationComment}`}
                                                                    value={editedTextValue[bookReservation.id]?.txtReservationComment || bookReservation.reservationComment}
                                                                    onChange={(e) => handleTextChange(e, bookReservation.id)}
                                                                    className="border p-2 rounded-md w-full"
                                                                    style={{ width: '100%', height: '100px', minHeight: '2.5rem', maxHeight: '24rem' }}
                                                                />
                                                            ) : (
                                                                <textarea
                                                                    value={bookReservation.reservationComment || ''}
                                                                    readOnly
                                                                    className="border-none p-2 rounded-md w-full"
                                                                    style={{ width: '100%', height: '2.5rem', minHeight: '2.5rem', maxHeight: '24rem', outline: 'none', backgroundColor: 'transparent' }}
                                                                />
                                                            )}
                                                        </td> */}
                                                        <td className="py-2 px-4 border-b text-center">
                                                            <button
                                                                title={`View details for ${bookReservation.reservationRef}`}
                                                                className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                                onClick={() => toggleRowExpansion(bookReservation.id)}
                                                            >
                                                                {/* FontAwesome icon for expand/collapse */}
                                                                {expandedRows[bookReservation.id] ? <FaAngleUp size={16} /> : <FaAngleDown size={16} />}
                                                            </button>
                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                <>
                                                                    <button
                                                                        title={`Save changes for ${bookReservation.reservationRef}`}
                                                                        className="bg-green-500 text-white p-1 rounded-md mr-2 hover:bg-green-700"
                                                                        onClick={() => handleSaveButtonClick(bookReservation.id)}
                                                                    >
                                                                        <FaSave size={16} />
                                                                    </button>
                                                                    <button
                                                                        title={`Cancel editing for ${bookReservation.reservationRef}`}
                                                                        className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                        onClick={() => handleCancelEditButtonClick(bookReservation.id)}
                                                                    >
                                                                        <FaTimes size={16} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        title={`Edit ${bookReservation.reservationRef}`}
                                                                        className="bg-blue-500 text-white p-1 rounded-md mr-2 hover:bg-blue-700"
                                                                        onClick={() => handleEditButtonClick(bookReservation.id)}
                                                                    >
                                                                        <FaEdit size={16} />
                                                                    </button>
                                                                    <button
                                                                        title={`Delete ${bookReservation.reservationRef}`}
                                                                        className="bg-red-500 text-white p-1 rounded-md hover:bg-red-700"
                                                                        onClick={() => handleDeleteButtonClick(bookReservation.id)}
                                                                    >
                                                                        <FaTrash size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>


                                                    {/* Detail table row for reservation details */}
                                                    {
                                                        expandedRows[bookReservation.id] && (
                                                            <tr>
                                                                <td colSpan={9}>
                                                                    {/* Detail table for reservation details */}
                                                                    <table className="min-w-full border rounded-md overflow-hidden mb-1">
                                                                        <thead>
                                                                            <tr className="bg-green-400 h-10">
                                                                                <th className="py-2 px-4 border-b border-r border-white text-green-800 w-3/6">Book Title</th>
                                                                                <th className="py-2 px-4 border-b border-r border-white text-green-800 w-2/6">Book Category</th>
                                                                                <th className="py-2 px-4 border-b border-r border-white text-green-800 w-1/6">Reserved Quantity</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {Array.isArray(bookReservation.reservationDetails) &&
                                                                                bookReservation.reservationDetails.map((detail: any) => (
                                                                                    <tr key={detail.id} className="bg-green-200 h-10">

                                                                                        <td className="py-2 px-4 border-b border-r border-white">
                                                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                                                <select
                                                                                                    name="cboBookTitle"
                                                                                                    value={editedTextValue[detail.id]?.cboBookTitle || detail.bookInfoId}
                                                                                                    onChange={(e) => handleTextChange(e, detail.id)}
                                                                                                    className="border p-2 rounded-md w-full"
                                                                                                >
                                                                                                    {Array.isArray(dataBookInfos.bookInfos) &&
                                                                                                        dataBookInfos.bookInfos.map((book: any) => (
                                                                                                            <option key={book.id} value={book.id}>
                                                                                                                {book.bookTitle}
                                                                                                            </option>
                                                                                                        ))}
                                                                                                </select>
                                                                                            ) : (
                                                                                                <div className="whitespace-pre-line">{detail.bookInfo.bookTitle}</div>
                                                                                            )}
                                                                                        </td>

                                                                                        <td className="py-2 px-4 border-b border-r border-white">
                                                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                                                <input
                                                                                                    name="txtBookCategoryName"
                                                                                                    title=''
                                                                                                    type="text"
                                                                                                    value={editedTextValue[detail.id]?.txtBookCategoryName || detail.bookInfo.bookCategory.bookCategoryName}
                                                                                                    onChange={(e) => handleTextChange(e, detail.id)}
                                                                                                    readOnly
                                                                                                    className="border p-2 rounded-md w-full"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="whitespace-pre-line">{detail.bookInfo.bookCategory.bookCategoryName}</div>
                                                                                            )}

                                                                                        </td>
                                                                                        <td className="py-2 px-4 border-b border-r border-white text-right">
                                                                                            {showHideEditableRow[bookReservation.id] ? (
                                                                                                <input
                                                                                                    name="txtQuantity"
                                                                                                    title={`Edit ${detail.quantity}`}
                                                                                                    type="number"
                                                                                                    value={editedTextValue[detail.id]?.txtQuantity || detail.quantity}
                                                                                                    onChange={(e) => handleTextChange(e, detail.id)}
                                                                                                    className="border p-2 rounded-md w-full"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="whitespace-pre-line">{detail.quantity}</div>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                </React.Fragment>

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
            )
            }

        </div >
    );
};

export default Page;
