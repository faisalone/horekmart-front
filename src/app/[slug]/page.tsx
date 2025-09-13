'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import AnimatedElement from '@/components/AnimatedElement';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SortingHeader from '@/components/SortingHeader';
import CategoryPageSkeleton from '@/components/CategoryPageSkeleton';
import { ListDropdown } from '@/components/ui/ListDropdown';
import { publicApi } from '@/lib/public-api';
import { Product, Category, SEOData } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';
import { generateCategoryPageSEO, generateCategoryStructuredData } from '@/services/seo';
import { useSEO } from '@/hooks/useSEO';

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CategoryPage({ }: CategoryPageProps) {
	const params = useParams();
	const router = useRouter();
	const slug = params.slug as string;

	const [category, setCategory] = useState<Category | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('featured');

	// SEO state
	const [seoData, setSeoData] = useState<SEOData | null>(null);
	const [structuredData, setStructuredData] = useState<any>(null);

	// Cart and wishlist contexts
	const { toggleItem: toggleWishlist } = useWishlist();
	const { addToCart: addToCartService } = useProductCheckout();

	// Apply SEO to page - only use backend data
	useSEO(seoData || { title: '', description: '' });

	// Sort options for custom select
	const sortOptions = [
		{ value: 'featured', label: '⭐ Featured Items' },
		{ value: 'price-low', label: '💰 Price: Low to High' },
		{ value: 'price-high', label: '💎 Price: High to Low' },
		{ value: 'name', label: '🔤 Name A-Z' },
		{ value: 'newest', label: '🆕 Newest First' }
	];

	useEffect(() => {
		const fetchCategoryData = async () => {
			try {
				setLoading(true);

				// Fetch categories to find the current one
				const categories = await publicApi.getCategories();
				const currentCategory = categories.find((cat: Category) => cat.slug === slug);

				if (!currentCategory) {
					router.push('/'); // Redirect to home if category not found
					return;
				}

				// Fetch products for this category using the API endpoint
				const productsResponse = await publicApi.getProducts({
					category: slug,
					per_page: 50 // Get more products for category pages
				});

				// Set all data at once to avoid gaps
				setCategory(currentCategory);
				setProducts(productsResponse.data);
				setFilteredProducts(productsResponse.data);

				// Generate SEO data for this category
				const categorySeoData = await generateCategoryPageSEO(currentCategory);
				setSeoData(categorySeoData);

				// Generate structured data for this category
				const categoryStructuredData = await generateCategoryStructuredData(currentCategory, productsResponse.data.length);
				setStructuredData(categoryStructuredData);
			} catch (error) {
				console.error('Error fetching category data:', error);
				setProducts([]);
				setFilteredProducts([]);
			} finally {
				setLoading(false);
			}
		};

		if (slug) {
			fetchCategoryData();
		}
	}, [slug, router]);

	// Filter and sort products
	useEffect(() => {
		const filtered = [...products];

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'price-low':
					return parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price);
				case 'price-high':
					return parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price);
				case 'name':
					return a.name.localeCompare(b.name);
				case 'newest':
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				case 'featured':
				default:
					return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
			}
		});

		setFilteredProducts(filtered);
	}, [products, sortBy]);

	const handleAddToCart = async (product: Product) => {
		try {
			await addToCartService(product.slug, 1);
		} catch (error) {
			console.error('Failed to add product to cart:', error);
		}
	};

	const handleAddToWishlist = (product: Product) => {
		// Handle both old and new image formats
		let productImage: string | undefined;
		if (product.images && Array.isArray(product.images) && product.images.length > 0) {
			const firstImage = product.images[0] as any;
			if (typeof firstImage === 'string') {
				// Legacy format: array of URLs
				productImage = firstImage;
			} else if (firstImage && typeof firstImage === 'object') {
				if (firstImage.url) {
					// New API format: array of {id, url} objects
					productImage = firstImage.url;
				} else if (firstImage.file_url) {
					// Old format: array of ProductImage objects
					productImage = firstImage.file_url;
				}
			}
		}
		
		// Fallback to thumb if no productImage found
		if (!productImage) {
			productImage = product.thumb || undefined;
		}

		const wishlistItem = {
			productId: product.id.toString(),
			productName: product.name,
			productImage,
			productSlug: product.slug,
			categorySlug: product.category?.slug,
			price: parseFloat(product.price),
			salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
			inStock: product.in_stock,
		};

		toggleWishlist(wishlistItem);
	};

	if (loading || !category) {
		return <CategoryPageSkeleton />;
	}

	if (!category) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
					<Link href="/" className="text-theme-primary hover:text-theme-primary-dark font-medium">
						← Return to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Structured Data for SEO */}
			{structuredData && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
			)}
			
			<div className="bg-gray-50 min-h-screen">
				{/* Compact Hero Section - Mobile Optimized */}
				<AnimatedElement animation="fadeIn">
				<div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
					{/* Content - Compact for mobile */}
					<div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-16">
						{/* Background Image - Only show on larger screens */}
						{category.image && (
							<div className="absolute inset-0 -z-10 hidden md:block">
								<div
									className="w-full h-full bg-cover bg-center bg-no-repeat opacity-30"
									style={{
										backgroundImage: `url(${category.image})`,
										maskImage:
											'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.3) 15%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)',
										WebkitMaskImage:
											'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.3) 15%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)',
									}}
								/>
								{/* White gradient overlay for better text readability */}
								<div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-white/60 opacity-40"></div>
							</div>
						)}

						{/* Breadcrumb - Compact */}
						<div className="mb-3 md:mb-6">
							<Breadcrumb
								items={[{ label: category.name }]}
								theme="light"
								className="mb-0"
							/>
						</div>

						{/* Title Only - No Description */}
						<div className="max-w-4xl">
							<div>
								<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-2 md:mb-4 leading-tight tracking-tight">
									{category.name}
								</h1>
								<div className="w-16 md:w-24 h-1 bg-theme-secondary rounded-full"></div>
							</div>
						</div>
					</div>

					{/* Decorative elements - Only on larger screens */}
					<div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-32 h-32 bg-theme-secondary/20 rounded-full blur-3xl hidden md:block"></div>
					<div className="absolute bottom-8 left-8 w-24 h-24 bg-theme-secondary/20 rounded-full blur-2xl hidden md:block"></div>
					
					{/* Bottom fade-out effect */}
					<div className="absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
				</div>
			</AnimatedElement>

			{/* Faded Border Separator */}
			

			<div className="bg-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
					{/* Enhanced Controls Bar */}
					<SortingHeader
						totalProducts={products.length}
						filteredProducts={filteredProducts.length}
						sortBy={sortBy}
						onSortChange={setSortBy}
						sortOptions={sortOptions}
						categoryName={category.name}
						isLoading={loading}
						className="mb-4 md:mb-8"
					/>

					{/* Products Grid */}
					<AnimatedElement animation="fadeIn" delay={300}>
						{filteredProducts.length === 0 ? (
							<div className="text-center py-16 bg-white rounded-xl shadow-sm">
								<div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-theme-secondary/10 to-theme-primary/10">
									<Heart className="w-12 h-12 text-theme-secondary" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									No Products Found
								</h3>
								<p className="text-gray-600 mb-6">
									Try browsing other categories or return to
									home
								</p>
								<Link
									href="/"
									className="inline-flex items-center px-6 py-3 bg-theme-secondary-dark text-white rounded-lg font-medium transition-all duration-200 hover:bg-theme-secondary"
								>
									Browse All Products
								</Link>
							</div>
						) : (
							<ProductGrid
								products={filteredProducts}
								onAddToCart={handleAddToCart}
								onAddToWishlist={handleAddToWishlist}
								className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
							/>
						)}
					</AnimatedElement>
				</div>
			</div>
		</div>
		</>
	);
}