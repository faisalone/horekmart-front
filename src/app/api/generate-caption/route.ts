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
- Start with simple, relatable language that grabs everyday people's attention
- Use words and phrases that regular people use in their daily conversations
- Use relevant emojis strategically to enhance engagement (not overwhelming)
- Create urgency using simple, direct words everyone knows
- Focus on clear benefits using everyday language people actually speak
- End with a simple, direct call-to-action that includes: ${productUrl}
- ALWAYS include relevant hashtags at the end in ENGLISH only (5-8 hashtags)
- Include product-specific hashtags based on category and product type
- Use mix of: general (#Bangladesh #OnlineShopping #Deal #Shopping), category-specific (e.g., #Electronics #Audio #Tech for electronics), and product-specific (e.g., #Microphone #Wireless #Recording for audio products)
- Keep it accessible and relatable (50-150 words ideal)
- Write like someone talking to their neighbors about something good
- Use common words that mass people use and immediately understand
- Sound like regular people sharing recommendations, not corporate marketing
- CRITICAL: Ensure proper spacing - no extra spaces between words in any language
- Use clean, properly formatted text without spacing issues
- DO NOT mention price, brand, stock status, or any product specifications
- Write in everyday language that mass people use and trust
- Focus on practical benefits using simple words everyone knows
- CRITICAL FOR BENGALI: Use simple, common Bengali words that regular people use every day
- Write like a helpful friend or family member sharing something useful
- Use familiar phrases people hear and say in their daily life
- Sound natural and relatable, like regular conversation between people
- IMPORTANT: Ensure clean formatting with NO extra spaces between words - use single spaces only
- IMPORTANT: Use proper line breaks (\n) to separate different ideas and create readable paragraphs
- IMPORTANT: Structure content with line breaks for better social media readability
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
