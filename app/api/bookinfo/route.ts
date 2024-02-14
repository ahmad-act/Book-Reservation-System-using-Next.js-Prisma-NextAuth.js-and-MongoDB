import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { createBookInfoBL, getBookInfoBL, updateBookInfoBL, deleteBookInfoBL } from "@/app/businessLayer/bookInfoBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser();

        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const bookInfos = await getBookInfoBL(authUser, { q, page, size, sort } as QueryParams);

        return NextResponse.json({ bookInfos, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newBookInfo = await createBookInfoBL(authUser, await req.json());

        return NextResponse.json({ bookInfo: newBookInfo, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedBookInfo = await updateBookInfoBL(authUser, await req.json());

        return NextResponse.json({ bookInfo: updatedBookInfo, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedBookInfo = await deleteBookInfoBL(authUser, await req.json());

        return NextResponse.json({ bookInfo: deletedBookInfo, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}