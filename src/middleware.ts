export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/wishlist/:path*', '/cart/:path*', '/profile/:path*', '/admin/:path*']
};
