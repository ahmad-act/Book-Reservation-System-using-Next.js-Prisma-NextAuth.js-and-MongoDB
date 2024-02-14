import { Prisma } from '@prisma/client';
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import DbContext from "@/prisma/DbContext";


//---------------------- Get methods ----------------------\\
export const getReservationStatusBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const sort: Prisma.SortOrder = pagingQuery.sort === 'desc' ? 'desc' : 'asc';
    const searchText = pagingQuery.q?.trim();

    return await DbContext.reservationStatus.findMany({
        where: {
            AND: [
                {
                    reservationStatusAccessLevel: {
                        gte: authUser.roleNum,
                    },
                },
                {
                    OR: [
                        {
                            reservationStatusName: {
                                contains: searchText,
                                mode: 'insensitive', // Case-insensitive search
                            },
                        },
                        searchText ? 
                        {
                            reservationStatusNum: {
                                equals: parseInt(searchText, -1) || -1,
                            },
                        } :
                        {},                    
                        {
                            reservationStatusDescription: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            BookReservations: true,
        },
        orderBy: {
            reservationStatusName: sort, // 'asc' for ascending, 'desc' for descending
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
export interface CreateReservationStatus {
    reservationStatusName: string,
    reservationStatusNum: number,
    reservationStatusDescription: string,
    reservationStatusAccessLevel: number,
}

export const createReservationStatusBL = async (authUser: AuthUser, newData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { reservationStatusName, reservationStatusNum, reservationStatusDescription, reservationStatusAccessLevel }: CreateReservationStatus = newData;
    const newReservationStatus = {
        data: {
            reservationStatusName,
            reservationStatusNum,
            reservationStatusDescription,
            reservationStatusAccessLevel,
        },
    }

    return await DbContext.reservationStatus.create(newReservationStatus);
};

//---------------------- Update methods ----------------------\\
export interface UpdateReservationStatus {
    id: string,
    reservationStatusName: string,
    reservationStatusNum: number,
    reservationStatusDescription: string,
    reservationStatusAccessLevel: number,
}

export const updateReservationStatusBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { id, reservationStatusName, reservationStatusNum, reservationStatusDescription, reservationStatusAccessLevel }: UpdateReservationStatus = updateData;
    const updateReservationStatus = {
        where: { id },
        data: {
            reservationStatusName,
            reservationStatusNum,
            reservationStatusDescription,
            reservationStatusAccessLevel,
        },
    }

    return await DbContext.reservationStatus.update(updateReservationStatus);
};

//---------------------- Delete methods ----------------------\\
export interface DeleteReservationStatus {
    id: string,
}

export const deleteReservationStatusBL = async (authUser: AuthUser, deleteData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const ids: string[] = deleteData;
    return await DbContext.reservationStatus.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
};