import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { getBookStockPositionBL } from "@/app/businessLayer/bookReservationBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = { id: 1, roleNum: 1, name: 'Admin', email: 'admin' };//await getAuthUser();
        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const bookStockPositions = await getBookStockPositionBL(authUser, { q, page, size, sort } as QueryParams);

        return NextResponse.json({ bookStockPositions, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

