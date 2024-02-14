import errorLog from "@/lib/errorLog";
import { NextResponse } from "next/server";
import getAuthUser from "@/lib/getAuthUser";
import { QueryParams } from "@/lib/interfaces";
import url from "url";
import { createBookReservationBL, getBookReservationBL, updateBookReservationBL, deleteBookReservationBL } from "@/app/businessLayer/bookReservationBL";


//---------------------- Get methods ----------------------\\
export async function GET(req: Request) {
    try {
        const authUser = { id: 1, roleNum: 1, name: 'Admin', email: 'admin' };//await getAuthUser();
        const { q, page = NaN, size = NaN, sort = 'asc' } = url.parse(req.url, true).query;

        const bookReservations = await getBookReservationBL(authUser, { q, page, size, sort } as QueryParams);

        return NextResponse.json({ bookReservations, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }
}

//---------------------- Create methods ----------------------\\
export async function POST(req: Request) {
    try {
        const authUser = await getAuthUser();

        const newBookReservation = await createBookReservationBL(authUser, await req.json());
        return NextResponse.json({ bookReservation: newBookReservation, message: null }, { status: 201 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Update methods ----------------------\\
export async function PUT(req: Request) {
    try {
        const authUser = await getAuthUser();

        const updatedBookReservation = await updateBookReservationBL(authUser, await req.json());

        return NextResponse.json({ bookReservation: updatedBookReservation, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

//---------------------- Delete methods ----------------------\\
export async function DELETE(req: Request) {
    try {
        const authUser = await getAuthUser();

        const deletedBookReservation = await deleteBookReservationBL(authUser, await req.json());

        return NextResponse.json({ bookReservation: deletedBookReservation, message: null }, { status: 200 });
    } catch (err: any) {
        const error = errorLog(err.message, err);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}




/* test input for creating book reservation
{
  "reservationRef": "reservationRef6",
  "reservationDate": "2022-01-01T00:00:00.000Z",
  "reservationAccessLevel": 1,
  "reservationComment": null,
  "reservationStatusNum": 1,
  "user": 
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "address":
    {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "country": "Country",
        "postalCode": "12345",
    }
  },
  "reservationDetails": [
    {
        "quantity": 1,
        "note": "",
        "bookReservationId": "65be9a664d4cd2487338406d",
        "bookInfoId": "65be17633f35ddd20fedbb35"
    }
  ]
}
*/