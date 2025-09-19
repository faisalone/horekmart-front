import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/public-api';
import { seoService } from '@/lib/seo';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
	try {
		const resolvedParams = await params;
		const slug = resolvedParams.slug;

		// Fetch categories to find the current one
		const categories = await publicApi.getCategories();
		const category = categories.find((cat) => cat.slug === slug);

		if (!category) {
			// Fallback to default metadata if category not found
			return await seoService.generateDefaultMetadata(`/${slug}`);
		}

		return await seoService.generateCategoryMetadata(category);
	} catch (error) {
		console.error('Error generating category metadata:', error);
		// Fallback to default metadata
		return await seoService.generateDefaultMetadata('/');
	}
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const resolvedParams = await params;
	const slug = resolvedParams.slug;
	
	try {
		// Fetch categories to find the current one
		const categories = await publicApi.getCategories();
		const category = categories.find((cat) => cat.slug === slug);

		if (!category) {
			notFound();
		}

		// Pass the category data to the client component
		return <CategoryPageClient category={category} slug={slug} />;
	} catch (error) {
		console.error('Error fetching category:', error);
		// If server-side fetch fails, let client handle it to prevent hydration mismatch
		notFound();
	}
}
