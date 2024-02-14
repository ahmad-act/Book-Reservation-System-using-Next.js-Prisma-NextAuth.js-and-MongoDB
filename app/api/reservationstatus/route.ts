import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { createReservationStatusBL, getReservationStatusBL, updateReservationStatusBL, deleteReservationStatusBL } from "@/app/businessLayer/reservationStatusBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = await getAuthUser();

        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const reservationStatus = await getReservationStatusBL(authUser, { q, page, size, sort } as QueryParams);
        return NextResponse.json({ reservationStatus, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newReservationStatus = await createReservationStatusBL(authUser, await req.json());
        return NextResponse.json({ reservationStatus: newReservationStatus, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedReservationStatus = await updateReservationStatusBL(authUser, await req.json());

        return NextResponse.json({ reservationStatus: updatedReservationStatus, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedReservationStatus = await deleteReservationStatusBL(authUser, await req.json());

        return NextResponse.json({ reservationStatus: deletedReservationStatus, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}