'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	Heart,
	ShoppingCart,
	Minus,
	Plus,
	ArrowLeft,
	Star,
	ArrowRight,
	MessageCircle,
	Tag,
	Package,
	TrendingUp,
	ChevronLeft,
	ChevronRight,
	X,
	Share2,
	ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/public-api';
import { Product, Category, ProductImage, ApiProductVariant } from '@/types';
import { useProductPage, useCartOperations } from '@/hooks/useProductPage';
import ProductPricing from '@/components/ProductPricing';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { ProductQuantitySelector } from '@/components/ProductQuantitySelector';
import ProductDetailSection from '@/components/ProductDetailSection';
import ReviewCard from '@/components/ReviewCard';
import SpecificationItem from '@/components/SpecificationItem';
import RatingOverview from '@/components/RatingOverview';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { useProductCheckout } from '@/services/ProductCheckoutService';
import RichTextDisplay from '@/components/ui/RichTextDisplay';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getProductUrl } from '@/lib/utils';

interface BreadcrumbItem {
	label: string;
	href?: string;
}
import { 
	ProductImageSkeleton, 
	ProductInfoSkeleton, 
	ProductDetailsSkeleton, 
	RelatedProductsSkeleton, 
	BreadcrumbSkeleton 
} from '@/components/ProductPageSkeleton';

interface ProductPageProps {
	params: Promise<{ slug: string[] }>;
}

