// This file mocks API endpoints for Next.js API routes (Laravel-style)
// In production, these would be replaced by real backend endpoints
import { NextResponse } from 'next/server';
import { mockProducts, mockCategories } from '@/lib/mock-data';

export async function GET(request: Request) {
	// Example: /api/products
	if (request.url.endsWith('/products')) {
		return NextResponse.json(mockProducts);
	}
	// Example: /api/categories
	if (request.url.endsWith('/categories')) {
		return NextResponse.json(mockCategories);
	}
	// Example: /api/assets/logo
	if (request.url.endsWith('/assets/logo')) {
		// Use a static logo from public for now
		return NextResponse.json('/valtook-logo-v2.png');
	}
	return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
