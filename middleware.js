import { withAuth } from 'next-auth/middleware'

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            if (req.nextUrl.pathname === '/admin') {
                return token?.role === 'Admin'
            }

            return Boolean(token)
        }
    }
})

export const config = { matcher: ['/', '/admin', '/profile', '/bookcategory', '/bookinfo', '/reservationstatus', '/bookreservation', '/userinfo', '/api/:path*'] }

//export const config = { matcher: ['/admin', '/profile'] }

//export { default } from 'next-auth/middleware'

//export const config = { matcher: ['/admin', '/profile', '/protected/:path*'] }