export default function ProductPage({ params }: ProductPageProps) {
	const [product, setProduct] = useState<Product | null>(null);
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
	const [breadcrumb, setBreadcrumb] = useState<Category[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [loading, setLoading] = useState(false); // Start with false to show skeletons immediately
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [variants, setVariants] = useState<ApiProductVariant[]>([]);
	const [isButtonsSticky, setIsButtonsSticky] = useState(false);
	const actionButtonsRef = useRef<HTMLDivElement>(null);
	const variantSelectorRef = useRef<HTMLDivElement>(null);
	const productInfoRef = useRef<HTMLDivElement>(null);
	const relatedProductsRef = useRef<HTMLDivElement>(null);
	const [staticSoldCount] = useState(Math.floor(Math.random() * 500) + 50);

	// Context hooks
	const { addItem: addToCart } = useCart();
	const { toggleItem: toggleWishlist } = useWishlist();
	const router = useRouter();
	
	// Centralized checkout service
	const { addToCart: addToCartService, buyNow } = useProductCheckout();

	// Legacy hooks (might remove these later)
	const productPageData = useProductPage(product, variants);

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [showAllImages, setShowAllImages] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [showFullDescription, setShowFullDescription] = useState(false);

	const footerRef = useRef<HTMLDivElement>(null);

	const getAllImages = useCallback((): Array<{
		url: string;
		alt: string;
		type: string;
	}> => {
		const images: Array<{ url: string; alt: string; type: string }> = [];

		if (product && product.images && product.images.length > 0) {
			product.images.forEach((image: any, index: number) => {
				if (typeof image === 'string') {
					// Legacy format: images is array of URL strings
					images.push({
						url: image,
						alt: `${product.name} - Image ${index + 1}`,
						type: 'gallery',
					});
				} else if (image && typeof image === 'object') {
					if (image.url) {
						// New API format: images is array of {id, url} objects
						images.push({
							url: image.url,
							alt: `${product.name} - Image ${index + 1}`,
							type: 'gallery',
						});
					} else if (image.file_url) {
						// Old format: images is array of ProductImage objects
						images.push({
							url: image.file_url,
							alt: image.alt_text || `${product.name} - Image ${index + 1}`,
							type: 'gallery',
						});
					}
				}
			});
		}

		// Add thumbnail if it exists and is not already in images (API uses 'thumb' field)
		if (
			product &&
			product.thumb &&
			!images.some((img) => img.url === product.thumb)
		) {
			images.unshift({
				url: product.thumb,
				alt: `${product.name} - Main Image`,
				type: 'thumbnail',
			});
		}

		// Fallback to thumbnail if no other images
		if (
			product &&
			product.thumbnail &&
			!images.some((img) => img.url === product.thumbnail)
		) {
			images.unshift({
				url: product.thumbnail,
				alt: `${product.name} - Main Image`,
				type: 'thumbnail',
			});
		}

		if (images.length === 0) {
			images.push({
				url: '/placeholder-product.svg',
				alt: product?.name || 'Product',
				type: 'placeholder',
			});
		}

		return images;
	}, [product]);

	// Keyboard navigation for image modal
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (showImageModal && product) {
				const images = getAllImages();
				if (e.key === 'Escape') {
					setShowImageModal(false);
				} else if (e.key === 'ArrowLeft') {
					setSelectedImageIndex((prev) =>
						prev === 0 ? images.length - 1 : prev - 1
					);
				} else if (e.key === 'ArrowRight') {
					setSelectedImageIndex((prev) =>
						prev === images.length - 1 ? 0 : prev + 1
					);
				}
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [showImageModal, product, getAllImages]);

	// Handle sticky buttons on mobile/tablet
	useEffect(() => {
		const handleScroll = () => {
			if (window.innerWidth >= 1024) {
				setIsButtonsSticky(false);
				return;
			}

			if (actionButtonsRef.current && productInfoRef.current) {
				const buttonsRect = actionButtonsRef.current.getBoundingClientRect();
				const productInfoRect = productInfoRef.current.getBoundingClientRect();
				const windowHeight = window.innerHeight;

				// Check if there's a related products section and if it's visible
				let isStopSectionVisible = false;
				if (relatedProductsRef.current) {
					const relatedProductsRect = relatedProductsRef.current.getBoundingClientRect();
					isStopSectionVisible = relatedProductsRect.top < windowHeight + 100; // 100px buffer
				}

				// Check if scrolling down past the buttons' original position
				const isPastButtons = productInfoRect.bottom < 0;

				if (isPastButtons && !isStopSectionVisible) {
					setIsButtonsSticky(true);
				} else {
					setIsButtonsSticky(false);
				}
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				setError(null);
				const resolvedParams = await params;
				const slugParts = resolvedParams.slug;

				// Always use the last part as the product slug
				const productSlug = slugParts[slugParts.length - 1];
				
				let productData: Product;

				try {
					productData = await publicApi.getProduct(productSlug);
				} catch (error) {
					console.error('Error fetching product:', error);
					setError('Product not found');
					return;
				}

				setProduct(productData);
				
				// Build breadcrumb from product's category hierarchy
				let breadcrumbData: Category[] = [];
				if (productData.category) {
					// Simple breadcrumb - just show the direct category
					breadcrumbData = [productData.category];
				}
				setBreadcrumb(breadcrumbData);
				setSelectedImageIndex(0);

				// Variants are now included in the product response
				if (productData.variants) {
					setVariants(productData.variants);
				} else {
					setVariants([]);
				}

				try {
					const productsResponse = await publicApi.getProducts({
						category: productData.category?.slug,
					});
					const related = productsResponse.data
						.filter((p) => p.id !== productData.id)
						.slice(0, 4);
					setRelatedProducts(related);
				} catch (error) {
					console.error('Error fetching related products:', error);
				}
			} catch (error) {
				console.error('Error in fetchProduct:', error);
				setError('Failed to load product');
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [params]);

	if (loading || (!product && !error)) {
		return (
			<div className="min-h-screen bg-white">
				<div className="max-w-7xl mx-auto px-4 py-8">
					{/* Skeleton Breadcrumb */}
					<BreadcrumbSkeleton />

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column - Product Info Skeleton (Desktop only) */}
						<div className="hidden lg:block lg:col-span-1 order-1">
							<div className="sticky top-24">
								<ProductInfoSkeleton />
							</div>
						</div>

						{/* Right Column - Product Images and Details Skeleton */}
						<div className="lg:col-span-2 order-2">
							<ProductImageSkeleton />
							
							{/* Mobile Product Info - Shows after images on mobile */}
							<div className="lg:hidden mt-8">
								<ProductInfoSkeleton />
							</div>
							
							<div className="mt-8">
								<ProductDetailsSkeleton />
							</div>
						</div>
					</div>

					{/* Related Products Skeleton */}
					<div className="mt-16">
						<RelatedProductsSkeleton />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Product Not Found
					</h1>
					<p className="text-gray-600 mb-6">
						{error || "The product you're looking for doesn't exist."}
					</p>
					<div className="space-x-4">
						<Link href="/products">
							<Button>Browse Products</Button>
						</Link>
						<Button
							variant="outline"
							onClick={() => window.history.back()}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Go Back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Null check before accessing product properties
	if (!product) {
		return (
			<div className="min-h-screen bg-white">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<BreadcrumbSkeleton />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="hidden lg:block lg:col-span-1 order-1">
							<div className="sticky top-24">
								<ProductInfoSkeleton />
							</div>
						</div>
						<div className="lg:col-span-2 order-2">
							<ProductImageSkeleton />
							<div className="lg:hidden mt-8">
								<ProductInfoSkeleton />
							</div>
							<div className="mt-8">
								<ProductDetailsSkeleton />
							</div>
						</div>
					</div>
					<div className="mt-16">
						<RelatedProductsSkeleton />
					</div>
				</div>
			</div>
		);
	}

	const price = parseFloat(product.price);
	const salePrice = product.sale_price
		? parseFloat(product.sale_price)
		: null;
	const hasDiscount = salePrice && salePrice < price;
	const finalPrice = salePrice || price;

	const getPricingAnalysis = () => {
		const allPrices: Array<{
			regular: number;
			offer: number | null;
			hasDiscount: boolean;
		}> = [];

		if (!variants || variants.length === 0) {
			allPrices.push({
				regular: price,
				offer: salePrice,
				hasDiscount: salePrice !== null && salePrice < price,
			});
		}

		if (variants && variants.length > 0) {
			variants.forEach((variant) => {
				if (!variant || !variant.final_price) return; // Safety check
				
				const variantPrice = parseFloat(variant.final_price);
				let variantOffer = null;
				let hasDiscount = false;

				if (variant.offer_price_override) {
					variantOffer = variant.final_offer_price
						? parseFloat(variant.final_offer_price)
						: null;
					hasDiscount =
						variantOffer !== null && variantOffer < variantPrice;
				} else if (!variant.price_override) {
					variantOffer = variant.final_offer_price
						? parseFloat(variant.final_offer_price)
						: null;
					hasDiscount =
						variantOffer !== null && variantOffer < variantPrice;
				}

				allPrices.push({
					regular: variantPrice,
					offer: variantOffer,
					hasDiscount,
				});
			});
		}

		if (allPrices.length === 0) return null;

		const finalPrices = allPrices.map((p) =>
			p.offer !== null ? p.offer : p.regular
		);
		
		if (finalPrices.length === 0) return null; // Safety check
		
		const minPrice = Math.min(...finalPrices);
		const maxPrice = Math.max(...finalPrices);

		const discountedPrices = allPrices.filter((p) => p.hasDiscount);
		const maxSavings =
			discountedPrices.length > 0
				? Math.max(
						...discountedPrices.map((p) => p.regular - (p.offer || 0))
				  )
				: 0;

		const hasVariedPricing = minPrice !== maxPrice;
		const hasAnyDiscounts = allPrices.some((p) => p.hasDiscount);

		return {
			minPrice,
			maxPrice,
			maxSavings,
			hasVariedPricing,
			hasAnyDiscounts,
		};
	};

	const pricingAnalysis = getPricingAnalysis();

	const allImages = getAllImages();
	const hasMultipleImages = allImages.length > 1;

	const handleQuantityChange = (change: number) => {
		if (productPageData) {
			productPageData.handleQuantityChange(change);
		} else {
			// Fallback if productPageData is not available
			const currentStock = product.stock_quantity;
			const newQuantity = Math.max(
				1,
				Math.min(currentStock, quantity + change)
			);
			setQuantity(newQuantity);
		}
	};

	const handleAddToCart = async (isDirectBuy: boolean = false) => {
		if (!product || !productPageData) return;
		
		// Ensure we can actually purchase before adding to cart
		if (!productPageData.canPurchase) {
			console.warn('Cannot add to cart: purchase not allowed');
			return;
		}

		try {
			await addToCartService(
				product.slug,
				productPageData.quantity,
				productPageData.selectedVariant?.id?.toString(),
				(item) => addToCart(item)
			);
		} catch (error) {
			console.error('Error adding to cart:', error);
		}
	};

	const handleAddToWishlist = () => {
		if (!product) return;

		// Get the first image from the product using our getAllImages helper
		const allImages = getAllImages();
		const firstImageUrl = allImages.length > 0 ? allImages[0].url : undefined;

		const wishlistItem = {
			productId: product.id.toString(),
			productName: product.name,
			productImage: firstImageUrl,
			productSlug: product.slug,
			categorySlug: product.category?.slug,
			price: parseFloat(product.price),
			salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
			inStock: productPageData?.isInStock || false,
		};

		toggleWishlist(wishlistItem);
	};

	const handleBuyNow = async () => {
		if (!product || !productPageData) return;
		
		// Ensure we can actually purchase before proceeding
		if (!productPageData.canPurchase) {
			console.warn('Cannot buy now: purchase not allowed');
			return;
		}

		try {
			const checkoutUrl = await buyNow(
				product.slug,
				productPageData.quantity,
				productPageData.selectedVariant?.id?.toString()
			);
			router.push(checkoutUrl);
		} catch (error) {
			console.error('Error with buy now:', error);
		}
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: product?.name,
					text: product?.description,
					url: window.location.href,
				})
				.catch((error) => console.log('Error sharing:', error));
		} else {
			navigator.clipboard
				.writeText(window.location.href)
				.then(() => {
					alert('Product link copied to clipboard!');
				})
				.catch((error) => {
					console.log('Error copying to clipboard:', error);
					window.open(
						`https://twitter.com/intent/tweet?url=${encodeURIComponent(
							window.location.href
						)}&text=${encodeURIComponent(product?.name || '')}`
					);
				});
		}
	};

	const handleSelectVariant = () => {
		// Scroll to the product/order info section on mobile when variants need selection
		if (productInfoRef.current) {
			productInfoRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	// Build breadcrumb items
	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: 'Products', href: '/products' },
	];

	// Add category breadcrumb items
	if (breadcrumb && breadcrumb.length > 0) {
		// Show the direct category
		breadcrumb.forEach((category) => {
			if (category && category.name && category.slug) {
				breadcrumbItems.push({
					label: category.name,
					href: `/${category.slug}` // Category page URL
				});
			}
		});
	} else if (product.category && product.category.name && product.category.slug) {
		// Fallback to product category if no breadcrumb
		breadcrumbItems.push({
			label: product.category.name,
			href: `/${product.category.slug}` // Category page URL
		});
	}

	// Add current product (no href since it's the current page)
	breadcrumbItems.push({ label: product.name });

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<Breadcrumb items={breadcrumbItems} className="mb-8" />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Product Images and Details (scrollable) */}
					<div className="lg:col-span-2 order-1">
						{/* Product Images */}
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								{allImages
									.slice(
										0,
										showAllImages ? allImages.length : 4
									)
									.map((img, index) => (
										<button
											key={index}
											onClick={() => {
												setSelectedImageIndex(index);
												setShowImageModal(true);
											}}
											className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all hover:scale-105 ${
												selectedImageIndex === index
													? 'border-blue-500 ring-2 ring-blue-200'
													: 'border-gray-200 hover:border-gray-300'
											}`}
										>
											<Image
												src={img.url}
												alt={img.alt}
												width={400}
												height={400}
												className="w-full h-full object-cover"
												priority={index < 4}
											/>
										</button>
									))}
							</div>

							{allImages.length > 4 && (
								<div className="text-center">
									<button
										onClick={() =>
											setShowAllImages(!showAllImages)
										}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										{showAllImages
											? `Show Less`
											: `Show ${allImages.length - 4} More Images`}
									</button>
								</div>
							)}
						</div>

						{/* Mobile Product/Order Info - Shows after images on mobile */}
						<div className="lg:hidden mt-8" ref={productInfoRef}>
							<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
								<div className="p-6 space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
												<Tag className="w-3 h-3" />
												<span>NEW</span>
											</div>
											{product.category?.name && (
												<div className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
													{product.category.name}
												</div>
											)}
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={handleShare}
												className="p-2 hover:bg-gray-100 rounded-full transition-colors"
												title="Share Product"
											>
												<Share2 className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
											</button>
											<button
												onClick={handleAddToWishlist}
												className="p-2 hover:bg-gray-100 rounded-full transition-colors"
												title="Add to Wishlist"
											>
												<Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
											</button>
										</div>
									</div>

									<h1 className="text-2xl font-bold text-gray-900 leading-tight">
										{product.name}
									</h1>

									{product.vendor && (
										<div className="bg-gray-50 rounded-lg p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
													{product.vendor.business_name.charAt(0)}
												</div>
												<div className="flex-1 space-y-1">
													<div className="flex items-center">
														<h3 className="font-medium text-gray-900 text-sm truncate">
															{product.vendor.business_name}
														</h3>
														<span className="text-xs text-gray-500 ml-2">
															(250)
														</span>
													</div>
													<div className="flex items-center gap-3">
														<div className="flex items-center space-x-1">
															{[...Array(5)].map((_, i) => (
																<Star
																	key={i}
																	className={`w-3 h-3 ${
																		i < 4
																			? 'text-yellow-400 fill-current'
																			: 'text-gray-300'
																	}`}
																/>
															))}
														</div>
														<button className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors flex items-center gap-1">
															<MessageCircle className="w-3 h-3" />
															Contact Seller
														</button>
													</div>
												</div>
												<button
													className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
													title="View Vendor Profile"
												>
													<ArrowRight className="w-4 h-4 text-gray-600" />
												</button>
											</div>
										</div>
									)}

									<div className="space-y-3">
										{productPageData ? (
											<ProductPricing
												pricingDisplay={productPageData.pricingDisplay}
												hasVariations={productPageData.hasVariations}
												isVariantSelected={productPageData.selectedVariant !== null}
											/>
										) : (
											<div className="animate-pulse">
												<div className="h-8 bg-gray-200 rounded"></div>
											</div>
										)}
									</div>

									{productPageData && productPageData.hasVariations && (
										<div ref={variantSelectorRef}>
											<ProductVariantSelector
												variantEngine={productPageData.variantEngine}
												selectedOptions={productPageData.selectedOptions}
												onVariantSelection={(variationName: string, valueId: string) => {
													productPageData.handleVariantSelection(variationName, valueId);
												}}
											/>
										</div>
									)}

									{productPageData && (
										<div className="bg-gray-50 rounded-lg p-3">
											<div className="flex items-center justify-between mb-2">
												{!productPageData.hasVariations || productPageData.selectedVariant ? (
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium text-gray-700">
															SKU
														</span>
														<span className="font-mono bg-white px-2 py-1 rounded text-xs text-gray-800 border">
															{productPageData.selectedVariant?.sku || product?.sku || 'N/A'}
														</span>
													</div>
												) : (
													<span className="text-sm font-medium text-gray-700">
														Availability
													</span>
												)}
												<div
													className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
														productPageData.isInStock
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													<div
														className={`w-2 h-2 rounded-full mr-1.5 ${
															productPageData.isInStock
																? 'bg-green-400'
																: 'bg-red-400'
														}`}
													></div>
													{productPageData.isInStock
														? 'In Stock'
														: 'Out of Stock'}
												</div>
											</div>
											{(!productPageData.hasVariations || productPageData.selectedVariant) && (
												<div className="flex items-center justify-end text-sm">
													<div className="flex items-center gap-1.5 text-gray-600">
														<TrendingUp className="w-4 h-4 text-green-500" />
														<span className="font-bold">{staticSoldCount}</span>
														<span className="font-medium text-green-600">Sold</span>
													</div>
												</div>
											)}
										</div>
									)}

									{productPageData && productPageData.canPurchase && (
										<ProductQuantitySelector
											quantity={productPageData.quantity}
											currentStock={productPageData.currentStock}
											staticSoldCount={staticSoldCount}
											onQuantityChange={productPageData.handleQuantityChange}
										/>
									)}

									<div
										ref={actionButtonsRef}
										className={`space-y-3 transition-all duration-300 ease-in-out ${
											isButtonsSticky
												? 'lg:static fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 opacity-100 translate-y-0 shadow-lg'
												: 'opacity-100 translate-y-0'
										}`}
									>
										{productPageData && productPageData.hasVariations && !productPageData.allVariationsSelected && (
											<button
												onClick={handleSelectVariant}
												className="flex items-center justify-center w-full p-3 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors mb-3"
											>
												<ChevronUp className="w-4 h-4 mr-2" />
												Please select all variants to proceed
											</button>
										)}
										<div className="flex gap-3">
											<Button
												onClick={handleBuyNow}
												disabled={!productPageData?.canPurchase}
												className="flex-1 py-3 text-base font-semibold bg-orange-600 hover:bg-orange-700"
											>
												Order Now
											</Button>
											<Button
												onClick={() => handleAddToCart(false)}
												disabled={!productPageData?.canPurchase}
												variant="outline"
												className="flex-1 py-3 text-base font-semibold border-blue-600 text-blue-600 hover:bg-blue-50"
											>
												<ShoppingCart className="w-4 h-4 mr-2" />
												Add to Cart
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Product Details */}
						<div className="mt-8 lg:mt-16 space-y-6 lg:space-y-16">
							<ProductDetailSection
								title="Product Description & Details"
								icon={<div className="w-3 h-3 bg-white rounded"></div>}
								gradient="bg-gradient-to-r from-blue-600 to-blue-700"
							>
								<div className="bg-gray-50 lg:bg-transparent rounded-xl p-5 lg:p-0 border border-gray-200 lg:border-0">
									<div className="prose max-w-none">
										<div className="mb-8">
											<h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
												<div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
												Description
											</h4>
											<div className="text-gray-700 text-base lg:text-lg leading-relaxed">
												{showFullDescription ? (
													<RichTextDisplay 
														content={product.description || ''} 
														textColor="gray"
													/>
												) : (
													<RichTextDisplay 
														content={
															(product.description && product.description.length > 300)
																? `${product.description.substring(0, 300)}...`
																: product.description || ''
														}
														textColor="gray"
													/>
												)}
											</div>
											{(product.description && product.description.length > 300) && (
												<button
													onClick={() =>
														setShowFullDescription(!showFullDescription)
													}
													className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
												>
													{showFullDescription ? 'Show Less' : 'Show More'}
												</button>
											)}
										</div>
										<div className="bg-white lg:bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
											<h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
												<div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
												Key Features
											</h4>
											<div className="space-y-3">
												{[
													'High-quality materials and construction',
													'Durable and long-lasting design',
													'Easy to use and maintain',
													'Excellent value for money',
												].map((feature, index) => (
													<div key={index} className="flex items-start">
														<div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
														<span className="text-gray-700 text-sm lg:text-base">
															{feature}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</ProductDetailSection>

							<ProductDetailSection
								title="Customer Reviews & Ratings"
								icon={<Star className="w-3 h-3 text-white fill-current" />}
								gradient="bg-gradient-to-r from-gray-600 to-gray-700"
							>
								<div className="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
									<div className="space-y-6">
										<RatingOverview
											rating={4.2}
											totalReviews={127}
											ratings={[
												{ rating: 5, count: 76, percentage: 60 },
												{ rating: 4, count: 32, percentage: 25 },
												{ rating: 3, count: 13, percentage: 10 },
												{ rating: 2, count: 4, percentage: 3 },
												{ rating: 1, count: 2, percentage: 2 },
											]}
										/>
										<div className="space-y-4">
											{[
												{
													id: 1,
													name: 'Sarah Johnson',
													rating: 5,
													date: '2 weeks ago',
													comment:
														'Excellent product! Exactly as described and arrived quickly. Very satisfied with my purchase.',
													verified: true,
												},
												{
													id: 2,
													name: 'Mike Chen',
													rating: 4,
													date: '1 month ago',
													comment:
														'Good quality product. Minor issue with packaging but the item itself is great.',
													verified: true,
												},
												{
													id: 3,
													name: 'Emily Davis',
													rating: 5,
													date: '2 months ago',
													comment:
														'Amazing quality and fast shipping. Highly recommend this seller!',
													verified: false,
												},
											].map((review) => (
												<ReviewCard key={review.id} review={review} />
											))}
										</div>
										<div className="text-center pt-4">
											<Button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 text-base font-semibold w-full lg:w-auto">
												Write Your Review
											</Button>
										</div>
									</div>
								</div>
							</ProductDetailSection>

							<ProductDetailSection
								title="Product Video"
								icon={
									<div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
								}
								gradient="bg-gradient-to-r from-gray-600 to-gray-700"
							>
								<div className="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
									<div className="max-w-4xl mx-auto">
										<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
											<div className="w-full h-full flex items-center justify-center">
												<div className="text-center">
													<div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
														<div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
													</div>
													<h4 className="text-lg font-bold text-gray-800 mb-2">
														Product Demo Video
													</h4>
													<p className="text-gray-600 text-sm">
														YouTube or Facebook video will be embedded here
													</p>
													<div className="mt-4 inline-flex items-center px-3 py-2 bg-gray-200 rounded-full text-xs text-gray-600">
														<div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></div>
														Ready for video embed
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</ProductDetailSection>
						</div>
					</div>

					{/* Right Column - Product/Order Info (sticky on desktop) */}
					<div className="hidden lg:block lg:col-span-1">
						<div className="sticky top-8">
							<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
								<div className="p-6 space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
												<Tag className="w-3 h-3" />
												<span>NEW</span>
											</div>
											{product.category?.name && (
												<div className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
													{product.category.name}
												</div>
											)}
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={handleShare}
												className="p-2 hover:bg-gray-100 rounded-full transition-colors"
												title="Share Product"
											>
												<Share2 className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
											</button>
											<button
												onClick={handleAddToWishlist}
												className="p-2 hover:bg-gray-100 rounded-full transition-colors"
												title="Add to Wishlist"
											>
												<Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
											</button>
										</div>
									</div>

									<h1 className="text-2xl font-bold text-gray-900 leading-tight">
										{product.name}
									</h1>

									{product.vendor && (
										<div className="bg-gray-50 rounded-lg p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
													{product.vendor.business_name.charAt(0)}
												</div>
												<div className="flex-1 space-y-1">
													<div className="flex items-center">
														<h3 className="font-medium text-gray-900 text-sm truncate">
															{product.vendor.business_name}
														</h3>
														<span className="text-xs text-gray-500 ml-2">
															(250)
														</span>
													</div>
													<div className="flex items-center gap-3">
														<div className="flex items-center space-x-1">
															{[...Array(5)].map((_, i) => (
																<Star
																	key={i}
																	className={`w-3 h-3 ${
																		i < 4
																			? 'text-yellow-400 fill-current'
																			: 'text-gray-300'
																	}`}
																/>
															))}
														</div>
														<button className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors flex items-center gap-1">
															<MessageCircle className="w-3 h-3" />
															Contact Seller
														</button>
													</div>
												</div>
												<button
													className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
													title="View Vendor Profile"
												>
													<ArrowRight className="w-4 h-4 text-gray-600" />
												</button>
											</div>
										</div>
									)}

									<div className="space-y-3">
										{productPageData ? (
											<ProductPricing
												pricingDisplay={productPageData.pricingDisplay}
												hasVariations={productPageData.hasVariations}
												isVariantSelected={productPageData.selectedVariant !== null}
											/>
										) : (
											<div className="animate-pulse">
												<div className="h-8 bg-gray-200 rounded"></div>
											</div>
										)}
									</div>

									{productPageData && productPageData.hasVariations && (
										<div ref={variantSelectorRef}>
											<ProductVariantSelector
												variantEngine={productPageData.variantEngine}
												selectedOptions={productPageData.selectedOptions}
												onVariantSelection={(variationName: string, valueId: string) => {
													productPageData.handleVariantSelection(variationName, valueId);
												}}
											/>
										</div>
									)}

									{productPageData && (
										<div className="bg-gray-50 rounded-lg p-3">
											<div className="flex items-center justify-between mb-2">
												{!productPageData.hasVariations || productPageData.selectedVariant ? (
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium text-gray-700">
															SKU
														</span>
														<span className="font-mono bg-white px-2 py-1 rounded text-xs text-gray-800 border">
															{productPageData.selectedVariant?.sku || product?.sku || 'N/A'}
														</span>
													</div>
												) : (
													<span className="text-sm font-medium text-gray-700">
														Availability
													</span>
												)}
												<div
													className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
														productPageData.isInStock
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													<div
														className={`w-2 h-2 rounded-full mr-1.5 ${
															productPageData.isInStock
																? 'bg-green-400'
																: 'bg-red-400'
														}`}
													></div>
													{productPageData.isInStock
														? 'In Stock'
														: 'Out of Stock'}
												</div>
											</div>
											{(!productPageData.hasVariations || productPageData.selectedVariant) && (
												<div className="flex items-center justify-end text-sm">
													<div className="flex items-center gap-1.5 text-gray-600">
														<TrendingUp className="w-4 h-4 text-green-500" />
														<span className="font-bold">{staticSoldCount}</span>
														<span className="font-medium text-green-600">Sold</span>
													</div>
												</div>
											)}
										</div>
									)}

									{productPageData && productPageData.canPurchase && (
										<ProductQuantitySelector
											quantity={productPageData.quantity}
											currentStock={productPageData.currentStock}
											staticSoldCount={staticSoldCount}
											onQuantityChange={productPageData.handleQuantityChange}
										/>
									)}

									<div ref={actionButtonsRef} className="space-y-3">
										{productPageData && productPageData.hasVariations && !productPageData.allVariationsSelected && (
											<button
												onClick={handleSelectVariant}
												className="flex items-center justify-center w-full p-3 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors lg:hidden"
											>
												<ChevronUp className="w-4 h-4 mr-2" />
												Please select all variants to proceed
											</button>
										)}
										<div className="flex gap-3">
											<Button
												onClick={handleBuyNow}
												disabled={!productPageData?.canPurchase}
												className="flex-1 py-3 text-base font-semibold bg-orange-600 hover:bg-orange-700"
											>
												Order Now
											</Button>
											<Button
												onClick={() => handleAddToCart(false)}
												disabled={!productPageData?.canPurchase}
												variant="outline"
												className="flex-1 py-3 text-base font-semibold border-blue-600 text-blue-600 hover:bg-blue-50"
											>
												<ShoppingCart className="w-4 h-4 mr-2" />
												Add to Cart
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{relatedProducts.length > 0 && (
					<div ref={relatedProductsRef} className="mt-16 animate-in slide-in-from-bottom-4 duration-700"
						 style={{ animationDelay: '600ms' }}>
						<h3 className="text-2xl font-bold text-gray-900 mb-8 transform transition-all duration-500"
							style={{ animationDelay: '700ms' }}>
							Related Products
						</h3>
						<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 transform transition-all duration-500"
							 style={{ animationDelay: '800ms' }}>
							{relatedProducts.map((relatedProduct) => (
								<Link
									key={relatedProduct.id}
									href={getProductUrl(relatedProduct)}
									className="group"
								>
									<div className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
										<div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
											<Image
												src={relatedProduct.thumbnail || '/placeholder-product.svg'}
												alt={relatedProduct.name}
												width={300}
												height={300}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform"
											/>
										</div>
										<div className="p-3 lg:p-4">
											<h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm lg:text-base">
												{relatedProduct.name}
											</h4>
											<div className="flex items-center justify-between">
												<span className="text-base lg:text-lg font-bold text-gray-900">
													BDT{' '}
													{parseFloat(
														relatedProduct.sale_price || relatedProduct.price
													).toFixed(2)}
												</span>
												{relatedProduct.sale_price && (
													<span className="text-sm text-gray-500 line-through">
														BDT {parseFloat(relatedProduct.price).toFixed(2)}
													</span>
												)}
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>

			<div ref={footerRef} className="h-16 bg-gray-100"></div>

			{showImageModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
					<div className="relative max-w-4xl max-h-screen p-4">
						<button
							onClick={() => setShowImageModal(false)}
							className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
						>
							<X className="w-5 h-5" />
						</button>
						<Image
							src={allImages[selectedImageIndex]?.url}
							alt={allImages[selectedImageIndex]?.alt}
							width={800}
							height={800}
							className="max-w-full max-h-full object-contain rounded-lg"
						/>
						{allImages.length > 1 && (
							<>
								<button
									onClick={() =>
										setSelectedImageIndex((prev) =>
											prev === 0 ? allImages.length - 1 : prev - 1
										)
									}
									className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
								>
									<ChevronLeft className="w-6 h-6" />
								</button>
								<button
									onClick={() =>
										setSelectedImageIndex((prev) =>
											prev === allImages.length - 1 ? 0 : prev + 1
										)
									}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
								>
									<ChevronRight className="w-6 h-6" />
								</button>
							</>
						)}
					</div>
				</div>
			)}
			
			{/* Sticky action buttons for mobile */}
			{isButtonsSticky && productPageData && (
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 lg:hidden">
					<div className="flex gap-3">
						<Button
							onClick={handleBuyNow}
							disabled={!productPageData.canPurchase}
							className="flex-1 py-3 text-base font-semibold bg-orange-600 hover:bg-orange-700"
						>
							Order Now
						</Button>
						<Button
							onClick={() => handleAddToCart(false)}
							disabled={!productPageData.canPurchase}
							variant="outline"
							className="flex-1 py-3 text-base font-semibold border-blue-600 text-blue-600 hover:bg-blue-50"
						>
							<ShoppingCart className="w-4 h-4 mr-2" />
							Add to Cart
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}