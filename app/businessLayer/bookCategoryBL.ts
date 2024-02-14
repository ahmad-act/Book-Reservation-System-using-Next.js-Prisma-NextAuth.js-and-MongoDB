import { Prisma } from '@prisma/client';
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import DbContext from "@/prisma/DbContext";


//---------------------- Get methods ----------------------\\
export const getBookCategoryBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const sort: Prisma.SortOrder = pagingQuery.sort === 'asc' ? 'asc' : 'desc';
    const searchText = pagingQuery.q?.trim();

    return await DbContext.bookCategory.findMany({
        where: {
            AND: [
                {
                    bookCategoryAccessLevel: {
                        gte: authUser.roleNum,
                    },
                },
                {
                    OR: [
                        {
                            bookCategoryName: {
                                contains: searchText,
                                mode: 'insensitive', // Case-insensitive search
                            },
                        },
                        {
                            bookCategoryDescription: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            bookInfos: true,
        },
        orderBy: {
            updatedAt: sort, // 'asc' for ascending, 'desc' for descending
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
export interface ICreateBookCategory {
    bookCategoryName: string,
    bookCategoryDescription: string,
    bookCategoryAccessLevel: number,
}

export const createBookCategoryBL = async (authUser: AuthUser, newData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { bookCategoryName, bookCategoryDescription, bookCategoryAccessLevel }: ICreateBookCategory = newData;

    return await DbContext.bookCategory.create({
        data: {
            bookCategoryName,
            bookCategoryDescription,
            bookCategoryAccessLevel,
        },
    });
};

//---------------------- Update methods ----------------------\\
export interface UpdateBookCategory {
    id: string,
    bookCategoryName: string,
    bookCategoryDescription: string,
    bookCategoryAccessLevel: number,
}

export const updateBookCategoryBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { id, bookCategoryName, bookCategoryDescription, bookCategoryAccessLevel }: UpdateBookCategory = updateData;
    const updateBookCategory = {
        where: { id },
        data: {
            bookCategoryName,
            bookCategoryDescription,
            bookCategoryAccessLevel,
        },
    }

    return await DbContext.bookCategory.update(updateBookCategory);
};

//---------------------- Delete methods ----------------------\\

export const deleteBookCategoryBL = async (authUser: AuthUser, deleteData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const ids: string[] = deleteData;
    return await DbContext.bookCategory.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });

};