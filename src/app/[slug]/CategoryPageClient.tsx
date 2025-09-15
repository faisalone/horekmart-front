'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

	// Sort options for custom select
	const sortOptions = [
		{ value: 'featured', label: '⭐ Featured Items' },
		{ value: 'price-low', label: '💰 Price: Low to High' },
		{ value: 'price-high', label: '💎 Price: High to Low' },
		{ value: 'name', label: '🔤 Name A-Z' },
		{ value: 'newest', label: '🆕 Newest First' }
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
					<p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
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
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<Breadcrumb items={breadcrumbItems} className="mb-6" />

				{/* Category Header */}
				<AnimatedElement animation="fadeIn" delay={100}>
					<div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
						<div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
							{/* Category Image */}
							{category.image_url && (
								<div className="flex-shrink-0">
									<div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-theme-secondary/10 to-theme-primary/10 border-4 border-white shadow-lg">
										<Image
											src={category.image_url}
											alt={category.name}
											width={160}
											height={160}
											className="w-full h-full object-cover"
											priority
										/>
									</div>
								</div>
							)}

							{/* Category Info */}
							<div className="flex-1 space-y-4">
								<div>
									<h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
										{category.name}
									</h1>
									{category.description && (
										<p className="text-lg text-gray-600 leading-relaxed">
											{category.description}
										</p>
									)}
								</div>

								<div className="flex flex-wrap items-center gap-4 pt-4">
									<div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-theme-secondary/10 to-theme-primary/10 text-theme-secondary-dark rounded-full font-medium">
										<span className="w-2 h-2 bg-theme-secondary rounded-full mr-2"></span>
										{filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Available
									</div>
								</div>
							</div>
						</div>
					</div>
				</AnimatedElement>

				{/* Products Section */}
				<div className="space-y-6">
					{/* Sorting Header */}
					<AnimatedElement animation="fadeIn" delay={200}>
						<div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<h2 className="text-xl font-bold text-gray-900">
										Products
									</h2>
									<span className="text-sm text-gray-500">
										({filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''})
									</span>
								</div>

								{/* Sort Dropdown */}
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-gray-700 hidden sm:block">
										Sort by:
									</span>
									<ListDropdown
										options={sortOptions}
										value={sortBy}
										onValueChange={setSortBy}
										placeholder="Sort products..."
										className="w-full sm:w-48"
									/>
								</div>
							</div>
						</div>
					</AnimatedElement>

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