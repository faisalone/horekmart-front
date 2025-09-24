import { seoService } from '@/lib/seo';
import { publicApi } from '@/lib/public-api';
import { structuredDataService } from '@/lib/structured-data';
import StructuredData from '@/components/StructuredData';
import ProductsPageClient from './ProductsPageClient';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    type?: string;
    sort?: string;
    vendor?: string;
    price_min?: string;
    price_max?: string;
    in_stock?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  try {
    const resolvedSearchParams = await searchParams;
    // Handle category-specific SEO first, with proper hyphen separator and canonical path
    if (resolvedSearchParams.category) {
      try {
        const categories = await publicApi.getCategories();
        const category = categories.find(cat => cat.slug === resolvedSearchParams.category);
        
        if (category) {
          // Use query-param based canonical to reflect current URL pattern
          return await seoService.generateCategoryMetadata(category, `/products?category=${category.slug}`);
        }
      } catch (error) {
        console.error('Error fetching category for SEO:', error);
      }
    }

    // Build listing titles using site settings and hyphen separator
  const siteName: string = await seoService.getSiteName();

    let path = '/products';
    let title = `All Products - ${siteName}`;

    if (resolvedSearchParams.q) {
      const q = resolvedSearchParams.q;
      path += `?q=${encodeURIComponent(q)}`;
      title = `Search results for "${q}" - ${siteName}`;
    } else if (resolvedSearchParams.type) {
      const type = resolvedSearchParams.type;
      path += `?type=${type}`;
      const mapping: Record<string, string> = {
        'trending': 'Trending Products',
        'deals': 'Best Deals',
        'most-viewed': 'Most Viewed Products',
        'new-arrivals': 'New Arrivals',
        'fresh-arrivals': 'New Arrivals',
        'best-sellers': 'Best Sellers',
      };
      title = `${mapping[type] || type} - ${siteName}`;
    }

    const base = await seoService.generateDefaultMetadata(path);
    return {
      ...base,
      title,
      openGraph: base.openGraph ? { ...base.openGraph, title } : undefined,
      twitter: base.twitter ? { ...base.twitter, title } : undefined,
    };
  } catch (error) {
    // Fallback to default metadata
    return await seoService.generateDefaultMetadata('/products');
  }
}

export default async function ProductsPage(props: ProductsPageProps) {
  const resolvedSearchParams = await props.searchParams;
  
  // Generate search results structured data if there's a search query
  let searchStructuredData = null;
  if (resolvedSearchParams.q) {
    try {
      const searchResults = await publicApi.getProducts({ 
        search: resolvedSearchParams.q,
        per_page: 10 
      });
      searchStructuredData = await structuredDataService.generateSearchResultsStructuredData(
        resolvedSearchParams.q, 
        searchResults.data
      );
    } catch (error) {
      console.error('Error generating search structured data:', error);
    }
  }

  return (
    <>
      {searchStructuredData && <StructuredData data={searchStructuredData} />}
      <ProductsPageClient />
    </>
  );
}