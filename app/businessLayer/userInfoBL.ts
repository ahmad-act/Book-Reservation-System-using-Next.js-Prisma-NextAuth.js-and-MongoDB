import { email } from 'valibot';
import { Prisma } from '@prisma/client';
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import DbContext from "@/prisma/DbContext";
import { hash } from "bcrypt";


//---------------------- Get methods ----------------------\\
export const getUserInfoBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const sort: Prisma.SortOrder = pagingQuery.sort === 'asc' ? 'asc' : 'desc';
    const searchText = pagingQuery.q?.trim();

    return await DbContext.user.findMany({
        where: {
            AND: [
                // {
                //     userAccessLevel: {
                //         gte: authUser.roleNum,
                //     },
                // },
                {
                    OR: [
                        {
                            name: {
                                contains: searchText,
                                mode: 'insensitive', // Case-insensitive search
                            },
                        },
                        {
                            email: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                        {
                            phone: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            addresses: true,
            userRole: true,
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
export interface ICreateUserInfo {
    name: string,
    email: string,
    phone: string,
    password: string,
    roleNum: number,
    userAccessLevel: number, 
    address: {
        street: string,
        city: string,
        state: string,
        country: string,
        postalCode: string,
    }
}

export const createUserInfoBL = async (authUser: AuthUser, newData: any) => {
    console.log("🚀 ~ file: userInfoBL.ts:83 ~ createUserInfoBL ~ newData:", newData)
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { name, email, phone, password, roleNum, userAccessLevel, address }: ICreateUserInfo = newData;

    return await DbContext.user.create({
        data: {
            name,
            email,
            phone,
            hashedPassword : await hash(password, 10),
            roleNum,
            userAccessLevel,
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
    });
};

//---------------------- Update methods ----------------------\\
export interface UpdateUserInfo {
    id: string,
    name: string,
    email: string,
    phone: string,
    password: string,
    roleNum: number,
    userAccessLevel: number,
}

export const updateUserInfoBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { id, name, email, phone, password, roleNum, userAccessLevel }: UpdateUserInfo = updateData;
    const updateUserInfo = {
        where: { id },
        data: {
            name,
            email,
            phone,
            hashedPassword : password,
            roleNum,
            userAccessLevel,
        },
    }

    return await DbContext.user.update(updateUserInfo);
};

//---------------------- Delete methods ----------------------\\

export const deleteUserInfoBL = async (authUser: AuthUser, deleteData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const ids: string[] = deleteData;
    return await DbContext.user.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });

};