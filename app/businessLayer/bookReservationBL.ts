import CustomError from "@/lib/customError";
import { isNumber, isDate } from "@/lib/commonUtil";
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import { Prisma } from '@prisma/client';
import DbContext from "@/prisma/DbContext";
import { BookReservation, ReservationDetail, User, Address } from '@prisma/client';

//---------------------- Get methods ----------------------\\
export const getBookReservationBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);
    const sort: Prisma.SortOrder = pagingQuery.sort === 'asc' ? 'asc' : 'desc';

    // if (authUser.roleNum != 1 && (!pagingQuery.q || pagingQuery.q?.trim() == '')) {
    //     const error = new CustomError(
    //         'Please provide a search text',
    //         {
    //             error: 'Search text is null',
    //             status: 400,
    //         }
    //     );

    //     throw error;
    // }

    const searchText = pagingQuery.q?.trim();

    // if (isEmptyStringNullOrUndefined(searchText)) {
    //     const reservations = await DbContext.bookReservation.findMany({
    //         where: {
    //             reservationAccessLevel: {
    //                 gte: authUser.roleNum,
    //             },
    //         },
    //         include: {
    //             user: true,
    //             reservationDetails: {
    //                 include: {
    //                     bookInfo:
    //                     {
    //                         include: {
    //                             bookCategory: true
    //                         }
    //                     },
    //                 },
    //             },
    //         },
    //         orderBy: {
    //             reservationDate: sort, // 'asc' for ascending, 'desc' for descending
    //         },

    //         skip: (pagingQuery.page - 1) * pagingQuery.size,
    //         take: pagingQuery.size,
    //     });

    //     return reservations;
    // }

    // return await DbContext.bookReservation.findMany({
    //     where: {
    //         AND: [
    //             {
    //                 reservationAccessLevel: {
    //                     gte: authUser.roleNum,
    //                 },
    //             },
    //             {
    //                 OR: [
    //                     {
    //                         reservationRef: {
    //                             contains: searchText,
    //                             mode: 'insensitive', // Case-insensitive search
    //                         },
    //                     },
    //                     {
    //                         reservationDate: {
    //                             equals: new Date(searchText ?? new Date('1900-01-01')), // You may need to adjust the date parsing logic based on your date format
    //                         },
    //                     },
    //                     {
    //                         reservationStatusNum: {
    //                             equals: (isNaN(parseInt(searchText ?? '0', 10)) ? 0 : parseInt(searchText ?? '0', 10)),
    //                         },
    //                     },
    //                     {
    //                         reservationComment: {
    //                             contains: searchText,
    //                             mode: 'insensitive',
    //                         },
    //                     },

    //                 ],
    //             },
    //         ],
    //     },
    //     include: {
    //         user: true,
    //         reservationDetails: {
    //             include: {
    //                 bookInfo:
    //                 {
    //                     include: {
    //                         bookCategory: true
    //                     }
    //                 },
    //             },
    //         },
    //     },
    //     orderBy: {
    //         reservationDate: sort, // 'asc' for ascending, 'desc' for descending
    //     },

    //     ...(isNaN(pagingQuery.page) || isNaN(pagingQuery.size)
    //         ? {} // If pagingQuery.page or pagingQuery.size is NaN, skip pagination
    //         : {
    //             skip: (pagingQuery.page - 1) * pagingQuery.size,
    //             take: pagingQuery.size,
    //         }),
    // })




    return await DbContext.bookReservation.findMany({
        where: {
            AND: [
                {
                    reservationAccessLevel: {
                        gte: authUser.roleNum,
                    },
                },
                {
                    OR: [
                        {
                            reservationRef: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                        searchText && isDate(searchText) ? {
                            reservationDate: {
                                equals: new Date(searchText),
                            },
                        } : {},
                        searchText && isNumber(searchText) ? {
                            reservationStatusNum: {
                                equals: parseInt(searchText ?? '0', -1),
                            },
                        } : {},
                        {
                            reservationComment: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },

                    ],
                },
            ],
        },
        include: {
            user:
            {
                include: {
                    addresses: true
                }
            },
            reservationDetails: {
                include: {
                    bookInfo:
                    {
                        include: {
                            bookCategory: true
                        }
                    },
                },
            },
        },
        orderBy: {
            reservationDate: sort, // 'asc' for ascending, 'desc' for descending
        },

        ...(isNaN(pagingQuery.page) || isNaN(pagingQuery.size)
            ? {} // If pagingQuery.page or pagingQuery.size is NaN, skip pagination
            : {
                skip: (pagingQuery.page - 1) * pagingQuery.size,
                take: pagingQuery.size,
            }),
    })


};

