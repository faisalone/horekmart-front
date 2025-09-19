import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/public-api';
import { seoService } from '@/lib/seo';
import { structuredDataService } from '@/lib/structured-data';
import StructuredData from '@/components/StructuredData';
import ProductPageClient from './ProductPageClient';

interface ProductPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    // Extract the product slug (last part of the URL)
    const resolvedParams = await params;
    const productSlug = resolvedParams.slug[resolvedParams.slug.length - 1];
    const categorySlug = resolvedParams.slug.length > 1 ? resolvedParams.slug[0] : undefined;
    
    const product = await publicApi.getProduct(productSlug);
    return await seoService.generateProductMetadata(product, categorySlug);
  } catch (error) {
    // Fallback to default metadata if product not found
    return await seoService.generateDefaultMetadata('/products');
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // Extract the product slug (last part of the URL)
    const resolvedParams = await params;
    const productSlug = resolvedParams.slug[resolvedParams.slug.length - 1];
    
    const product = await publicApi.getProduct(productSlug);
    
    if (!product) {
      notFound();
    }

    // Pass the product data to the client component
    return (
      <>
        <StructuredData data={structuredDataService.generateProductStructuredData(product)} />
        <ProductPageClient product={product} />
      </>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}