import { NextRequest, NextResponse } from 'next/server';

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

	// Derive backend URL from NEXT_PUBLIC_API_URL environment variable
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	let allowedHosts: string[] = [];

	if (apiUrl) {
		// Extract host from API URL (remove /api suffix if present)
		const backendUrl = apiUrl.replace(/\/api\/?$/, '');
		const backendHost = new URL(backendUrl).host;
		allowedHosts.push(backendHost);

		console.log('🔍 Environment API URL:', apiUrl);
		console.log('🔍 Derived backend host:', backendHost);
	}

	// Add fallback hosts for development
	allowedHosts.push('localhost:8000', '127.0.0.1:8000');

	console.log('🔍 Allowed hosts:', allowedHosts);
	console.log('🔍 Request host:', parsedUrl.host);

	if (!allowedHosts.includes(parsedUrl.host)) {
		console.error(
			'❌ Host not allowed:',
			parsedUrl.host,
			'Expected one of:',
			allowedHosts
		);
		return NextResponse.json(
			{
				error: 'URL host not allowed',
				details: {
					requestedHost: parsedUrl.host,
					allowedHosts: allowedHosts,
					apiUrl: apiUrl,
				},
			},
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
