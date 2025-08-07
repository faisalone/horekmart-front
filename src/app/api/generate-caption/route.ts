import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
	try {
		const { product } = await request.json();

		if (!product) {
			return NextResponse.json(
				{ error: 'Product is required' },
				{ status: 400 }
			);
		}

		// Clean HTML description
		const cleanDescription = (html: string) => {
			if (!html) return '';
			// Simple HTML tag removal for server-side
			return html
				.replace(/<[^>]*>/g, '')
				.replace(/\s+/g, ' ')
				.trim();
		};

		// Create a simple prompt with product details
		const prompt = `Create an engaging social media caption for this product:

Product Name: ${product.name}
Description: ${cleanDescription(product.description)}
Price: $${product.sale_price || product.price}
${product.sale_price ? `Original Price: $${product.price} (ON SALE!)` : ''}
Category: ${product.category?.name || 'Product'}
Brand: ${product.vendor?.name || 'Our Store'}
Stock: ${product.in_stock ? 'Available' : 'Coming Soon'}
${product.is_featured ? 'This is a FEATURED product!' : ''}

Create a compelling social media post that:
- Highlights the key benefits
- Creates excitement and urgency
- Includes relevant emojis
- Has a clear call-to-action
- Uses 3-5 hashtags
- Is engaging for social media

Keep it concise but compelling!`;

		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const caption = response.text();

		return NextResponse.json({ caption });
	} catch (error) {
		console.error('Error generating caption:', error);

		// Simple fallback caption
		const fallbackCaption = `🌟 Check out our amazing new product! 
    
Quality you can trust at an unbeatable price!

💰 Great deals available now!

Shop now and experience the difference! 

#shopping #quality #newproduct #ecommerce #deals`;

		return NextResponse.json({ caption: fallbackCaption });
	}
}
