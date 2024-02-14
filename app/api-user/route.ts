import { NextResponse } from "next/server";
import DbContext from "@/prisma/DbContext";
import { hash } from "bcrypt";
import { email, minLength, object, parse, string } from "valibot";

const LoginSchema = object({
   name: string([
      minLength(1, "Please enter your name."),
      minLength(3, "Your name must have 3 characters or more."),
   ]),
   email: string([
      minLength(1, "Please enter your email."),
      email("The email address is badly formatted."),
   ]),
   password: string([
      minLength(1, "Please enter your password."),
      minLength(8, "Your password must have 8 characters or more."),
   ]),
   role: string([
      minLength(1, "Please select a role.")
   ]),
});

export async function POST(req: Request) {
   try {
      const body = await req.json();
      console.log("🚀 ~ file: route.ts:27 ~ POST ~ body:", body)
      const { name, email, password, role } = body;

      parse(LoginSchema, { name, email, password, role});

      const existingEmail = await DbContext.user.findUnique({
         where: { email: email },
      });

      if (existingEmail) {
         return NextResponse.json(
            { user: null, message: "Email existed" },
            { status: 200 }
         );
      }

      const hashedPassword = await hash(password, 10);
      
      const newUser = await DbContext.user.create({
         data: {
            name: name,
            email: email,
            hashedPassword: hashedPassword,
            roleNum: parseInt(role, 10),
         },
      });
      const { hashedPassword: newUserPassword, ...rest } = newUser;

      return NextResponse.json({ user: rest, message: null }, { status: 201 });
   } catch (error: any) {
      console.error("Error:", error);
      return NextResponse.json({ details: error.message }, { status: 500 });
   }
}