//---------------------- Create methods ----------------------\\

interface IBookReservation {
    bookReservation: BookReservation,
    reservationDetails: ReservationDetail[],
    user: User,
    address: Address
}

export const createBookReservationBL = async (authUser: AuthUser, newData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only
    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { bookReservation, reservationDetails, user, address }: IBookReservation = newData;

    // Create User if not exists by checking the user email and address otherwise update
    const userId = await getUserIdByEmail(user, address);

    let createdBookReservation = { id: '' };
    try {
        createdBookReservation = await DbContext.bookReservation.create({
            data: {
                reservationRef: bookReservation.reservationRef,
                reservationDate: new Date(bookReservation.reservationDate),
                reservationAccessLevel: bookReservation.reservationAccessLevel,
                reservationStatusNum: bookReservation.reservationStatusNum,
                reservationComment: bookReservation.reservationComment,
                userId,
                reservationDetails: {
                    create: reservationDetails
                },
            },
        });
    }
    catch (error) {
        DbContext.user.delete({
            where: {
                id: userId
            }
        })
        throw error;
    }

    if (createdBookReservation.id == '') {
        throw new CustomError(
            'Failed to create book reservation',
            {
                error: 'Failed to create book reservation',
                status: 500,
            }
        );
    }

    return await DbContext.bookReservation.findFirst({
        where: {
            id: createdBookReservation.id,
        },
        include: {
            user: {
                include: {
                    addresses: true
                }
            },
            reservationDetails: {
                include: {
                    bookInfo: {
                        include: {
                            bookCategory: true
                        }
                    },
                },
            },
        },
    });
};

//---------------------- Update methods ----------------------\\

export const updateBookReservationBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only
    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { bookReservation, reservationDetails, user, address }: IBookReservation = updateData;
    //const [updatedBookReservation, updatedUser] = await DbContext.$transaction([





    const updates: any = [
        DbContext.bookReservation.update({
            where: { id: bookReservation?.id },
            data: {
                reservationRef: bookReservation.reservationRef,
                reservationDate: bookReservation.reservationDate,
                reservationAccessLevel: bookReservation.reservationAccessLevel ?? 10,
                reservationStatusNum: bookReservation.reservationStatusNum ?? 1,
                reservationComment: bookReservation.reservationComment,
                userId: bookReservation?.userId,
                ...(reservationDetails && reservationDetails.length > 0 && {
                    reservationDetails: {
                        updateMany: reservationDetails.map((detail: ReservationDetail) => ({
                            where: { id: detail.id },
                            data: {
                                bookInfoId: detail.bookInfoId,
                                quantity: detail.quantity,
                                note: detail.note,
                            },
                        })),
                    },
                }),
            },
        }),
    ];

    if (user) {
        updates.push(
            DbContext.user.update({
                where: { id: user.id },
                data: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    ...(address && address.id && {
                        addresses: {
                            update: {
                                where: { id: address.id },
                                data: {
                                    street: address.street,
                                    city: address.city,
                                    state: address.state,
                                    country: address.country,
                                    postalCode: address.postalCode,
                                },
                            }
                        },
                    }),
                },
            })
        );
    }

    const [updatedBookReservation, updatedUser] = await DbContext.$transaction(updates);






    return await DbContext.bookReservation.findFirst({
        where: {
            id: updatedBookReservation.id,
        },
        include: {
            user: {
                include: {
                    addresses: true
                }
            },
            reservationDetails: {
                include: {
                    bookInfo: {
                        include: {
                            bookCategory: true
                        }
                    },
                },
            },
        },
    });
};

