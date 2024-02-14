import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { getUserRoleBL, createUserRoleBL, updateUserRoleBL, deleteUserRoleBL } from "@/app/businessLayer/userRoleBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser();
        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const userRoles = await getUserRoleBL(authUser, { q, page, size, sort } as QueryParams);
        return NextResponse.json({ userRoles, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newUserRole = await createUserRoleBL(authUser, await req.json());

        return NextResponse.json({ userRole: newUserRole, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedUserRole = await updateUserRoleBL(authUser, await req.json());

        return NextResponse.json({ userRole: updatedUserRole, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedUserRole = await deleteUserRoleBL(authUser, await req.json());

        return NextResponse.json({ userRole: deletedUserRole, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}