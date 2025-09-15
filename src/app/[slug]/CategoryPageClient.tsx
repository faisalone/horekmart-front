'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, House, ChevronRight } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import AnimatedElement from '@/components/AnimatedElement';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CategoryPageSkeleton from '@/components/CategoryPageSkeleton';
import SortingHeader from '@/components/SortingHeader';
import { publicApi } from '@/lib/public-api';
import { Product, Category } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';

interface CategoryPageClientProps {
	category: Category;
	slug: string;
}

export default function CategoryPageClient({ category: initialCategory, slug }: CategoryPageClientProps) {
	const router = useRouter();

	const [category, setCategory] = useState<Category | null>(initialCategory);
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('featured');

	// Cart and wishlist contexts
	const { toggleItem: toggleWishlist } = useWishlist();
	const { addToCart: addToCartService } = useProductCheckout();

	// Sort options to match ProductsPageClient format
	const sortOptions = [
		{ value: 'featured', label: 'Featured Items' },
		{ value: 'price-asc', label: 'Price: Low to High' },
		{ value: 'price-desc', label: 'Price: High to Low' },
		{ value: 'name-asc', label: 'Name A-Z' },
		{ value: 'newest-desc', label: 'Newest First' }
	];

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);

				// Fetch products for this category using the API endpoint
				const productsResponse = await publicApi.getProducts({
					category: slug,
					per_page: 50 // Get more products for category pages
				});

				// Set products data
				setProducts(productsResponse.data);
				setFilteredProducts(productsResponse.data);

			} catch (error) {
				console.error('Error fetching category products:', error);
				setProducts([]);
				setFilteredProducts([]);
			} finally {
				setLoading(false);
			}
		};

		if (slug && initialCategory) {
			fetchProducts();
		}
	}, [slug, initialCategory]);

	// Filter and sort products
	useEffect(() => {
		const filtered = [...products];

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'price-asc':
					return parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price);
				case 'price-desc':
					return parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price);
				case 'name-asc':
					return a.name.localeCompare(b.name);
				case 'newest-desc':
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
			inStock: (product.stock_quantity || 0) > 0,
		};

		toggleWishlist(wishlistItem);
	};

	if (loading) {
		return <CategoryPageSkeleton />;
	}

	if (!category) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
					<p className="text-gray-600 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
					<Link
						href="/"
						className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
					>
						Go Home
					</Link>
				</div>
			</div>
		);
	}

	// Breadcrumb items
	const breadcrumbItems = [
		{ label: 'Products', href: '/products' },
		{ label: category.name }
	];

	return (
		<>
		<div className="min-h-screen bg-gray-50">
			{/* Enhanced Category Header */}
			<AnimatedElement animation="fadeIn" delay={100}>
				<div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
					<div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-16">
						{/* Background Image Overlay */}
						{category.image_url && (
							<div className="absolute inset-0 -z-10 hidden md:block">
								<div 
									className="w-full h-full bg-cover bg-center bg-no-repeat opacity-30"
									style={{
										backgroundImage: `url("${category.image_url}")`,
										maskImage: 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.3) 15%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 70%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)'
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-white/60 opacity-40" />
							</div>
						)}

						{/* Enhanced Breadcrumb */}
						<div className="mb-3 md:mb-6">
							<nav className="flex items-center space-x-2 text-sm mb-0" aria-label="Breadcrumb">
								<Link href="/" className="flex items-center transition-colors text-gray-500 hover:text-theme-secondary">
									<House className="w-4 h-4" aria-hidden="true" />
									<span className="sr-only">Home</span>
								</Link>
								<div className="flex items-center space-x-2">
									<ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
									<span className="text-gray-900 font-medium">{category.name}</span>
								</div>
							</nav>
						</div>

						{/* Category Title Section */}
						<div className="max-w-4xl">
							<div>
								<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-2 md:mb-4 leading-tight tracking-tight">
									{category.name}
								</h1>
								<div className="w-16 md:w-24 h-1 bg-theme-secondary rounded-full" />
							</div>
						</div>
					</div>

					{/* Decorative Elements */}
					<div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-32 h-32 bg-theme-secondary/20 rounded-full blur-3xl hidden md:block" />
					<div className="absolute bottom-8 left-8 w-24 h-24 bg-theme-secondary/20 rounded-full blur-2xl hidden md:block" />
					<div className="absolute bottom-0 left-0 right-0 h-8 md:h-16 bg-gradient-to-t from-gray-50 to-transparent" />
				</div>
			</AnimatedElement>

			<div className="max-w-7xl mx-auto px-4 py-8">

				{/* Products Section */}
				<div className="space-y-6">
					{/* Sorting Header */}
					<SortingHeader
						totalProducts={products.length}
						filteredProducts={filteredProducts.length}
						sortBy={sortBy}
						onSortChange={setSortBy}
						sortOptions={sortOptions}
						categoryName={category.name}
						showAdditionalInfo={true}
						isLoading={loading}
						searchInput=""
						onClearSearch={undefined}
						onResetAll={undefined}
						showClearButton={false}
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
									Try browsing other categories or return to home
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