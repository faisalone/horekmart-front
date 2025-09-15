import { seoService } from '@/lib/seo';
import { publicApi } from '@/lib/public-api';
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
    // If there's a category filter, try to get category-specific SEO
    if (resolvedSearchParams.category) {
      try {
        const categories = await publicApi.getCategories();
        const category = categories.find(cat => cat.slug === resolvedSearchParams.category);
        
        if (category) {
          return await seoService.generateCategoryMetadata(category);
        }
      } catch (error) {
        console.error('Error fetching category for SEO:', error);
      }
    }
    
    // Generate metadata based on search parameters
    let path = '/products';
    let titleSuffix = '';
    
    if (resolvedSearchParams.q) {
      titleSuffix = ` - Search: ${resolvedSearchParams.q}`;
      path += `?q=${encodeURIComponent(resolvedSearchParams.q)}`;
    } else if (resolvedSearchParams.type) {
      const typeLabels: { [key: string]: string } = {
        'trending': 'Trending Products',
        'deals': 'Special Deals',
        'featured': 'Featured Products',
      };
      titleSuffix = ` - ${typeLabels[resolvedSearchParams.type] || resolvedSearchParams.type}`;
      path += `?type=${resolvedSearchParams.type}`;
    } else if (resolvedSearchParams.category) {
      titleSuffix = ` - ${resolvedSearchParams.category}`;
      path += `?category=${resolvedSearchParams.category}`;
    }
    
    const defaultMetadata = await seoService.generateDefaultMetadata(path);
    
    // Customize title if we have specific search params
    if (titleSuffix) {
      return {
        ...defaultMetadata,
        title: `Products${titleSuffix} | Horekmart`,
      };
    }
    
    return defaultMetadata;
  } catch (error) {
    // Fallback to default metadata
    return await seoService.generateDefaultMetadata('/products');
  }
}

export default function ProductsPage(props: ProductsPageProps) {
  return <ProductsPageClient />;
}