import { NextAuthOptions } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import DbContext from "@/prisma/DbContext";
import { compare } from 'bcrypt';

// Error warning: Do not put export before method const authOptions: NextAuthOptions = {} if the codes are used in the file app\api\auth\[...nextauth]\route.ts
//https://stackoverflow.com/questions/76388994/next-js-13-4-and-nextauth-type-error-authoptions-is-not-assignable-to-type-n
//https://stackoverflow.com/questions/76298505/my-next-js-app-isnt-building-and-returing-a-type-error-how-do-i-fix
//https://stackoverflow.com/questions/74425533/property-role-does-not-exist-on-type-user-adapteruser-in-nextauth
//https://stackoverflow.com/questions/71185287/pass-more-data-to-session-in-next-auth 
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(DbContext),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || '',
            clientSecret: process.env.GOOGLE_SECRET || '',
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
            profile: async (profile: any) => {
                console.log("🚀 ~ file: authOptions.ts:28 ~ profile: ~ profile:", profile)
                //console.log('Google Profile:', profile);
                return {
                    id: profile.sub,
                    name: profile.name || profile.given_name + " " + profile.family_name,
                    email: profile.email,
                    image: profile.picture,
                    roleNum: profile.role ?? 2
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
            profile: async (profile: any) => {
                //console.log('GitHub Profile:', profile);
                return {
                    id: profile.id,
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.picture,
                    roleNum: profile.role ?? 2
                }
            }
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            type: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            authorize: async (credentials, req) => {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                const user = await DbContext.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user.hashedPassword) {
                    throw new Error('Email does not exist');
                }

                const isCorrectPassword = await compare(credentials.password, user.hashedPassword);

                if (!isCorrectPassword) {
                    throw new Error('Incorrect password');
                }

                return user;
                //return {
                //...user,  // Include existing properties
                //role: user.role,  // Include the 'role' property
                //};
            }
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            //console.log('jwt Callback - token:', token);
            //console.log('jwt Callback - user:', user);
            if (user && user.roleNum) {
                token.roleNum = user.roleNum;
            }
            return token;
        },
        session: async ({ session, token }) => {
            //console.log('Session Callback - session:', session);
            //console.log('Session Callback - token:', token);

            if (token && token.roleNum) {
                session.roleNum = token.roleNum;
            }

            //console.log('Session Callback - session:', session);
            return session;
        },
    },
    pages: {
        signIn: '/auth', // Specify the path to your sign-in page
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt'
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET
};
