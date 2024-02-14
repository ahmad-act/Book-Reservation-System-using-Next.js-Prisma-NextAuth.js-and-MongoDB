import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { getBookCategoryBL, createBookCategoryBL, updateBookCategoryBL, deleteBookCategoryBL } from "@/app/businessLayer/bookCategoryBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser();
        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const bookCategories = await getBookCategoryBL(authUser, { q, page, size, sort } as QueryParams);

        return NextResponse.json({ bookCategories, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newBookCategory = await createBookCategoryBL(authUser, await req.json());

        return NextResponse.json({ bookCategory: newBookCategory, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedBookCategory = await updateBookCategoryBL(authUser, await req.json());

        return NextResponse.json({ bookCategory: updatedBookCategory, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedBookCategory = await deleteBookCategoryBL(authUser, await req.json());

        return NextResponse.json({ bookCategory: deletedBookCategory, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}