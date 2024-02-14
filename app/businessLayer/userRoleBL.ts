import { isNumber, isDate } from "@/lib/commonUtil";
import { email } from 'valibot';
import { Prisma } from '@prisma/client';
import { AuthUser, checkOperationAccessibility } from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import DbContext from "@/prisma/DbContext";


//---------------------- Get methods ----------------------\\
export const getUserRoleBL = async (authUser: AuthUser, pagingQuery: QueryParams) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const sort: Prisma.SortOrder = pagingQuery.sort === 'asc' ? 'asc' : 'desc';
    const searchText = pagingQuery.q?.trim();

    return await DbContext.userRole.findMany({
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
                            roleName: {
                                contains: searchText,
                                mode: 'insensitive', // Case-insensitive search
                            },
                        },
                        searchText && isNumber(searchText) ? {
                            roleSerial: {
                                equals: parseInt(searchText ?? '0', -1),
                            },
                        } : {},
                        {
                            roleDescription: {
                                contains: searchText,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            users: true,
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
export interface ICreateUserRole {
    roleName: string,
    roleSerial: number,
    roleDescription: string,
    userRoleAccessLevel: number,
}

export const createUserRoleBL = async (authUser: AuthUser, newData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { roleName, roleSerial, roleDescription, userRoleAccessLevel }: ICreateUserRole = newData;

    return await DbContext.userRole.create({
        data: {
            roleName,
            roleSerial,
            roleDescription,
            userRoleAccessLevel,
        },
    });
};

//---------------------- Update methods ----------------------\\
export interface UpdateUserRole {
    id: string,
    roleName: string,
    roleSerial: number,
    roleDescription: string,
    userRoleAccessLevel: number,
}

export const updateUserRoleBL = async (authUser: AuthUser, updateData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const { id, roleName, roleSerial, roleDescription, userRoleAccessLevel }: UpdateUserRole = updateData;
    const updateUserRole = {
        where: { id },
        data: {
            roleName,
            roleSerial,
            roleDescription,
            userRoleAccessLevel,
        },
    }

    return await DbContext.userRole.update(updateUserRole);
};

//---------------------- Delete methods ----------------------\\

export const deleteUserRoleBL = async (authUser: AuthUser, deleteData: any) => {
    const thisOperationAccessibilityLevel = 1; // 1 for Admin only

    //checkOperationAccessibility(authUser, thisOperationAccessibilityLevel);

    const ids: string[] = deleteData;
    return await DbContext.userRole.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });

};