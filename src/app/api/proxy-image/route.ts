import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const imageUrl = searchParams.get('url');

		if (!imageUrl) {
			return NextResponse.json(
				{ error: 'Image URL is required' },
				{ status: 400 }
			);
		}

		// Validate that it's from our backend
		const backendUrl =
			process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
		if (!imageUrl.startsWith(backendUrl)) {
			return NextResponse.json(
				{ error: 'Invalid image URL' },
				{ status: 400 }
			);
		}

		// Fetch the image from the backend
		const imageResponse = await fetch(imageUrl, {
			headers: {
				Accept: 'image/*',
			},
		});

		if (!imageResponse.ok) {
			console.error(
				'Backend image fetch failed:',
				imageResponse.status,
				imageResponse.statusText
			);
			return NextResponse.json(
				{ error: 'Failed to fetch image from backend' },
				{ status: imageResponse.status }
			);
		}

		// Get the image data
		const imageBuffer = await imageResponse.arrayBuffer();
		const contentType =
			imageResponse.headers.get('content-type') || 'image/svg+xml';

		// Return the image with proper CORS headers
		return new NextResponse(imageBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	} catch (error) {
		console.error('Error in image proxy:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