//---------------------- Delete methods ----------------------\\

export const deleteBookReservationBL = async (authUser: AuthUser, deleteIds: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const reservationIds: string[] = deleteIds;

    const bookReservations = await DbContext.bookReservation.findMany({
        where: {
            id: {
                in: reservationIds
            }
        },
    });

    const userReservationCounts = await DbContext.bookReservation.groupBy({
        by: ['userId'],
        _count: true,
    });

    // Create a map to store counts based on userId
    const countMap = new Map<string, number>();

    userReservationCounts.forEach((countResult) => {
        countMap.set(countResult.userId, countResult._count);
    });

    // Add count to each book reservation
    const bookReservationsWithCount = bookReservations.map((reservation) => ({
        ...reservation,
        count: countMap.get(reservation.userId) || 0,
    }));

    const userIds = bookReservationsWithCount
        .filter((reservation) => reservation.count <= 1)
        .map((reservation) => reservation.userId);

    const [deletedBookReservation, deletedUser] = await DbContext.$transaction([
        DbContext.bookReservation.deleteMany({
            where: {
                id: {
                    in: reservationIds,
                },
            },
        }),

        DbContext.user.deleteMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        }),
    ]);

    return { deletedBookReservation, deletedUser };
}

//---------------------- Helper methods ----------------------\\
async function getUserIdByEmail(user: any, address: any) {
    const existingUser = await DbContext.user.findFirst({
        where: {
            email: user.email,
        },
        select: {
            id: true,
        },
    });

    let existingAddress;

    if (existingUser) {
        existingAddress = await DbContext.address.findFirst({
            where: {
                userId: existingUser.id,
                addressType: 'Home',
            },
            select: {
                id: true,
            },
        });

    }

    const addressId = existingAddress ? existingAddress.id : '';

    const getUser = await DbContext.user.upsert({
        where: {
            email: user.email,
        },
        create: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: {
                create: [
                    {
                        addressType: 'Home',
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postalCode: address.postalCode,
                    },
                ],
            },
        },
        update: {
            name: user.name,
            email: user.email,
            addresses: {
                upsert: [
                    {
                        where: {
                            id: addressId,
                        },
                        update: {
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            postalCode: address.postalCode,
                        },
                        create: {
                            addressType: 'Home',
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            postalCode: address.postalCode,
                        },
                    },
                ],
            },
        },
    });

    return getUser.id;
}






export const getBookStockPositionBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);
    const sort: Prisma.SortOrder = pagingQuery.sort === 'asc' ? 'asc' : 'desc';

    const searchText = pagingQuery.q?.trim();


    const bookReservations = await DbContext.bookReservation.findMany({
        where: {
            reservationStatusNum: {
                equals: 1
            }
        },
    });


    const reservedBooks = await DbContext.reservationDetail.groupBy({
        where: {
            bookReservationId: {
                in: bookReservations.map((bookReservation) => bookReservation.id),
            }
        },
        by: ['bookInfoId'],
        _sum: {
            quantity: true
        }
    });


    // Create a map to store addition based on bookInfoId
    const countMapToBookInfoId = new Map<string, number>();

    reservedBooks.forEach((countResult) => {
        countMapToBookInfoId.set(countResult.bookInfoId, countResult._sum.quantity ?? 0);
    });

    const bookInfos = await DbContext.bookInfo.findMany({
        // where: {
        //     id: {
        //         in: reservedBooks.map((reservedBook) => reservedBook.bookInfoId),
        //     }
        // },
        select: {
            id: true,
            bookTitle: true,
            author: true,
            stock: true,
            publisher: true,
            publishDate: true,
            ISBN: true, 
            language: true,
            coverImage: true,
            note: true,
            bookCategory: {
                select: {
                    id: true,
                    bookCategoryName: true
                }
            },
        }
    });

    // Calculate books stock position
    const booksStockPosition = bookInfos.map(book => ({
        ...book,
        available: book.stock - (countMapToBookInfoId.get(book.id) ?? 0) // Subtract the sum of reservation details quantity from stock
    }));

    const availableBooks = booksStockPosition.filter(book => book.available > 0);
    const unavailableBooks = booksStockPosition.filter(book => book.available <= 0);

    return {
        availableBooks,
        unavailableBooks
    };

};


