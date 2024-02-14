import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/authOptions'
import CustomError from "./customError";

export interface AuthUser {
    name: string;
    email: string;
    roleNum: number;
    image?: string;
}

export default async function getAuthUser(): Promise<AuthUser> {
    const session = await getServerSession(authOptions);
    const authUser = { ...session?.user, roleNum: session?.roleNum };

    if (!authUser) {
        const error = new CustomError(
            'Login required',
            'Session not found',
        );
        error.status = 401;
        throw error;
    }

    const { name, email, roleNum, image } = authUser;

    return { name, email, roleNum, image } as AuthUser;
}





export async function checkOperationAccessibility(authUser: AuthUser, thisOperationAccessibilityLevel: number) {
    if (!authUser) {
        const error = new CustomError(
            'Please login first',
            {
                error: 'Login required',
                status: 401,
            }
        );
        throw error;
    }

    if (authUser.roleNum > thisOperationAccessibilityLevel) {
        const error = new CustomError(
            'Unauthorized access',
            {
                error: 'You do not have access to this resource',
                status: 401,
            }
        );
        throw error;
    }
}