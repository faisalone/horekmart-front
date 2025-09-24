import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const targetUrl = searchParams.get('url');

	if (!targetUrl) {
		return NextResponse.json(
			{ error: 'Missing url parameter' },
			{ status: 400 }
		);
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(targetUrl);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Invalid url parameter' },
			{ status: 400 }
		);
	}

	const allowedBackend =
		process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
	const allowedHost = new URL(allowedBackend).host;

	if (parsedUrl.host !== allowedHost) {
		return NextResponse.json(
			{ error: 'URL host not allowed' },
			{ status: 400 }
		);
	}

	try {
		const backendResponse = await fetch(parsedUrl.toString(), {
			headers: {
				Accept: 'image/*',
			},
			cache: 'no-store',
		});

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch watermark image' },
				{ status: backendResponse.status }
			);
		}

		const arrayBuffer = await backendResponse.arrayBuffer();
		const contentType =
			backendResponse.headers.get('content-type') || 'image/svg+xml';

		return new NextResponse(arrayBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=60',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	} catch (error) {
		console.error('watermark-proxy error:', error);
		return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
	}
}