/* test input for creating book reservation
{
  "reservationRef": "reservationRef10",
  "reservationDate": "2022-01-01T00:00:00.000Z",
  "reservationAccessLevel": 1,
  "reservationComment": null,
  "reservationStatusNum": 1,
  "user": 
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "address":
    {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "country": "Country",
        "postalCode": "12345"
    }
  },
  "reservationDetails": [
    {
        "quantity": 1,
        "note": "",
        "bookInfoId": "65be17633f35ddd20fedbb35"
    }
  ]
}
*/


/* update user and address
{
            where: { id: existingUser.id },
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                addresses: {
                    update: [
                        {
                            where: {
                                id: existingUser.id,
                                addressType: 'Home'
                            },
                            data: {                              
                                street: '123 Main St',
                                city: 'City',
                                state: 'State',
                                country: 'Country',
                                postalCode: '12345',
                            },
                        },
                    ],
                },
            },
        }
*/


/* update user but create address if not exists, or update address if exists
{
            where: { id: existingUser.id },
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                addresses: {
                    upsert: [
                        {
                            where: {
                                id: existingUser.id,
                                addressType: 'Home',
                            },
                            update: {
                                street: '123 Main St',
                                city: 'City',
                                state: 'State',
                                country: 'Country',
                                postalCode: '12345',
                            },
                            create: {
                                addressType: 'Home',
                                street: '123 Main St',
                                city: 'City',
                                state: 'State',
                                country: 'Country',
                                postalCode: '12345',
                            },
                        },
                    ],
                },
            },
        }
*/



/* error for update book reservation
const updateBookReservation1 = await DbContext.bookReservation.update({
        where: { id: bookReservation.id },
        data: {
            reservationRef: bookReservation.reservationRef,
            reservationDate: bookReservation.reservationDate,
            reservationAccessLevel: bookReservation.reservationAccessLevel,
            reservationStatusNum: bookReservation.reservationStatusNum,
            userId: bookReservation.userId,
            user: {
                update: {
                    where: { id: user.id },
                    data: {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        addresses: {
                            update: {
                                where: { id: address.id },
                                data: {
                                    street: address.street,
                                    city: address.city,
                                    state: address.state,
                                    country: address.country,
                                    postalCode: address.postalCode,
                                },
                            }
                        },
                    },
                },
            },
            reservationDetails: {
                updateMany: reservationDetails.map((detail: ReservationDetail) => ({
                    where: { id: detail.id },
                    data: {
                        bookInfoId: detail.bookInfoId,
                        quantity: detail.quantity,
                        note: detail.note,
                    },
                })),
            },
        },
    });

*/



/* new create book reservation input format
{
    "bookReservation": {
        "reservationRef": "reservationRef13",
        "reservationDate": "2022-01-01T00:00:00.000Z",
        "reservationAccessLevel": 1,
        "reservationComment": null,
        "reservationStatusNum": 1
    },
    "reservationDetails": [
        {
            "quantity": 1,
            "note": "",
            "bookInfoId": "65be17633f35ddd20fedbb35"
        },
        {
            "quantity": 1,
            "note": "",
            "bookInfoId": "65bf3471358eda4b9be602b1"
        }
    ],
    "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": null
    },
    "address": {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "country": "Country",
        "postalCode": "12345"
    }
}
*/