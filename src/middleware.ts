export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/workflows/:path*', '/settings/:path*'],
}
