import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProductUrl } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
	try {
		const {
			product,
			customPrompt,
			previousCaptions = [],
		}: {
			product: any;
			customPrompt?: string;
			previousCaptions?: string[];
		} = await request.json();

		if (!product) {
			return NextResponse.json(
				{ error: 'Product is required' },
				{ status: 400 }
			);
		}

		const instruction =
			customPrompt?.trim() ||
			'Write a social media friendly caption in Bangla (Bengali language). Provide only a single version, include relevant hashtags, and include the product link in the call-to-action.';

		// Generate product URL
		const baseUrl =
			process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const productUrl = `${baseUrl}${getProductUrl(product)}`;
		const fullPrompt = `Product: ${product.name}

Product URL: ${productUrl}

${instruction}

${
	previousCaptions.length > 0
		? `Previous captions to avoid repeating: ${previousCaptions.join(', ')}`
		: ''
}`;

		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
		const result = await model.generateContent(fullPrompt);
		const response = await result.response;
		const caption = response.text();

		return NextResponse.json({ caption: caption });
	} catch (error) {
		console.error('Error generating caption:', error);
		return NextResponse.json(
			{ error: 'Failed to generate caption' },
			{ status: 500 }
		);
	}
}
