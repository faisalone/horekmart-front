import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

		const userPrompt =
			customPrompt?.trim() || 'Write an engaging social media caption';

		// Generate product URL
		const baseUrl =
			process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const productUrl = `${baseUrl}/products/${
			product.category?.slug || 'category'
		}/${product.slug}`;

		const fullPrompt = `You are a professional social media expert creating captions for Bangladeshi online shoppers. Create a single, exceptional social media caption that:

🎯 TARGET AUDIENCE: Bangladeshi online shoppers who are active on social media and love discovering great deals
📱 PLATFORM: Optimized for Facebook/Instagram sharing and engagement
💡 GOAL: Drive clicks, engagement, and purchases through compelling storytelling

CAPTION STYLE GUIDELINES:
- Start with an attention-grabbing hook that creates immediate interest
- Include strong emotional triggers and clear benefits that drive action
- Use relevant emojis strategically to enhance engagement (not overwhelming)
- Create compelling urgency and exclusive feeling
- Include clear value proposition that motivates purchase decisions
- End with a strong call-to-action that includes: ${productUrl}
- ALWAYS include relevant hashtags at the end in ENGLISH only (3-8 hashtags)
- Use popular, discoverable hashtags like #Bangladesh #OnlineShopping #Deal #Shopping #Exclusive #Limited #Offer etc.
- Keep it promotional yet engaging (50-150 words ideal)
- Make it professional social media marketing content for Bangladeshi audience
- Focus on product benefits and transformation it brings to user's life
- Write in professional marketing tone that drives sales and engagement
- CRITICAL: Ensure proper spacing - no extra spaces between words in any language
- Use clean, properly formatted text without spacing issues
- DO NOT mention price, brand, stock status, or any product specifications
- Write professional social media marketing content that drives engagement and sales
- Focus on emotional benefits, lifestyle improvements, and product value
- CRITICAL FOR BENGALI: Use professional, marketing-focused Bengali with proper grammar and spacing
- Write as a skilled social media marketer targeting Bangladeshi online shoppers
- Use persuasive language that motivates immediate action and creates desire
- IMPORTANT: Ensure clean formatting with NO extra spaces between words - use single spaces only
- IMPORTANT: Respond ONLY in the language requested by the user - DO NOT provide translations
- IMPORTANT: Preserve line breaks and formatting as needed for readability

USER REQUEST: ${userPrompt}

PRODUCT CONTEXT (for your understanding only - DO NOT include ANY of these details in the caption):
Product: ${product.name}
Category: ${product.category?.name || 'Product'}

${
	previousCaptions.length > 0
		? `PREVIOUSLY GENERATED CAPTIONS (DO NOT repeat or create similar content):
${previousCaptions
	.map((caption, index) => `${index + 1}. ${caption}`)
	.join('\n')}

IMPORTANT: Create something completely different and unique from the above captions.`
		: ''
}

Create ONE compelling, natural-sounding caption in the EXACT language requested by the user WITHOUT translations. Include the product link: ${productUrl} in your call-to-action. Focus purely on creating desire and engagement without mentioning specifications. Make it completely unique and different from any previous captions.`;

		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const result = await model.generateContent(fullPrompt);
		const response = await result.response;
		const caption = response.text();

		return NextResponse.json({ caption });
	} catch (error) {
		console.error('Error generating caption:', error);
		return NextResponse.json(
			{ error: 'Failed to generate caption' },
			{ status: 500 }
		);
	}
}
