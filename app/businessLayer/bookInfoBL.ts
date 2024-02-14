import { Prisma } from '@prisma/client';
import CustomError from "@/lib/customError";
import { isEmptyStringNullOrUndefined } from "@/lib/commonUtil";
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import DbContext from "@/prisma/DbContext";


//---------------------- Get methods ----------------------\\
export const getBookInfoBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

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

    const sort: Prisma.SortOrder = pagingQuery.sort === 'desc' ? 'desc' : 'asc';
    const searchText = pagingQuery.q?.trim();

    return await DbContext.bookInfo.findMany({
        where: {
            AND: [
                {
                    bookInfoAccessLevel: {
                        gte: authUser.roleNum,
                    },
                },
                {
                    OR: [
                        {
                            bookTitle: {
                                contains: searchText,
                                mode: 'insensitive', // Case-insensitive search
                            },
                        },
                        {
                            author: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                        {
                            ISBN: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                        {
                            publisher: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                        {
                            bookCategory: {
                                bookCategoryName: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            bookCategory: true,
        },
        orderBy: {
            bookTitle: sort, // 'asc' for ascending, 'desc' for descending
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
export interface ICreateBookInfo {
    bookTitle: string,
    stock: number,
    author: string,
    ISBN: string | null | undefined,
    publisher: string | null | undefined,
    publishDate: Date | null | undefined,
    language: string | null | undefined,
    coverImage: string | null | undefined,
    note: string | null | undefined,
    bookInfoAccessLevel: number,
    bookCategoryId: string
}

export const createBookInfoBL = async (authUser: AuthUser, newData: any) => {
    console.log("🚀 ~ file: bookInfoBL.ts:108 ~ createBookInfoBL ~ newData:", newData)
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    let { bookTitle, stock, author, ISBN, publisher, publishDate, language, coverImage, note, bookInfoAccessLevel, bookCategoryId }: ICreateBookInfo = newData;

    // Get default book category if not provided
    bookCategoryId = await getDefaultBookCategoryId(bookCategoryId);

    const newBookInfo = {
        data: {
            bookTitle,
            stock,
            author,
            ISBN,
            publisher,
            publishDate,
            language,
            coverImage,
            note,
            bookInfoAccessLevel,
            bookCategoryId,
        },
    }

    return await DbContext.bookInfo.create(newBookInfo);
};

//---------------------- Update methods ----------------------\\
export interface IUpdateBookInfo {
    id: string,
    bookTitle: string,
    stock: number,
    author: string,
    ISBN: string | null | undefined,
    publisher: string | null | undefined,
    publishDate: Date | null | undefined,
    language: string | null | undefined,
    coverImage: string | null | undefined,
    note: string | null | undefined,
    bookInfoAccessLevel: number,
    bookCategoryId: string
}

export const updateBookInfoBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    let { id, bookTitle, stock, author, ISBN, publisher, publishDate, language, coverImage, note, bookInfoAccessLevel, bookCategoryId }: IUpdateBookInfo = updateData;

    // Get default book category if not provided
    bookCategoryId = await getDefaultBookCategoryId(bookCategoryId);

    const updateBookInfo = {
        where: { id },
        data: {
            bookTitle,
            stock,
            author,
            ISBN,
            publisher,
            publishDate,
            language,
            coverImage,
            note,
            bookInfoAccessLevel,
            bookCategoryId,
        },
    }

    return await DbContext.bookInfo.update(updateBookInfo);
};

//---------------------- Delete methods ----------------------\\
export interface DeleteBookInfo {
    id: string,
}

export const deleteBookInfoBL = async (authUser: AuthUser, deleteData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser.roleNum, thisOperationAccessibilityLevel);

    const ids: string[] = deleteData;
    return await DbContext.bookInfo.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
};

async function getDefaultBookCategoryId(bookCategoryId: string) {
    if (isEmptyStringNullOrUndefined(bookCategoryId)) {
        const defaultBookCategory = await DbContext.bookCategory.findFirst({
            where: {
                bookCategoryName: 'Undefined',
            }
        });

        if (defaultBookCategory) {
            bookCategoryId = defaultBookCategory.id;
        } else {
            const createdDefaultBookCategory = await DbContext.bookCategory.create({
                data: {
                    bookCategoryName: 'Undefined',
                    bookCategoryDescription: 'Undefined',
                    bookCategoryAccessLevel: 10,
                }
            });

            bookCategoryId = createdDefaultBookCategory.id;
        }
    }
    return bookCategoryId;
}
