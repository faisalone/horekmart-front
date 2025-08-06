import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Redirect admin routes to dashboard routes
	if (pathname.startsWith('/admin')) {
		const dashboardPath = pathname.replace('/admin', '/dashboard');
		return NextResponse.redirect(new URL(dashboardPath, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*'],
};
