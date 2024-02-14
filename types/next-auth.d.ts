/* 
    To add new properties to the 'Session' and 'User' types,
    Here added 'roleNum' property to 'Session' and 'User' to control access 
*/
import { DefaultUser , Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession{
        roleNum?: Int | null;
    }
    interface User extends DefaultUser {
        roleNum?: Int | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        roleNum?: Int | null;
    }
}

//After changing need to execute: npm run build