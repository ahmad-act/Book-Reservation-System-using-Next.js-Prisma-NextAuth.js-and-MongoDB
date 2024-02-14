import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { getUserInfoBL, createUserInfoBL, updateUserInfoBL, deleteUserInfoBL } from "@/app/businessLayer/userInfoBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser();
        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const userInfos = await getUserInfoBL(authUser, { q, page, size, sort } as QueryParams);
        return NextResponse.json({ userInfos, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newUserInfo = await createUserInfoBL(authUser, await req.json());

        return NextResponse.json({ userInfo: newUserInfo, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedUserInfo = await updateUserInfoBL(authUser, await req.json());

        return NextResponse.json({ userInfo: updatedUserInfo, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedUserInfo = await deleteUserInfoBL(authUser, await req.json());

        return NextResponse.json({ userInfo: deletedUserInfo, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}